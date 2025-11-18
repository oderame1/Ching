import { Request, Response } from 'express';
import { getTransactionById } from '../../database/transaction';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';

export const getTransactionController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const transaction = await getTransactionById(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    logger.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

