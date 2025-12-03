"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventType = void 0;
var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["PAYSTACK_PAYMENT_SUCCESS"] = "paystack.payment.success";
    WebhookEventType["PAYSTACK_PAYMENT_FAILED"] = "paystack.payment.failed";
    WebhookEventType["FLUTTERWAVE_PAYMENT_SUCCESS"] = "flutterwave.payment.success";
    WebhookEventType["FLUTTERWAVE_PAYMENT_FAILED"] = "flutterwave.payment.failed";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
