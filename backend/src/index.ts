import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth';
import escrowRoutes from './routes/escrow';
import paymentRoutes from './routes/payments';
import payoutRoutes from './routes/payouts';
import notificationRoutes from './routes/notifications';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/escrow', rateLimiter, escrowRoutes);
app.use('/api/payments', rateLimiter, paymentRoutes);
app.use('/api/payouts', rateLimiter, payoutRoutes);
app.use('/api/notifications', rateLimiter, notificationRoutes);
app.use('/api/users', rateLimiter, userRoutes);
app.use('/api/admin', adminRoutes); // IP allowlist applied in route
app.use('/api/webhooks', webhookRoutes); // Webhooks bypass rate limiting

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
});

export default app;

