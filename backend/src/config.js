"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
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
    monnify: {
        apiKey: process.env.MONNIFY_API_KEY || '',
        secretKey: process.env.MONNIFY_SECRET_KEY || '',
        contractCode: process.env.MONNIFY_CONTRACT_CODE || '',
        webhookSecret: process.env.MONNIFY_WEBHOOK_SECRET || '',
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
