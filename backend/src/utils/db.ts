import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Handle database connection errors
prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma error:', e);
});

// Test database connection on startup
prisma.$connect()
  .then(() => {
    logger.info('✅ Database connected successfully');
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
    logger.error('Make sure PostgreSQL is running and DATABASE_URL is correct');
    // Don't exit - let the app try to reconnect
  });

// Graceful shutdown
const shutdown = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

process.on('beforeExit', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

