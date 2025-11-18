import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AppError, ERROR_CODES } from '@escrow/shared';

export const ipAllowlist = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || '';
  
  // Allow if no allowlist configured (development)
  if (config.admin.ipAllowlist.length === 0) {
    return next();
  }

  // Check if IP is in allowlist
  const isAllowed = config.admin.ipAllowlist.some(allowedIp => {
    if (allowedIp === clientIp) return true;
    // Support CIDR notation if needed (basic check)
    return clientIp.startsWith(allowedIp);
  });

  if (!isAllowed) {
    return next(new AppError(
      ERROR_CODES.FORBIDDEN,
      'Access denied from this IP address',
      403
    ));
  }

  next();
};

