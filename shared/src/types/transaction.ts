export enum TransactionType {
  PAYMENT = 'payment',
  PAYOUT = 'payout',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Transaction {
  id: string;
  escrowId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference: string;
  gateway?: string;
  gatewayResponse?: Record<string, any>;
  errorMessage?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

