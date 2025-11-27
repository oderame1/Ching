"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = exports.verifyPayment = exports.initializePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const shared_1 = require("@escrow/shared");
const logger_1 = require("../utils/logger");
const MONNIFY_BASE_URL = 'https://api.monnify.com';
let accessToken = null;
let tokenExpiry = null;
const getAccessToken = async () => {
    // Check if token is still valid
    if (accessToken && tokenExpiry && tokenExpiry > new Date()) {
        return accessToken;
    }
    try {
        const authString = Buffer.from(`${config_1.config.monnify.apiKey}:${config_1.config.monnify.secretKey}`).toString('base64');
        const response = await axios_1.default.post(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {}, {
            headers: {
                Authorization: `Basic ${authString}`,
                'Content-Type': 'application/json',
            },
        });
        accessToken = response.data.responseBody.accessToken;
        // Token expires in 1 hour, refresh at 50 minutes
        tokenExpiry = new Date(Date.now() + 50 * 60 * 1000);
        return accessToken;
    }
    catch (error) {
        logger_1.logger.error('Monnify auth error:', error);
        throw new Error('Failed to authenticate with Monnify');
    }
};
const initializePayment = async (params) => {
    try {
        const token = await getAccessToken();
        const paymentReference = params.paymentReference || `MON-${(0, shared_1.generateReference)()}`;
        const response = await axios_1.default.post(`${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`, {
            amount: params.amount,
            customerName: params.customerName,
            customerEmail: params.email,
            paymentReference,
            paymentDescription: params.metadata?.description || 'Escrow payment',
            currencyCode: params.currency || 'NGN',
            contractCode: config_1.config.monnify.contractCode,
            redirectUrl: params.callbackUrl,
            paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
            metadata: params.metadata,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.data.requestSuccessful) {
            throw new Error(response.data.responseMessage || 'Payment initialization failed');
        }
        return response.data;
    }
    catch (error) {
        logger_1.logger.error('Monnify initialization error:', error);
        throw new Error(error.response?.data?.responseMessage || 'Failed to initialize payment');
    }
};
exports.initializePayment = initializePayment;
const verifyPayment = async (transactionReference) => {
    try {
        const token = await getAccessToken();
        const response = await axios_1.default.get(`${MONNIFY_BASE_URL}/api/v2/transactions/${transactionReference}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
    catch (error) {
        logger_1.logger.error('Monnify verification error:', error);
        throw new Error(error.response?.data?.responseMessage || 'Failed to verify payment');
    }
};
exports.verifyPayment = verifyPayment;
const verifyWebhookSignature = (payload, signature) => {
    const computedHash = crypto_1.default
        .createHmac('sha512', config_1.config.monnify.webhookSecret)
        .update(payload)
        .digest('hex');
    return computedHash === signature;
};
exports.verifyWebhookSignature = verifyWebhookSignature;
