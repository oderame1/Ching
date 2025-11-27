"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReference = generateReference;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.isExpired = isExpired;
exports.addMinutes = addMinutes;
exports.addDays = addDays;
function generateReference(prefix = 'ESC') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}
function formatCurrency(amount, currency = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
    }).format(amount);
}
function formatDate(date) {
    return new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(date));
}
function isExpired(date) {
    return new Date(date) < new Date();
}
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}
function addDays(date, days) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
