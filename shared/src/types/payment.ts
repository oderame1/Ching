export enum PaymentStatus {
  PENDING = 'pending',
  INITIALIZED = 'initialized',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentGateway {
  PAYSTACK = 'paystack',
  MONNIFY = 'monnify',
}

export interface Payment {
  id: string;
  escrowId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  reference: string;
  status: PaymentStatus;
  gatewayResponse?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

