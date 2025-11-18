import { Request, Response } from 'express';
import { getWalletByUserId } from '../../database/wallet';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';

export const getWalletController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const wallet = await getWalletByUserId(userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.json(wallet);
  } catch (error) {
    logger.error('Get wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

