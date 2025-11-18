import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError, ERROR_CODES } from '@escrow/shared';
import { prisma } from '../utils/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 'No token provided', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      email: string;
      role: string;
    };

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isVerified: true },
    });

    if (!user) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 'User not found', 401);
    }

    if (!user.isVerified) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Account not verified', 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(ERROR_CODES.UNAUTHORIZED, 'Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(ERROR_CODES.UNAUTHORIZED, 'Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(ERROR_CODES.FORBIDDEN, 'Insufficient permissions', 403));
    }

    next();
  };
};

