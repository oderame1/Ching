import { Request, Response } from 'express';
import { createWallet, getWalletByUserId } from '../../database/wallet';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import { z } from 'zod';

const createWalletSchema = z.object({
  currency: z.string().default('USD'),
});

export const createWalletController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { currency } = createWalletSchema.parse(req.body);
    
    // Check if wallet already exists
    const existingWallet = await getWalletByUserId(userId);
    if (existingWallet) {
      return res.status(409).json({ error: 'Wallet already exists' });
    }

    const wallet = await createWallet({
      user_id: userId,
      currency: currency,
    });
    
    logger.info(`Wallet created for user ${userId}`);
    
    res.status(201).json(wallet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Create wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

