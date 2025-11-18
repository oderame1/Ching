import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export const verifyWebhookSignature = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers['x-signature'] as string;
  const webhookSecret = process.env.WEBHOOK_SECRET || process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.warn('Webhook secret not configured, skipping signature verification');
    return next();
  }

  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  // Verify signature (implementation depends on payment gateway)
  // This is a simplified example
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    logger.warn('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

