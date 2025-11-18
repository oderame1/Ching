import { Router } from 'express';
import { paymentWebhookController } from '../controllers/paymentWebhook';
import { verifyWebhookSignature } from '../middleware/verifyWebhookSignature';

export const webhookRoutes = Router();

webhookRoutes.post('/payment', verifyWebhookSignature, paymentWebhookController);
webhookRoutes.post('/stripe', verifyWebhookSignature, paymentWebhookController);

