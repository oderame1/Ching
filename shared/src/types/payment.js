"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGateway = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["INITIALIZED"] = "initialized";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentGateway;
(function (PaymentGateway) {
    PaymentGateway["PAYSTACK"] = "paystack";
    PaymentGateway["FLUTTERWAVE"] = "flutterwave";
})(PaymentGateway || (exports.PaymentGateway = PaymentGateway = {}));
