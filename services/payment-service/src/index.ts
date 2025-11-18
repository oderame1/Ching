import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { walletRoutes } from './routes/wallet';
import { cardRoutes } from './routes/card';
import { transferRoutes } from './routes/transfer';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { initializeDatabase } from './database/connection';
import { authenticateToken } from './middleware/authenticateToken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

// Routes
app.use('/wallet', authenticateToken, walletRoutes);
app.use('/cards', authenticateToken, cardRoutes);
app.use('/transfer', authenticateToken, transferRoutes);
app.use('/refund', authenticateToken, transferRoutes);

// Error handler
app.use(errorHandler);

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Payment Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  });

