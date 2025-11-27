"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowInitiator = exports.EscrowState = void 0;
var EscrowState;
(function (EscrowState) {
    EscrowState["PENDING"] = "pending";
    EscrowState["WAITING_FOR_PAYMENT"] = "waiting_for_payment";
    EscrowState["PAID"] = "paid";
    EscrowState["DELIVERED"] = "delivered";
    EscrowState["RECEIVED"] = "received";
    EscrowState["RELEASED"] = "released";
    EscrowState["CANCELLED"] = "cancelled";
    EscrowState["EXPIRED"] = "expired";
})(EscrowState || (exports.EscrowState = EscrowState = {}));
var EscrowInitiator;
(function (EscrowInitiator) {
    EscrowInitiator["BUYER"] = "buyer";
    EscrowInitiator["SELLER"] = "seller";
})(EscrowInitiator || (exports.EscrowInitiator = EscrowInitiator = {}));
