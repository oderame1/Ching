import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.EVENT_QUEUE_URL || process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

export const publishEvent = async (eventType: string, payload: any): Promise<void> => {
  try {
    const event = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    };
    
    await redisClient.lPush('events', JSON.stringify(event));
    await redisClient.publish('events', JSON.stringify(event));
  } catch (error) {
    console.error('Failed to publish event:', error);
    throw error;
  }
};

