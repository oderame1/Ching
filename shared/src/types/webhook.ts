export enum WebhookEventType {
  PAYSTACK_PAYMENT_SUCCESS = 'paystack.payment.success',
  PAYSTACK_PAYMENT_FAILED = 'paystack.payment.failed',
  FLUTTERWAVE_PAYMENT_SUCCESS = 'flutterwave.payment.success',
  FLUTTERWAVE_PAYMENT_FAILED = 'flutterwave.payment.failed',
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  gateway: 'paystack' | 'flutterwave';
  payload: Record<string, any>;
  signature: string;
  isProcessed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

