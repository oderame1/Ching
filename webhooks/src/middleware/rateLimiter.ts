import rateLimit from 'express-rate-limit';

export const webhookRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many webhook requests',
});

