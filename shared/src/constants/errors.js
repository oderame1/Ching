"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ERROR_CODES = void 0;
exports.ERROR_CODES = {
    INVALID_INPUT: 'INVALID_INPUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    ESCROW_STATE_INVALID: 'ESCROW_STATE_INVALID',
    WEBHOOK_INVALID: 'WEBHOOK_INVALID',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
