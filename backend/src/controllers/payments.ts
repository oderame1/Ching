import { Response } from 'express';
import { z } from 'zod';
import { escrowIdSchema } from '@escrow/shared';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES, EscrowState, PaymentStatus } from '@escrow/shared';
import * as paystackService from '../services/paystack';
import * as monnifyService from '../services/monnify';

const initializePaymentSchema = z.object({
  escrowId: escrowIdSchema,
  gateway: z.enum(['paystack', 'monnify']),
  callbackUrl: z.string().url().optional(),
});

export const initializePayment = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const data = initializePaymentSchema.parse(req.body);

    const escrow = await prisma.escrow.findUnique({
      where: { id: data.escrowId },
      include: { buyer: true, payments: true },
    });

    if (!escrow) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Escrow not found', 404);
    }

    // Only buyer can pay
    if (escrow.buyerId !== user.id && user.role !== 'admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Only buyer can initiate payment', 403);
    }

    // Check escrow state
    if (escrow.state !== EscrowState.WAITING_FOR_PAYMENT) {
      throw new AppError(
        ERROR_CODES.ESCROW_STATE_INVALID,
        `Payment can only be initiated when escrow is in waiting_for_payment state`,
        400
      );
    }

    // Check for existing pending payment
    const existingPayment = escrow.payments.find(
      (p) => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.INITIALIZED
    );

    if (existingPayment) {
      throw new AppError(ERROR_CODES.CONFLICT, 'Payment already initiated', 409);
    }

    // Generate payment reference
    const reference = `${data.gateway.toUpperCase()}-${escrow.id.slice(0, 8)}-${Date.now()}`;

    // Initialize payment with gateway
    let gatewayResponse: any;
    if (data.gateway === 'paystack') {
      const result = await paystackService.initializePayment({
        email: escrow.buyer.email,
        amount: Number(escrow.amount),
        reference,
        callbackUrl: data.callbackUrl,
        metadata: {
          escrowId: escrow.id,
          buyerId: escrow.buyerId,
          sellerId: escrow.sellerId,
        },
      });
      gatewayResponse = result;
    } else {
      const result = await monnifyService.initializePayment({
        email: escrow.buyer.email,
        amount: Number(escrow.amount),
        currency: escrow.currency,
        paymentReference: reference,
        customerName: escrow.buyer.name,
        callbackUrl: data.callbackUrl,
        metadata: {
          escrowId: escrow.id,
          buyerId: escrow.buyerId,
          sellerId: escrow.sellerId,
        },
      });
      gatewayResponse = result;
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        escrowId: escrow.id,
        amount: escrow.amount,
        currency: escrow.currency,
        gateway: data.gateway,
        reference,
        status: PaymentStatus.INITIALIZED,
        gatewayResponse,
      },
    });

    // Update escrow with payment reference
    await prisma.escrow.update({
      where: { id: escrow.id },
      data: {
        paymentReference: reference,
        paymentGateway: data.gateway,
      },
    });

    logger.info(`Payment initialized: ${reference} for escrow ${escrow.id}`);

    res.json({
      payment,
      paymentUrl:
        data.gateway === 'paystack'
          ? gatewayResponse.data.authorization_url
          : gatewayResponse.responseBody.checkoutUrl,
    });
  } catch (error) {
    logger.error('Initialize payment error:', error);
    throw error;
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { reference } = z.object({ reference: z.string() }).parse(req.params);

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: {
        escrow: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
            seller: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Payment not found', 404);
    }

    // Check permissions
    if (
      payment.escrow.buyerId !== user.id &&
      payment.escrow.sellerId !== user.id &&
      user.role !== 'admin'
    ) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
    }

    res.json({ payment });
  } catch (error) {
    logger.error('Get payment status error:', error);
    throw error;
  }
};

