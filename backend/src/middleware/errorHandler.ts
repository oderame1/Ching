import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '@escrow/shared';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: err.errors,
    });
  }

  // App error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Unknown error
  logger.error(err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

