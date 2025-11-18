import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES } from '@escrow/shared';

export const getPayoutStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { reference } = z.object({ reference: z.string() }).parse(req.params);

    const payout = await prisma.payout.findUnique({
      where: { reference },
      include: {
        escrow: {
          include: {
            buyer: { select: { id: true, name: true } },
            seller: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!payout) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Payout not found', 404);
    }

    // Check permissions
    if (
      payout.escrow.buyerId !== user.id &&
      payout.escrow.sellerId !== user.id &&
      user.role !== 'admin'
    ) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
    }

    res.json({ payout });
  } catch (error) {
    logger.error('Get payout status error:', error);
    throw error;
  }
};

