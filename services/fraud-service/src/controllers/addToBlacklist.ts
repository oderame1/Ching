import { Request, Response } from 'express';
import { addToBlacklist } from '../database/blacklist';
import { logger } from '../utils/logger';
import { z } from 'zod';

const addToBlacklistSchema = z.object({
  user_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  ip_address: z.string().optional(),
  reason: z.string().min(10),
});

export const addToBlacklistController = async (req: Request, res: Response) => {
  try {
    const data = addToBlacklistSchema.parse(req.body);
    
    const blacklistEntry = await addToBlacklist(data);
    
    logger.info(`Added to blacklist: ${blacklistEntry.id}`);
    
    res.status(201).json(blacklistEntry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Add to blacklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

