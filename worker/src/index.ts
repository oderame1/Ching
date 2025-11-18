import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import { logger } from './utils/logger';
import { redisConnection } from './utils/redis';
import {
  sendWhatsAppMessageProcessor,
  sendEmailProcessor,
  processPayoutProcessor,
  retryFailedWebhookProcessor,
  autoCancelExpiredEscrowProcessor,
} from './processors';

dotenv.config();

const queues = [
  {
    name: 'whatsapp-queue',
    processor: sendWhatsAppMessageProcessor,
  },
  {
    name: 'email-queue',
    processor: sendEmailProcessor,
  },
  {
    name: 'payout-queue',
    processor: processPayoutProcessor,
  },
  {
    name: 'webhook-retry-queue',
    processor: retryFailedWebhookProcessor,
  },
  {
    name: 'expired-escrow-queue',
    processor: autoCancelExpiredEscrowProcessor,
  },
];

const workers = queues.map(({ name, processor }) => {
  const worker = new Worker(name, processor, {
    connection: redisConnection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed in queue ${name}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed in queue ${name}:`, err);
  });

  worker.on('error', (err) => {
    logger.error(`Worker error in queue ${name}:`, err);
  });

  return { name, worker };
});

logger.info(`🚀 Worker started with ${workers.length} queues`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down workers...');
  await Promise.all(workers.map(({ worker }) => worker.close()));
  logger.info('Workers shut down');
  process.exit(0);
});

