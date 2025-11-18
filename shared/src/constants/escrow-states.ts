import { EscrowState } from '../types/escrow';

export const ESCROW_STATES = {
  PENDING: EscrowState.PENDING,
  WAITING_FOR_PAYMENT: EscrowState.WAITING_FOR_PAYMENT,
  PAID: EscrowState.PAID,
  DELIVERED: EscrowState.DELIVERED,
  RECEIVED: EscrowState.RECEIVED,
  RELEASED: EscrowState.RELEASED,
  CANCELLED: EscrowState.CANCELLED,
  EXPIRED: EscrowState.EXPIRED,
} as const;

export const ESCROW_STATE_TRANSITIONS: Record<EscrowState, EscrowState[]> = {
  [EscrowState.PENDING]: [EscrowState.WAITING_FOR_PAYMENT, EscrowState.CANCELLED],
  [EscrowState.WAITING_FOR_PAYMENT]: [EscrowState.PAID, EscrowState.CANCELLED, EscrowState.EXPIRED],
  [EscrowState.PAID]: [EscrowState.DELIVERED, EscrowState.CANCELLED],
  [EscrowState.DELIVERED]: [EscrowState.RECEIVED, EscrowState.CANCELLED],
  [EscrowState.RECEIVED]: [EscrowState.RELEASED],
  [EscrowState.RELEASED]: [],
  [EscrowState.CANCELLED]: [],
  [EscrowState.EXPIRED]: [],
};

export function canTransition(from: EscrowState, to: EscrowState): boolean {
  return ESCROW_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

