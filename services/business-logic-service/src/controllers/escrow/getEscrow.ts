import { Request, Response } from 'express';
import { getEscrowById } from '../../database/escrow';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';

export const getEscrowController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const escrow = await getEscrowById(id);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    // Verify user has access to this escrow
    if (escrow.buyer_id !== userId && escrow.seller_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(escrow);
  } catch (error) {
    logger.error('Get escrow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

