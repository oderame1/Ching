import { createClient } from 'redis';
import { checkBlacklist, detectFraudPatterns } from '../services/fraudDetection';
import { logger } from '../utils/logger';
import { publishEvent } from '../utils/eventQueue';

const redisClient = createClient({
  url: process.env.EVENT_QUEUE_URL || process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

export const startEventConsumer = async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis for fraud event consumption');

    // Subscribe to events channel
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    await subscriber.subscribe('events', (message) => {
      try {
        const event = JSON.parse(message);
        handleEvent(event);
      } catch (error) {
        logger.error('Error processing fraud event:', error);
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
        logger.error('Error processing fraud event from list:', error);
      }
    }, 1000);
  } catch (error) {
    logger.error('Failed to start fraud event consumer:', error);
  }
};

const handleEvent = async (event: any) => {
  // Check fraud for payment events
  if (event.type === 'payment.deposit' || event.type === 'payment.transfer') {
    const { user_id, amount } = event.payload;
    
    const blacklisted = await checkBlacklist({ user_id });
    if (blacklisted) {
      await publishEvent('fraud.detected', {
        user_id,
        reason: 'Blacklisted user',
        event_type: event.type,
      });
      return;
    }

    const patterns = await detectFraudPatterns({ user_id, amount });
    const riskScore = patterns.length * 20; // Simplified scoring

    if (riskScore >= 70) {
      await publishEvent('fraud.detected', {
        user_id,
        risk_score: riskScore,
        patterns,
        event_type: event.type,
      });
    }
  }
};

