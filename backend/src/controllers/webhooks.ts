import { Request, Response } from 'express';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES, EscrowState, PaymentStatus, generateReference } from '@escrow/shared';
import * as paystackService from '../services/paystack';
import * as flutterwaveService from '../services/flutterwave';

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

export const handleFlutterwaveWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['verif-hash'] as string;

    if (!signature) {
      throw new AppError(ERROR_CODES.WEBHOOK_INVALID, 'Missing signature', 401);
    }

    // Verify signature
    const rawBody = JSON.stringify(req.body);
    const isValid = flutterwaveService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      throw new AppError(ERROR_CODES.WEBHOOK_INVALID, 'Invalid signature', 401);
    }

    const event = req.body.event;
    const data = req.body.data;

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        type:
          event === 'charge.completed' && data.status === 'successful'
            ? 'flutterwave_payment_success'
            : 'flutterwave_payment_failed',
        gateway: 'flutterwave',
        payload: req.body,
        signature,
      },
    });

    // Process successful payment
    if (event === 'charge.completed' && data.status === 'successful') {
      const txRef = data.tx_ref;

      // Find payment
      const payment = await prisma.payment.findUnique({
        where: { reference: txRef },
        include: { escrow: true },
      });

      if (!payment) {
        logger.warn(`Payment not found for reference: ${txRef}`);
        return res.status(200).json({ received: true });
      }

      // Idempotency check
      if (payment.status === PaymentStatus.COMPLETED) {
        logger.info(`Payment already processed: ${txRef}`);
        return res.status(200).json({ received: true });
      }

      // Verify payment with Flutterwave
      const verification = await flutterwaveService.verifyPayment(txRef);

      if (verification.status !== 'success') {
        logger.error(`Payment verification failed: ${txRef}`);
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
          gateway: 'flutterwave',
          payload: { path: ['data', 'tx_ref'], equals: txRef },
          isProcessed: false,
        },
        data: {
          isProcessed: true,
          processedAt: new Date(),
        },
      });

      logger.info(`Payment processed: ${txRef} for escrow ${payment.escrowId}`);

      // TODO: Queue notification jobs
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Flutterwave webhook error:', error);
    res.status(200).json({ received: true, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};


