import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EscrowState } from '@escrow/shared';
import { canTransition } from '@escrow/shared';

describe('Escrow State Machine', () => {
  it('should allow transition from pending to waiting_for_payment', () => {
    expect(canTransition(EscrowState.PENDING, EscrowState.WAITING_FOR_PAYMENT)).toBe(true);
  });

  it('should allow transition from waiting_for_payment to paid', () => {
    expect(canTransition(EscrowState.WAITING_FOR_PAYMENT, EscrowState.PAID)).toBe(true);
  });

  it('should allow transition from paid to delivered', () => {
    expect(canTransition(EscrowState.PAID, EscrowState.DELIVERED)).toBe(true);
  });

  it('should allow transition from delivered to received', () => {
    expect(canTransition(EscrowState.DELIVERED, EscrowState.RECEIVED)).toBe(true);
  });

  it('should allow transition from received to released', () => {
    expect(canTransition(EscrowState.RECEIVED, EscrowState.RELEASED)).toBe(true);
  });

  it('should not allow invalid transitions', () => {
    expect(canTransition(EscrowState.PENDING, EscrowState.PAID)).toBe(false);
    expect(canTransition(EscrowState.PAID, EscrowState.PENDING)).toBe(false);
    expect(canTransition(EscrowState.RELEASED, EscrowState.PAID)).toBe(false);
  });

  it('should allow cancellation from multiple states', () => {
    expect(canTransition(EscrowState.PENDING, EscrowState.CANCELLED)).toBe(true);
    expect(canTransition(EscrowState.WAITING_FOR_PAYMENT, EscrowState.CANCELLED)).toBe(true);
    expect(canTransition(EscrowState.PAID, EscrowState.CANCELLED)).toBe(true);
    expect(canTransition(EscrowState.DELIVERED, EscrowState.CANCELLED)).toBe(true);
  });
});

