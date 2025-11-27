"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESCROW_STATE_TRANSITIONS = exports.ESCROW_STATES = void 0;
exports.canTransition = canTransition;
const escrow_1 = require("../types/escrow");
exports.ESCROW_STATES = {
    PENDING: escrow_1.EscrowState.PENDING,
    WAITING_FOR_PAYMENT: escrow_1.EscrowState.WAITING_FOR_PAYMENT,
    PAID: escrow_1.EscrowState.PAID,
    DELIVERED: escrow_1.EscrowState.DELIVERED,
    RECEIVED: escrow_1.EscrowState.RECEIVED,
    RELEASED: escrow_1.EscrowState.RELEASED,
    CANCELLED: escrow_1.EscrowState.CANCELLED,
    EXPIRED: escrow_1.EscrowState.EXPIRED,
};
exports.ESCROW_STATE_TRANSITIONS = {
    [escrow_1.EscrowState.PENDING]: [escrow_1.EscrowState.WAITING_FOR_PAYMENT, escrow_1.EscrowState.CANCELLED],
    [escrow_1.EscrowState.WAITING_FOR_PAYMENT]: [escrow_1.EscrowState.PAID, escrow_1.EscrowState.CANCELLED, escrow_1.EscrowState.EXPIRED],
    [escrow_1.EscrowState.PAID]: [escrow_1.EscrowState.DELIVERED, escrow_1.EscrowState.CANCELLED],
    [escrow_1.EscrowState.DELIVERED]: [escrow_1.EscrowState.RECEIVED, escrow_1.EscrowState.CANCELLED],
    [escrow_1.EscrowState.RECEIVED]: [escrow_1.EscrowState.RELEASED],
    [escrow_1.EscrowState.RELEASED]: [],
    [escrow_1.EscrowState.CANCELLED]: [],
    [escrow_1.EscrowState.EXPIRED]: [],
};
function canTransition(from, to) {
    return exports.ESCROW_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}
