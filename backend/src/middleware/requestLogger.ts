import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../utils/logger';

export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.path === '/health',
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  serializers: {
    req: (req: Request) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
      },
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode,
    }),
  },
});

