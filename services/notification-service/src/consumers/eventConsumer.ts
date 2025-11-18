import { createClient } from 'redis';
import { sendNotification } from '../services/notificationService';
import { logger } from '../utils/logger';

const redisClient = createClient({
  url: process.env.EVENT_QUEUE_URL || process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

export const startEventConsumer = async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis for event consumption');

    // Subscribe to events channel
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    await subscriber.subscribe('events', (message) => {
      try {
        const event = JSON.parse(message);
        handleEvent(event);
      } catch (error) {
        logger.error('Error processing event:', error);
      }
    });

    // Also process events from list (backup)
    setInterval(async () => {
      try {
        const message = await redisClient.rPop('events');
        if (message) {
          const event = JSON.parse(message);
          await handleEvent(event);
        }
      } catch (error) {
        logger.error('Error processing event from list:', error);
      }
    }, 1000);
  } catch (error) {
    logger.error('Failed to start event consumer:', error);
  }
};

const handleEvent = async (event: any) => {
  logger.info(`Processing event: ${event.type}`, event.payload);

  // Handle notification events
  if (event.type.startsWith('notification.')) {
    await sendNotification(event.type, event.payload);
  }
};

