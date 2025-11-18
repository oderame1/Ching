import { createClient } from 'redis';
import { createAuditLog } from '../database/audit';
import { logger } from '../utils/logger';

const redisClient = createClient({
  url: process.env.EVENT_QUEUE_URL || process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

export const startEventConsumer = async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis for audit event consumption');

    // Subscribe to events channel
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    await subscriber.subscribe('events', (message) => {
      try {
        const event = JSON.parse(message);
        handleEvent(event);
      } catch (error) {
        logger.error('Error processing audit event:', error);
      }
    });

    // Also process events from list
    setInterval(async () => {
      try {
        const message = await redisClient.rPop('events');
        if (message) {
          const event = JSON.parse(message);
          await handleEvent(event);
        }
      } catch (error) {
        logger.error('Error processing audit event from list:', error);
      }
    }, 1000);
  } catch (error) {
    logger.error('Failed to start audit event consumer:', error);
  }
};

const handleEvent = async (event: any) => {
  try {
    // Extract audit information from event
    const { user_id, escrow_id, dispute_id, transaction_id } = event.payload;
    
    // Determine action and entity
    let action = event.type;
    let entityType = 'unknown';
    let entityId = null;

    if (escrow_id) {
      entityType = 'escrow';
      entityId = escrow_id;
    } else if (dispute_id) {
      entityType = 'dispute';
      entityId = dispute_id;
    } else if (transaction_id) {
      entityType = 'transaction';
      entityId = transaction_id;
    }

    // Create audit log
    await createAuditLog({
      user_id: user_id || null,
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      details: event.payload,
      ip_address: event.payload.ip_address || null,
    });

    logger.debug(`Audit log created for event: ${event.type}`);
  } catch (error) {
    logger.error('Error creating audit log:', error);
  }
};

