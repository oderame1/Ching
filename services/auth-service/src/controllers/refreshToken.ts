import { Request, Response } from 'express';
import { verifyRefreshToken, generateTokens } from '../utils/jwt';
import { getUserById } from '../database/user';
import { logger } from '../utils/logger';
import { z } from 'zod';

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const tokens = generateTokens(user.id, user.email, user.role);
    
    logger.info(`Token refreshed for user ${user.id}`);
    
    res.json(tokens);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

