import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to catch errors and pass them to error handler
 * Prevents unhandled promise rejections from crashing the server
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

