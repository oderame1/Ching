import { Job } from 'bullmq';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { EscrowState } from '@escrow/shared';

export const autoCancelExpiredEscrowProcessor = async (job: Job) => {
  logger.info('Checking for expired escrows...');

  try {
    const now = new Date();

    // Find expired escrows that are still waiting for payment
    const expiredEscrows = await prisma.escrow.findMany({
      where: {
        state: EscrowState.WAITING_FOR_PAYMENT,
        expiresAt: {
          lt: now,
        },
      },
    });

    logger.info(`Found ${expiredEscrows.length} expired escrows`);

    for (const escrow of expiredEscrows) {
      await prisma.escrow.update({
        where: { id: escrow.id },
        data: {
          state: EscrowState.EXPIRED,
          cancelledAt: now,
          cancellationReason: 'Expired - payment not completed within time limit',
        },
      });

      logger.info(`Cancelled expired escrow: ${escrow.id}`);

      // TODO: Queue notification jobs
    }

    return { success: true, cancelled: expiredEscrows.length };
  } catch (error) {
    logger.error('Auto-cancel expired escrow error:', error);
    throw error;
  }
};

