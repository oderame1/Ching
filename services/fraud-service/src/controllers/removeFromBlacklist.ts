import { Request, Response } from 'express';
import { removeFromBlacklist } from '../database/blacklist';
import { logger } from '../utils/logger';

export const removeFromBlacklistController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await removeFromBlacklist(id);
    
    logger.info(`Removed from blacklist: ${id}`);
    
    res.json({ message: 'Removed from blacklist successfully' });
  } catch (error) {
    logger.error('Remove from blacklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

