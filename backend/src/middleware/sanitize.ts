import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Sanitize input by removing null bytes and dangerous characters
 * Security: Prevents null byte injection and other input-based attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
          // Remove null bytes and trim
          return obj.replace(/\0/g, '').trim();
        }
        if (Array.isArray(obj)) {
          return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitize(value);
          }
          return sanitized;
        }
        return obj;
      };
      req.body = sanitize(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
          return obj.replace(/\0/g, '').trim();
        }
        if (Array.isArray(obj)) {
          return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitize(value);
          }
          return sanitized;
        }
        return obj;
      };
      req.query = sanitize(req.query);
    }

    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      for (const [key, value] of Object.entries(req.params)) {
        if (typeof value === 'string') {
          req.params[key] = value.replace(/\0/g, '').trim();
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    next(error);
  }
};

