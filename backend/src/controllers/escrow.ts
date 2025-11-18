import { Response } from 'express';
import { z } from 'zod';
import { amountSchema, currencySchema, escrowIdSchema } from '@escrow/shared';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES, canTransition, EscrowState } from '@escrow/shared';
import { addDays } from '@escrow/shared';

const initiateEscrowSchema = z.object({
  counterpartyId: z.string().uuid('Invalid counterparty ID'),
  amount: amountSchema,
  currency: currencySchema.default('NGN'),
  description: z.string().min(1, 'Description is required'),
  expiresInDays: z.number().int().positive().max(30).optional().default(7),
});

export const initiateEscrow = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const data = initiateEscrowSchema.parse(req.body);

    // Ensure user is not creating escrow with themselves
    if (data.counterpartyId === user.id) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, 'Cannot create escrow with yourself', 400);
    }

    // Verify counterparty exists
    const counterparty = await prisma.user.findUnique({
      where: { id: data.counterpartyId },
    });

    if (!counterparty) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Counterparty not found', 404);
    }

    // Determine buyer and seller based on initiator
    const initiatorRole = user.role;
    let buyerId: string;
    let sellerId: string;

    if (initiatorRole === 'buyer') {
      buyerId = user.id;
      sellerId = data.counterpartyId;
    } else if (initiatorRole === 'seller') {
      buyerId = data.counterpartyId;
      sellerId = user.id;
    } else {
      // Admin or other roles - default to user as buyer
      buyerId = user.id;
      sellerId = data.counterpartyId;
    }

    const expiresAt = addDays(new Date(), data.expiresInDays);

    const escrow = await prisma.escrow.create({
      data: {
        buyerId,
        sellerId,
        initiator: initiatorRole === 'buyer' ? 'buyer' : 'seller',
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        state: EscrowState.PENDING,
        expiresAt,
      },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        seller: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Transition to waiting for payment
    await prisma.escrow.update({
      where: { id: escrow.id },
      data: { state: EscrowState.WAITING_FOR_PAYMENT },
    });

    logger.info(`Escrow created: ${escrow.id} by ${user.id}`);

    res.status(201).json({
      escrow: {
        ...escrow,
        state: EscrowState.WAITING_FOR_PAYMENT,
      },
    });
  } catch (error) {
    logger.error('Initiate escrow error:', error);
    throw error;
  }
};

export const getEscrow = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = z.object({ id: escrowIdSchema }).parse(req.params);

    const escrow = await prisma.escrow.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        seller: { select: { id: true, name: true, email: true, phone: true } },
        payments: true,
        transactions: true,
        payout: true,
      },
    });

    if (!escrow) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Escrow not found', 404);
    }

    // Check permissions
    if (escrow.buyerId !== user.id && escrow.sellerId !== user.id && user.role !== 'admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
    }

    res.json({ escrow });
  } catch (error) {
    logger.error('Get escrow error:', error);
    throw error;
  }
};

export const cancelEscrow = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = z.object({ id: escrowIdSchema }).parse(req.params);
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);

    const escrow = await prisma.escrow.findUnique({
      where: { id },
    });

    if (!escrow) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Escrow not found', 404);
    }

    // Check permissions
    if (escrow.buyerId !== user.id && escrow.sellerId !== user.id && user.role !== 'admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
    }

    // Check if cancellation is allowed
    if (!canTransition(escrow.state, EscrowState.CANCELLED)) {
      throw new AppError(
        ERROR_CODES.ESCROW_STATE_INVALID,
        `Cannot cancel escrow in ${escrow.state} state`,
        400
      );
    }

    const updated = await prisma.escrow.update({
      where: { id },
      data: {
        state: EscrowState.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: user.id,
        cancellationReason: reason,
      },
    });

    logger.info(`Escrow cancelled: ${id} by ${user.id}`);

    res.json({ escrow: updated });
  } catch (error) {
    logger.error('Cancel escrow error:', error);
    throw error;
  }
};

export const markDelivered = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = z.object({ id: escrowIdSchema }).parse(req.params);

    const escrow = await prisma.escrow.findUnique({
      where: { id },
    });

    if (!escrow) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Escrow not found', 404);
    }

    // Only seller can mark as delivered
    if (escrow.sellerId !== user.id && user.role !== 'admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Only seller can mark as delivered', 403);
    }

    if (!canTransition(escrow.state, EscrowState.DELIVERED)) {
      throw new AppError(
        ERROR_CODES.ESCROW_STATE_INVALID,
        `Cannot mark delivered in ${escrow.state} state`,
        400
      );
    }

    const updated = await prisma.escrow.update({
      where: { id },
      data: {
        state: EscrowState.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    logger.info(`Escrow marked delivered: ${id} by ${user.id}`);

    res.json({ escrow: updated });
  } catch (error) {
    logger.error('Mark delivered error:', error);
    throw error;
  }
};

export const markReceived = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = z.object({ id: escrowIdSchema }).parse(req.params);

    const escrow = await prisma.escrow.findUnique({
      where: { id },
    });

    if (!escrow) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Escrow not found', 404);
    }

    // Only buyer can mark as received
    if (escrow.buyerId !== user.id && user.role !== 'admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Only buyer can mark as received', 403);
    }

    if (!canTransition(escrow.state, EscrowState.RECEIVED)) {
      throw new AppError(
        ERROR_CODES.ESCROW_STATE_INVALID,
        `Cannot mark received in ${escrow.state} state`,
        400
      );
    }

    const updated = await prisma.escrow.update({
      where: { id },
      data: {
        state: EscrowState.RECEIVED,
        receivedAt: new Date(),
      },
    });

    logger.info(`Escrow marked received: ${id} by ${user.id}`);

    res.json({ escrow: updated });
  } catch (error) {
    logger.error('Mark received error:', error);
    throw error;
  }
};

