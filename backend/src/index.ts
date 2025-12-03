import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';

// Routes
import authRoutes from './routes/auth';
import escrowRoutes from './routes/escrow';
import paymentRoutes from './routes/payments';
import payoutRoutes from './routes/payouts';
import notificationRoutes from './routes/notifications';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';
import devRoutes from './routes/dev';
import uploadRoutes from './routes/uploads';

const app = express();

// Middleware
// Configure Helmet with relaxed CSP for development
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: config.nodeEnv === 'production' ? undefined : false,
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or file://)
    if (!origin) {
      if (config.nodeEnv === 'development') {
        logger.debug('CORS: Allowing request with no origin');
      }
      return callback(null, true);
    }

    if (config.nodeEnv === 'development') {
      logger.debug(`CORS: Request from origin: ${origin}`);
    }

    // Allow localhost and file:// origins in development
    const allowedOrigins = [
      config.frontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ];

    // In development, also allow file:// protocol
    if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
      if (origin.startsWith('file://')) {
        if (config.nodeEnv === 'development') {
          logger.debug('CORS: Allowing file:// origin');
        }
        return callback(null, true);
      }
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      if (config.nodeEnv === 'development') {
        logger.debug('CORS: Allowing whitelisted origin');
      }
      callback(null, true);
    } else {
      if (config.nodeEnv === 'development') {
        logger.warn(`CORS: Blocking origin: ${origin}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Security: Limit request body size to prevent DoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security: Sanitize all inputs to prevent injection attacks
app.use(sanitizeInput);

app.use(requestLogger);

// Health check with database connectivity
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { prisma } = await import('./utils/db');
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error: any) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/escrow', rateLimiter, escrowRoutes);
app.use('/api/payments', rateLimiter, paymentRoutes);
app.use('/api/payouts', rateLimiter, payoutRoutes);
app.use('/api/notifications', rateLimiter, notificationRoutes);
app.use('/api/users', rateLimiter, userRoutes);
app.use('/api/uploads', rateLimiter, uploadRoutes); // File upload endpoints
app.use('/api/admin', adminRoutes); // IP allowlist applied in route
app.use('/api/webhooks', webhookRoutes); // Webhooks bypass rate limiting

// Dev-only routes (only available in development/test)
if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
  app.use('/api/dev', devRoutes);
}

// Error handler
app.use(errorHandler);

// Process error handlers to prevent crashes
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit in development, allow graceful handling
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  try {
    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close database connections
    const { prisma } = await import('./utils/db');
    await prisma.$disconnect();
    logger.info('Database connections closed');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = config.port || 3001;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
});

export default app;

