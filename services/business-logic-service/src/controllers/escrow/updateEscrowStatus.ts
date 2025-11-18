import { Request, Response } from 'express';
import { updateEscrowStatus, getEscrowById } from '../../database/escrow';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authenticateToken';

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'funded', 'in_progress', 'completed', 'cancelled', 'disputed']),
});

export const updateEscrowStatusController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);
    const userId = req.user!.userId;
    
    const escrow = await getEscrowById(id);
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    // Verify user has permission
    if (escrow.buyer_id !== userId && escrow.seller_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await updateEscrowStatus(id, status);
    
    // Publish event
    await publishEvent('escrow.status.updated', {
      escrow_id: id,
      status: status,
      updated_by: userId,
    });
    
    logger.info(`Escrow ${id} status updated to ${status}`);
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Update escrow status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

