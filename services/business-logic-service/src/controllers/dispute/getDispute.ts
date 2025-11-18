import { Request, Response } from 'express';
import { getDisputeById, getEscrowById } from '../../database/escrow';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';

export const getDisputeController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const dispute = await getDisputeById(id);
    
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    // Verify user has access
    const escrow = await getEscrowById(dispute.escrow_id);
    if (!escrow || (escrow.buyer_id !== userId && escrow.seller_id !== userId && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(dispute);
  } catch (error) {
    logger.error('Get dispute error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

