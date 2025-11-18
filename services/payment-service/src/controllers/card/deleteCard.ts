import { Request, Response } from 'express';
import { deleteCard, getCardById } from '../../database/card';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';

export const deleteCardController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const card = await getCardById(id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (card.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await deleteCard(id);
    
    logger.info(`Card ${id} deleted by user ${userId}`);
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    logger.error('Delete card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

