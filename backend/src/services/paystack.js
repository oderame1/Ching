"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = exports.verifyPayment = exports.initializePayment = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const shared_1 = require("@escrow/shared");
const logger_1 = require("../utils/logger");
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const initializePayment = async (params) => {
    try {
        const reference = params.reference || `PAY-${(0, shared_1.generateReference)()}`;
        const response = await axios_1.default.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            email: params.email,
            amount: Math.round(params.amount * 100), // Convert to kobo
            reference,
            callback_url: params.callbackUrl,
            metadata: params.metadata,
        }, {
            headers: {
                Authorization: `Bearer ${config_1.config.paystack.secretKey}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.data.status) {
            throw new Error(response.data.message || 'Payment initialization failed');
        }
        return response.data;
    }
    catch (error) {
        logger_1.logger.error('Paystack initialization error:', error);
        throw new Error(error.response?.data?.message || 'Failed to initialize payment');
    }
};
exports.initializePayment = initializePayment;
const verifyPayment = async (reference) => {
    try {
        const response = await axios_1.default.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${config_1.config.paystack.secretKey}`,
            },
        });
        return response.data;
    }
    catch (error) {
        logger_1.logger.error('Paystack verification error:', error);
        throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
};
exports.verifyPayment = verifyPayment;
const verifyWebhookSignature = (payload, signature) => {
    const hash = crypto_1.default
        .createHmac('sha512', config_1.config.paystack.webhookSecret)
        .update(payload)
        .digest('hex');
    return hash === signature;
};
exports.verifyWebhookSignature = verifyWebhookSignature;
