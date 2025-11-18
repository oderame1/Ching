import { Request, Response } from 'express';
import { getCardsByUserId } from '../../database/card';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';

export const getCardsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const cards = await getCardsByUserId(userId);
    
    res.json(cards);
  } catch (error) {
    logger.error('Get cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

