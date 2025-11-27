import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || '',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  },
  
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
    secret: process.env.OTP_SECRET || '',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
  },
  
  flutterwave: {
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET || '',
  },
  
  admin: {
    ipAllowlist: process.env.ADMIN_IP_ALLOWLIST?.split(',') || [],
  },
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  notifications: {
    whatsappApiUrl: process.env.WHATSAPP_API_URL || '',
    smsApiUrl: process.env.SMS_API_URL || '',
    emailServiceUrl: process.env.EMAIL_SERVICE_URL || '',
  },
};

// Validate required config
const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'OTP_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Validate secret strength in production
if (config.nodeEnv === 'production') {
  const weakSecrets: string[] = [];
  
  // Check JWT secrets
  if (config.jwt.secret.length < 32) {
    weakSecrets.push('JWT_SECRET (must be at least 32 characters)');
  }
  if (config.jwt.refreshSecret.length < 32) {
    weakSecrets.push('REFRESH_TOKEN_SECRET (must be at least 32 characters)');
  }
  if (config.otp.secret.length < 16) {
    weakSecrets.push('OTP_SECRET (must be at least 16 characters)');
  }
  
  // Check for default/weak values
  const defaultPatterns = [
    /^your-.*-key/i,
    /^change-this/i,
    /^secret$/i,
    /^password$/i,
    /^12345/i,
  ];
  
  const checkSecret = (value: string, name: string) => {
    if (defaultPatterns.some(pattern => pattern.test(value))) {
      weakSecrets.push(`${name} (appears to be a default/weak value)`);
    }
  };
  
  checkSecret(config.jwt.secret, 'JWT_SECRET');
  checkSecret(config.jwt.refreshSecret, 'REFRESH_TOKEN_SECRET');
  checkSecret(config.otp.secret, 'OTP_SECRET');
  
  if (weakSecrets.length > 0) {
    throw new Error(
      `Weak secrets detected in production:\n${weakSecrets.join('\n')}\n` +
      `Please use strong, unique secrets. Generate with: openssl rand -base64 32`
    );
  }
}

// Validate DATABASE_URL format
if (config.database.url && !config.database.url.startsWith('postgresql://')) {
  logger.warn('DATABASE_URL should start with postgresql://');
}

// Validate Redis URL format
if (config.redis.url && !config.redis.url.startsWith('redis://')) {
  logger.warn('REDIS_URL should start with redis://');
}

