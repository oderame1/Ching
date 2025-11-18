import { Request, Response } from 'express';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES, EscrowState, PaymentStatus, generateReference } from '@escrow/shared';
import * as paystackService from '../services/paystack';
import * as monnifyService from '../services/monnify';

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;

    if (!signature) {
      throw new AppError(ERROR_CODES.WEBHOOK_INVALID, 'Missing signature', 401);
    }

    // Verify signature
    const rawBody = JSON.stringify(req.body);
    const isValid = paystackService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      throw new AppError(ERROR_CODES.WEBHOOK_INVALID, 'Invalid signature', 401);
    }

    const event = req.body.event;
    const data = req.body.data;

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        type: event === 'charge.success' ? 'paystack_payment_success' : 'paystack_payment_failed',
        gateway: 'paystack',
        payload: req.body,
        signature,
      },
    });

    // Process successful payment
    if (event === 'charge.success') {
      const reference = data.reference;

      // Find payment
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: { escrow: true },
      });

      if (!payment) {
        logger.warn(`Payment not found for reference: ${reference}`);
        return res.status(200).json({ received: true });
      }

      // Idempotency check - already processed
      if (payment.status === PaymentStatus.COMPLETED) {
        logger.info(`Payment already processed: ${reference}`);
        return res.status(200).json({ received: true });
      }

      // Verify payment with Paystack
      const verification = await paystackService.verifyPayment(reference);

      if (!verification.data.status) {
        logger.error(`Payment verification failed: ${reference}`);
        return res.status(200).json({ received: true });
      }

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          gatewayResponse: verification.data,
        },
      });

      // Update escrow
      await prisma.escrow.update({
        where: { id: payment.escrowId },
        data: {
          state: EscrowState.PAID,
          paidAt: new Date(),
        },
      });

      // Create transaction
      await prisma.transaction.create({
        data: {
          escrowId: payment.escrowId,
          type: 'payment',
          amount: payment.amount,
          currency: payment.currency,
          status: 'completed',
          reference: generateReference('TXN'),
          gateway: payment.gateway,
          gatewayResponse: verification.data,
          processedAt: new Date(),
        },
      });

      // Mark webhook as processed
      await prisma.webhookEvent.updateMany({
        where: {
          gateway: 'paystack',
          payload: { path: ['data', 'reference'], equals: reference },
          isProcessed: false,
        },
        data: {
          isProcessed: true,
          processedAt: new Date(),
        },
      });

      logger.info(`Payment processed: ${reference} for escrow ${payment.escrowId}`);

      // TODO: Queue notification jobs
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Paystack webhook error:', error);
    // Still return 200 to prevent webhook retries
    res.status(200).json({ received: true, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const handleMonnifyWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['monnify-signature'] as string;

    if (!signature) {
      throw new AppError(ERROR_CODES.WEBHOOK_INVALID, 'Missing signature', 401);
    }

    // Verify signature
    const rawBody = JSON.stringify(req.body);
    const isValid = monnifyService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      throw new AppError(ERROR_CODES.WEBHOOK_INVALID, 'Invalid signature', 401);
    }

    const eventType = req.body.eventType;
    const eventData = req.body.eventData;

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        type:
          eventType === 'SUCCESSFUL_TRANSACTION'
            ? 'monnify_payment_success'
            : 'monnify_payment_failed',
        gateway: 'monnify',
        payload: req.body,
        signature,
      },
    });

    // Process successful payment
    if (eventType === 'SUCCESSFUL_TRANSACTION') {
      const paymentReference = eventData.paymentReference;

      // Find payment
      const payment = await prisma.payment.findUnique({
        where: { reference: paymentReference },
        include: { escrow: true },
      });

      if (!payment) {
        logger.warn(`Payment not found for reference: ${paymentReference}`);
        return res.status(200).json({ received: true });
      }

      // Idempotency check
      if (payment.status === PaymentStatus.COMPLETED) {
        logger.info(`Payment already processed: ${paymentReference}`);
        return res.status(200).json({ received: true });
      }

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          gatewayResponse: eventData,
        },
      });

      // Update escrow
      await prisma.escrow.update({
        where: { id: payment.escrowId },
        data: {
          state: EscrowState.PAID,
          paidAt: new Date(),
        },
      });

      // Create transaction
      await prisma.transaction.create({
        data: {
          escrowId: payment.escrowId,
          type: 'payment',
          amount: payment.amount,
          currency: payment.currency,
          status: 'completed',
          reference: generateReference('TXN'),
          gateway: payment.gateway,
          gatewayResponse: eventData,
          processedAt: new Date(),
        },
      });

      // Mark webhook as processed
      await prisma.webhookEvent.updateMany({
        where: {
          gateway: 'monnify',
          payload: { path: ['eventData', 'paymentReference'], equals: paymentReference },
          isProcessed: false,
        },
        data: {
          isProcessed: true,
          processedAt: new Date(),
        },
      });

      logger.info(`Payment processed: ${paymentReference} for escrow ${payment.escrowId}`);

      // TODO: Queue notification jobs
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Monnify webhook error:', error);
    res.status(200).json({ received: true, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};


