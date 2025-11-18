import { Response } from 'express';
import { z } from 'zod';
import { emailSchema, phoneSchema } from '@escrow/shared';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES } from '@escrow/shared';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
});

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!userData) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
    }

    res.json({ user: userData });
  } catch (error) {
    logger.error('Get current user error:', error);
    throw error;
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const data = updateUserSchema.parse(req.body);

    // Check for email/phone conflicts
    if (data.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== user.id) {
        throw new AppError(ERROR_CODES.CONFLICT, 'Email already in use', 409);
      }
    }

    if (data.phone) {
      const existing = await prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (existing && existing.id !== user.id) {
        throw new AppError(ERROR_CODES.CONFLICT, 'Phone already in use', 409);
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    logger.info(`User updated: ${user.id}`);

    res.json({ user: updated });
  } catch (error) {
    logger.error('Update user error:', error);
    throw error;
  }
};

