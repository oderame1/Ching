import { Request, Response } from 'express';
import { updateDispute, getDisputeById } from '../../database/escrow';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authenticateToken';

const updateDisputeSchema = z.object({
  status: z.enum(['open', 'under_review', 'resolved']).optional(),
  admin_notes: z.string().optional(),
});

export const updateDisputeController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateDisputeSchema.parse(req.body);
    const userId = req.user!.userId;
    
    const dispute = await getDisputeById(id);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    // Only admin can update status and notes
    if (req.user!.role !== 'admin' && (data.status || data.admin_notes)) {
      return res.status(403).json({ error: 'Only admin can update dispute status' });
    }

    const updated = await updateDispute(id, data);
    
    // Publish event
    await publishEvent('dispute.updated', {
      dispute_id: id,
      updated_by: userId,
      changes: data,
    });
    
    logger.info(`Dispute ${id} updated by ${userId}`);
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Update dispute error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

