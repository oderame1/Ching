import { Router } from 'express';
import { handlePaystackWebhook, handleMonnifyWebhook } from '../controllers/webhooks';
import { webhookRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/paystack', webhookRateLimiter, handlePaystackWebhook);
router.post('/monnify', webhookRateLimiter, handleMonnifyWebhook);

export default router;

