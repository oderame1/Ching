import { Request, Response } from 'express';
import { getBlacklist } from '../database/blacklist';
import { logger } from '../utils/logger';

export const getBlacklistController = async (req: Request, res: Response) => {
  try {
    const { user_id, email, phone, ip_address } = req.query;
    
    const blacklist = await getBlacklist({
      user_id: user_id as string,
      email: email as string,
      phone: phone as string,
      ip_address: ip_address as string,
    });
    
    res.json(blacklist);
  } catch (error) {
    logger.error('Get blacklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

