// This is a separate webhook processor service that can handle webhooks independently
// It uses the same webhook handlers from the backend but runs as a standalone service
// This allows scaling webhook processing separately from the main API

import express from 'express';
import { handlePaystackWebhook, handleMonnifyWebhook } from './handlers';
import { webhookRateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(express.json({ verify: (req: any, res, buf) => { req.rawBody = buf; } }));
app.use(webhookRateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'webhooks' });
});

// Webhook routes
app.post('/webhooks/paystack', handlePaystackWebhook);
app.post('/webhooks/monnify', handleMonnifyWebhook);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`🚀 Webhook processor running on port ${PORT}`);
});

