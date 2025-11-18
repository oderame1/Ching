import { Response } from 'express';
import { z } from 'zod';
import { escrowIdSchema } from '@escrow/shared';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES, EscrowState, TransactionStatus } from '@escrow/shared';
import { generateReference } from '@escrow/shared';

export const getEscrows = async (req: AuthRequest, res: Response) => {
  try {
    const {
      state,
      page = 1,
      limit = 20,
    } = z
      .object({
        state: z.nativeEnum(EscrowState).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
      })
      .parse(req.query);

    const skip = (page - 1) * limit;

    const where = state ? { state } : {};

    const [escrows, total] = await Promise.all([
      prisma.escrow.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, email: true, phone: true } },
          seller: { select: { id: true, name: true, email: true, phone: true } },
          payments: true,
          payout: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.escrow.count({ where }),
    ]);

    res.json({
      escrows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get escrows error:', error);
    throw error;
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      role,
      page = 1,
      limit = 20,
    } = z
      .object({
        role: z.enum(['buyer', 'seller', 'admin']).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
      })
      .parse(req.query);

    const skip = (page - 1) * limit;

    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    throw error;
  }
};

export const releaseEscrow = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = z.object({ id: escrowIdSchema }).parse(req.params);

    const escrow = await prisma.escrow.findUnique({
      where: { id },
      include: { seller: true, payout: true },
    });

    if (!escrow) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Escrow not found', 404);
    }

    if (escrow.state !== EscrowState.RECEIVED) {
      throw new AppError(
        ERROR_CODES.ESCROW_STATE_INVALID,
        `Can only release escrow in received state. Current state: ${escrow.state}`,
        400
      );
    }

    // Check for existing payout
    if (escrow.payout) {
      throw new AppError(ERROR_CODES.CONFLICT, 'Payout already initiated', 409);
    }

    // Create payout record (actual payout processed by worker)
    const payout = await prisma.payout.create({
      data: {
        escrowId: escrow.id,
        amount: escrow.amount,
        currency: escrow.currency,
        recipientAccount: escrow.seller.phone, // Placeholder - should be actual bank account
        recipientBank: 'MONNIFY', // Placeholder
        recipientName: escrow.seller.name,
        gateway: 'monnify', // Default
        reference: generateReference('PAYOUT'),
        status: TransactionStatus.PENDING,
      },
    });

    // Update escrow state
    await prisma.escrow.update({
      where: { id },
      data: {
        state: EscrowState.RELEASED,
        releasedAt: new Date(),
      },
    });

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        userId: user.id,
        action: 'release_escrow',
        resource: 'escrow',
        resourceId: escrow.id,
        details: { payoutId: payout.id },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Escrow released: ${id} by admin ${user.id}`);

    // TODO: Queue payout job

    res.json({ escrow, payout });
  } catch (error) {
    logger.error('Release escrow error:', error);
    throw error;
  }
};

export const refundEscrow = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = z.object({ id: escrowIdSchema }).parse(req.params);
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);

    const escrow = await prisma.escrow.findUnique({
      where: { id },
      include: { buyer: true, payments: true },
    });

    if (!escrow) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Escrow not found', 404);
    }

    // Only refund if in paid or delivered state
    if (![EscrowState.PAID, EscrowState.DELIVERED].includes(escrow.state)) {
      throw new AppError(
        ERROR_CODES.ESCROW_STATE_INVALID,
        `Can only refund escrow in paid or delivered state. Current state: ${escrow.state}`,
        400
      );
    }

    // Find completed payment
    const payment = escrow.payments.find((p) => p.status === 'completed');

    if (!payment) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'No completed payment found', 404);
    }

    // Cancel escrow
    await prisma.escrow.update({
      where: { id },
      data: {
        state: EscrowState.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: user.id,
        cancellationReason: reason || 'Admin refund',
      },
    });

    // Create refund transaction (actual refund processed by worker)
    await prisma.transaction.create({
      data: {
        escrowId: escrow.id,
        type: 'refund',
        amount: escrow.amount,
        currency: escrow.currency,
        status: TransactionStatus.PENDING,
        reference: generateReference('REFUND'),
        gateway: payment.gateway,
      },
    });

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        userId: user.id,
        action: 'refund_escrow',
        resource: 'escrow',
        resourceId: escrow.id,
        details: { reason, paymentId: payment.id },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Escrow refunded: ${id} by admin ${user.id}`);

    // TODO: Queue refund job

    res.json({ message: 'Refund initiated successfully' });
  } catch (error) {
    logger.error('Refund escrow error:', error);
    throw error;
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      resource,
      resourceId,
      page = 1,
      limit = 20,
    } = z
      .object({
        resource: z.string().optional(),
        resourceId: z.string().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
      })
      .parse(req.query);

    const skip = (page - 1) * limit;

    const where: any = {};
    if (resource) where.resource = resource;
    if (resourceId) where.resourceId = resourceId;

    const [logs, total] = await Promise.all([
      prisma.auditTrail.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditTrail.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get audit logs error:', error);
    throw error;
  }
};

