export enum EscrowState {
  PENDING = 'pending',
  WAITING_FOR_PAYMENT = 'waiting_for_payment',
  PAID = 'paid',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  RELEASED = 'released',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum EscrowInitiator {
  BUYER = 'buyer',
  SELLER = 'seller',
}

export interface Escrow {
  id: string;
  buyerId: string;
  sellerId: string;
  initiator: EscrowInitiator;
  amount: number;
  currency: string;
  description: string;
  state: EscrowState;
  paymentReference?: string;
  paymentGateway?: 'paystack' | 'monnify';
  expiresAt?: Date;
  paidAt?: Date;
  deliveredAt?: Date;
  receivedAt?: Date;
  releasedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

