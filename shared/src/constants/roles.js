"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.ROLES = void 0;
const user_1 = require("../types/user");
exports.ROLES = {
    BUYER: user_1.UserRole.BUYER,
    SELLER: user_1.UserRole.SELLER,
    ADMIN: user_1.UserRole.ADMIN,
};
exports.ROLE_PERMISSIONS = {
    [user_1.UserRole.BUYER]: ['create_escrow', 'pay_escrow', 'confirm_received'],
    [user_1.UserRole.SELLER]: ['create_escrow', 'mark_delivered'],
    [user_1.UserRole.ADMIN]: [
        'view_all_escrows',
        'release_funds',
        'refund_funds',
        'cancel_escrow',
        'view_users',
        'view_audit_logs',
    ],
};
