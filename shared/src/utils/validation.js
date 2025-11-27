"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escrowIdSchema = exports.currencySchema = exports.amountSchema = exports.otpSchema = exports.phoneSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z.string().email('Invalid email address');
exports.phoneSchema = zod_1.z
    .string()
    .regex(/^\+?234\d{10}$|^0\d{10}$/, 'Invalid Nigerian phone number');
exports.otpSchema = zod_1.z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits');
exports.amountSchema = zod_1.z
    .number()
    .positive('Amount must be positive')
    .min(1, 'Minimum amount is 1')
    .max(10000000, 'Maximum amount is 10,000,000');
exports.currencySchema = zod_1.z.enum(['NGN', 'USD']);
exports.escrowIdSchema = zod_1.z.string().uuid('Invalid escrow ID');
