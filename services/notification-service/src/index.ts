import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { startEventConsumer } from './consumers/eventConsumer';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// Start event consumer
startEventConsumer();

// Start server
app.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
});

