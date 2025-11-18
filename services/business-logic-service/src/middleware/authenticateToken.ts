import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token with auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    try {
      const response = await axios.get(`${authServiceUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      (req as AuthRequest).user = response.data.user;
      next();
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      logger.error('Auth service error:', error);
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

