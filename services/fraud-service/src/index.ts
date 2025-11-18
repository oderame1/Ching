import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fraudRoutes } from './routes/fraud';
import { startEventConsumer } from './consumers/eventConsumer';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { initializeDatabase } from './database/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fraud-service' });
});

// Routes
app.use('/fraud', fraudRoutes);

// Error handler
app.use(errorHandler);

// Initialize database and start event consumer
initializeDatabase()
  .then(() => {
    startEventConsumer();
    app.listen(PORT, () => {
      logger.info(`Fraud Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  });

