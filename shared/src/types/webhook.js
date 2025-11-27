"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventType = void 0;
var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["PAYSTACK_PAYMENT_SUCCESS"] = "paystack.payment.success";
    WebhookEventType["PAYSTACK_PAYMENT_FAILED"] = "paystack.payment.failed";
    WebhookEventType["MONNIFY_PAYMENT_SUCCESS"] = "monnify.payment.success";
    WebhookEventType["MONNIFY_PAYMENT_FAILED"] = "monnify.payment.failed";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
