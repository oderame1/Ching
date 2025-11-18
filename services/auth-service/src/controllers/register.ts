import { Request, Response } from 'express';
import { createUser, getUserByEmail } from '../database/user';
import { hashPassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';
import { logger } from '../utils/logger';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['buyer', 'seller', 'admin']).optional(),
});

export const registerController = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await createUser({
      email: data.email,
      password_hash: passwordHash,
      name: data.name,
      role: data.role || 'buyer',
    });

    const tokens = generateTokens(user.id, user.email, user.role);
    
    logger.info(`User ${user.id} registered successfully`);
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

