import { Request, Response } from 'express';
import { saveWebhookEvent, updateTransactionStatus } from '../database/webhook';
import { publishEvent } from '../utils/eventQueue';
import { logger } from '../utils/logger';
import axios from 'axios';

export const paymentWebhookController = async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    const eventType = webhookData.type || webhookData.event_type;
    
    // Save webhook event
    const webhookEvent = await saveWebhookEvent({
      source: req.headers['x-webhook-source'] || 'unknown',
      event_type: eventType,
      payload: webhookData,
      signature: req.headers['x-signature'] as string,
    });

    logger.info(`Webhook received: ${eventType}`, { webhookId: webhookEvent.id });

    // Process payment confirmation
    if (eventType === 'payment.succeeded' || eventType === 'charge.succeeded') {
      const transactionId = webhookData.data?.transaction_id || webhookData.data?.id;
      const amount = webhookData.data?.amount;
      const currency = webhookData.data?.currency;

      if (transactionId) {
        // Update transaction status
        await updateTransactionStatus(transactionId, 'completed', {
          external_transaction_id: webhookData.data?.payment_intent_id || webhookData.id,
        });

        // Publish event for async processing
        await publishEvent('payment.confirmed', {
          transaction_id: transactionId,
          amount: amount,
          currency: currency,
          webhook_id: webhookEvent.id,
        });

        // Notify payment service
        const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
        try {
          await axios.post(`${paymentServiceUrl}/webhook/confirm`, {
            transaction_id: transactionId,
            status: 'completed',
          });
        } catch (error) {
          logger.error('Failed to notify payment service:', error);
        }
      }
    }

    // Acknowledge webhook
    res.status(200).json({ received: true, webhook_id: webhookEvent.id });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

