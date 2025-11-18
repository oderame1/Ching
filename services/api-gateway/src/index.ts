import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();
const PORT = process.env.PORT || 3000;

// Redis client for rate limiting
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Redis store can be added later with rate-limit-redis package
});

app.use('/api/', limiter);

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const BUSINESS_SERVICE_URL = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3002';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Proxy middleware configuration
const proxyOptions = {
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '',
    '^/api/business': '',
    '^/api/payment': '',
  },
  onProxyReq: (proxyReq: any, req: express.Request) => {
    logger.info(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  },
  onError: (err: Error, req: express.Request, res: express.Response) => {
    logger.error('Proxy error:', err);
    res.status(500).json({ error: 'Service unavailable' });
  },
};

// Route proxies
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  ...proxyOptions,
}));

app.use('/api/business', createProxyMiddleware({
  target: BUSINESS_SERVICE_URL,
  ...proxyOptions,
}));

app.use('/api/payment', createProxyMiddleware({
  target: PAYMENT_SERVICE_URL,
  ...proxyOptions,
}));

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

