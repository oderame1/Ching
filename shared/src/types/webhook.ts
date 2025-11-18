export enum WebhookEventType {
  PAYSTACK_PAYMENT_SUCCESS = 'paystack.payment.success',
  PAYSTACK_PAYMENT_FAILED = 'paystack.payment.failed',
  MONNIFY_PAYMENT_SUCCESS = 'monnify.payment.success',
  MONNIFY_PAYMENT_FAILED = 'monnify.payment.failed',
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  gateway: 'paystack' | 'monnify';
  payload: Record<string, any>;
  signature: string;
  isProcessed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

