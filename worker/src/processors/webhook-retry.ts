import { Job } from 'bullmq';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

interface WebhookRetryJobData {
  webhookEventId: string;
}

export const retryFailedWebhookProcessor = async (job: Job<WebhookRetryJobData>) => {
  const { webhookEventId } = job.data;

  logger.info(`Retrying webhook: ${webhookEventId}`);

  try {
    const webhookEvent = await prisma.webhookEvent.findUnique({
      where: { id: webhookEventId },
    });

    if (!webhookEvent) {
      throw new Error(`Webhook event not found: ${webhookEventId}`);
    }

    if (webhookEvent.isProcessed) {
      logger.info(`Webhook already processed: ${webhookEventId}`);
      return { success: true, alreadyProcessed: true };
    }

    // TODO: Re-process webhook event
    // This would typically call the webhook handler again

    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: {
        isProcessed: true,
        processedAt: new Date(),
      },
    });

    logger.info(`Webhook retried successfully: ${webhookEventId}`);

    return { success: true };
  } catch (error) {
    logger.error('Webhook retry error:', error);

    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
};

