import { Router } from 'express';
import { handlePaystackWebhook, handleFlutterwaveWebhook } from '../controllers/webhooks';
import { webhookRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/paystack', webhookRateLimiter, asyncHandler(handlePaystackWebhook));
router.post('/flutterwave', webhookRateLimiter, asyncHandler(handleFlutterwaveWebhook));

export default router;

