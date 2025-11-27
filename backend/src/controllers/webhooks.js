"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMonnifyWebhook = exports.handlePaystackWebhook = void 0;
const db_1 = require("../utils/db");
const logger_1 = require("../utils/logger");
const shared_1 = require("@escrow/shared");
const paystackService = __importStar(require("../services/paystack"));
const monnifyService = __importStar(require("../services/monnify"));
const handlePaystackWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];
        if (!signature) {
            throw new shared_1.AppError(shared_1.ERROR_CODES.WEBHOOK_INVALID, 'Missing signature', 401);
        }
        // Verify signature
        const rawBody = JSON.stringify(req.body);
        const isValid = paystackService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            throw new shared_1.AppError(shared_1.ERROR_CODES.WEBHOOK_INVALID, 'Invalid signature', 401);
        }
        const event = req.body.event;
        const data = req.body.data;
        // Store webhook event
        await db_1.prisma.webhookEvent.create({
            data: {
                type: event === 'charge.success' ? 'paystack_payment_success' : 'paystack_payment_failed',
                gateway: 'paystack',
                payload: req.body,
                signature,
            },
        });
        // Process successful payment
        if (event === 'charge.success') {
            const reference = data.reference;
            // Find payment
            const payment = await db_1.prisma.payment.findUnique({
                where: { reference },
                include: { escrow: true },
            });
            if (!payment) {
                logger_1.logger.warn(`Payment not found for reference: ${reference}`);
                return res.status(200).json({ received: true });
            }
            // Idempotency check - already processed
            if (payment.status === shared_1.PaymentStatus.COMPLETED) {
                logger_1.logger.info(`Payment already processed: ${reference}`);
                return res.status(200).json({ received: true });
            }
            // Verify payment with Paystack
            const verification = await paystackService.verifyPayment(reference);
            if (!verification.data.status) {
                logger_1.logger.error(`Payment verification failed: ${reference}`);
                return res.status(200).json({ received: true });
            }
            // Update payment
            await db_1.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: shared_1.PaymentStatus.COMPLETED,
                    gatewayResponse: verification.data,
                },
            });
            // Update escrow
            await db_1.prisma.escrow.update({
                where: { id: payment.escrowId },
                data: {
                    state: shared_1.EscrowState.PAID,
                    paidAt: new Date(),
                },
            });
            // Create transaction
            await db_1.prisma.transaction.create({
                data: {
                    escrowId: payment.escrowId,
                    type: 'payment',
                    amount: payment.amount,
                    currency: payment.currency,
                    status: 'completed',
                    reference: (0, shared_1.generateReference)('TXN'),
                    gateway: payment.gateway,
                    gatewayResponse: verification.data,
                    processedAt: new Date(),
                },
            });
            // Mark webhook as processed
            await db_1.prisma.webhookEvent.updateMany({
                where: {
                    gateway: 'paystack',
                    payload: { path: ['data', 'reference'], equals: reference },
                    isProcessed: false,
                },
                data: {
                    isProcessed: true,
                    processedAt: new Date(),
                },
            });
            logger_1.logger.info(`Payment processed: ${reference} for escrow ${payment.escrowId}`);
            // TODO: Queue notification jobs
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        logger_1.logger.error('Paystack webhook error:', error);
        // Still return 200 to prevent webhook retries
        res.status(200).json({ received: true, error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.handlePaystackWebhook = handlePaystackWebhook;
const handleMonnifyWebhook = async (req, res) => {
    try {
        const signature = req.headers['monnify-signature'];
        if (!signature) {
            throw new shared_1.AppError(shared_1.ERROR_CODES.WEBHOOK_INVALID, 'Missing signature', 401);
        }
        // Verify signature
        const rawBody = JSON.stringify(req.body);
        const isValid = monnifyService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            throw new shared_1.AppError(shared_1.ERROR_CODES.WEBHOOK_INVALID, 'Invalid signature', 401);
        }
        const eventType = req.body.eventType;
        const eventData = req.body.eventData;
        // Store webhook event
        await db_1.prisma.webhookEvent.create({
            data: {
                type: eventType === 'SUCCESSFUL_TRANSACTION'
                    ? 'monnify_payment_success'
                    : 'monnify_payment_failed',
                gateway: 'monnify',
                payload: req.body,
                signature,
            },
        });
        // Process successful payment
        if (eventType === 'SUCCESSFUL_TRANSACTION') {
            const paymentReference = eventData.paymentReference;
            // Find payment
            const payment = await db_1.prisma.payment.findUnique({
                where: { reference: paymentReference },
                include: { escrow: true },
            });
            if (!payment) {
                logger_1.logger.warn(`Payment not found for reference: ${paymentReference}`);
                return res.status(200).json({ received: true });
            }
            // Idempotency check
            if (payment.status === shared_1.PaymentStatus.COMPLETED) {
                logger_1.logger.info(`Payment already processed: ${paymentReference}`);
                return res.status(200).json({ received: true });
            }
            // Update payment
            await db_1.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: shared_1.PaymentStatus.COMPLETED,
                    gatewayResponse: eventData,
                },
            });
            // Update escrow
            await db_1.prisma.escrow.update({
                where: { id: payment.escrowId },
                data: {
                    state: shared_1.EscrowState.PAID,
                    paidAt: new Date(),
                },
            });
            // Create transaction
            await db_1.prisma.transaction.create({
                data: {
                    escrowId: payment.escrowId,
                    type: 'payment',
                    amount: payment.amount,
                    currency: payment.currency,
                    status: 'completed',
                    reference: (0, shared_1.generateReference)('TXN'),
                    gateway: payment.gateway,
                    gatewayResponse: eventData,
                    processedAt: new Date(),
                },
            });
            // Mark webhook as processed
            await db_1.prisma.webhookEvent.updateMany({
                where: {
                    gateway: 'monnify',
                    payload: { path: ['eventData', 'paymentReference'], equals: paymentReference },
                    isProcessed: false,
                },
                data: {
                    isProcessed: true,
                    processedAt: new Date(),
                },
            });
            logger_1.logger.info(`Payment processed: ${paymentReference} for escrow ${payment.escrowId}`);
            // TODO: Queue notification jobs
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        logger_1.logger.error('Monnify webhook error:', error);
        res.status(200).json({ received: true, error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.handleMonnifyWebhook = handleMonnifyWebhook;
