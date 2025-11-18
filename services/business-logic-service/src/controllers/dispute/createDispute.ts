import { Request, Response } from 'express';
import { createDispute, getEscrowById, updateEscrowStatus } from '../../database/escrow';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authenticateToken';

const createDisputeSchema = z.object({
  escrow_id: z.string().uuid(),
  reason: z.string().min(10),
  description: z.string().min(20),
  evidence_urls: z.array(z.string().url()).optional(),
});

export const createDisputeController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = createDisputeSchema.parse(req.body);
    
    // Verify escrow exists and user has access
    const escrow = await getEscrowById(data.escrow_id);
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (escrow.buyer_id !== userId && escrow.seller_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (escrow.status === 'completed' || escrow.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot dispute completed or cancelled escrow' });
    }

    // Create dispute
    const dispute = await createDispute({
      escrow_id: data.escrow_id,
      raised_by: userId,
      reason: data.reason,
      description: data.description,
      evidence_urls: data.evidence_urls || [],
    });

    // Update escrow status to disputed
    await updateEscrowStatus(data.escrow_id, 'disputed');
    
    // Publish events
    await publishEvent('dispute.created', {
      dispute_id: dispute.id,
      escrow_id: data.escrow_id,
      raised_by: userId,
    });

    await publishEvent('notification.dispute.created', {
      dispute_id: dispute.id,
      escrow_id: data.escrow_id,
    });
    
    logger.info(`Dispute ${dispute.id} created for escrow ${data.escrow_id}`);
    
    res.status(201).json(dispute);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Create dispute error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

