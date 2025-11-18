import { describe, it, expect } from 'vitest';
import { phoneSchema, otpSchema, amountSchema, currencySchema, escrowIdSchema } from '@escrow/shared';

describe('Validation Schemas', () => {
  describe('phoneSchema', () => {
    it('should accept valid Nigerian phone numbers', () => {
      expect(phoneSchema.safeParse('+2348123456789').success).toBe(true);
      expect(phoneSchema.safeParse('08123456789').success).toBe(true);
      expect(phoneSchema.safeParse('2348123456789').success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('123456789').success).toBe(false);
      expect(phoneSchema.safeParse('081234567').success).toBe(false);
      expect(phoneSchema.safeParse('+1234567890').success).toBe(false);
    });
  });

  describe('otpSchema', () => {
    it('should accept valid 6-digit OTP', () => {
      expect(otpSchema.safeParse('123456').success).toBe(true);
      expect(otpSchema.safeParse('000000').success).toBe(true);
      expect(otpSchema.safeParse('999999').success).toBe(true);
    });

    it('should reject invalid OTP', () => {
      expect(otpSchema.safeParse('12345').success).toBe(false);
      expect(otpSchema.safeParse('1234567').success).toBe(false);
      expect(otpSchema.safeParse('abcdef').success).toBe(false);
      expect(otpSchema.safeParse('12 3456').success).toBe(false);
    });
  });

  describe('amountSchema', () => {
    it('should accept valid amounts', () => {
      expect(amountSchema.safeParse(1).success).toBe(true);
      expect(amountSchema.safeParse(1000).success).toBe(true);
      expect(amountSchema.safeParse(10000000).success).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(amountSchema.safeParse(0).success).toBe(false);
      expect(amountSchema.safeParse(-1).success).toBe(false);
      expect(amountSchema.safeParse(10000001).success).toBe(false);
    });
  });

  describe('currencySchema', () => {
    it('should accept valid currencies', () => {
      expect(currencySchema.safeParse('NGN').success).toBe(true);
      expect(currencySchema.safeParse('USD').success).toBe(true);
    });

    it('should reject invalid currencies', () => {
      expect(currencySchema.safeParse('EUR').success).toBe(false);
      expect(currencySchema.safeParse('GBP').success).toBe(false);
    });
  });

  describe('escrowIdSchema', () => {
    it('should accept valid UUIDs', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(escrowIdSchema.safeParse(validUUID).success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(escrowIdSchema.safeParse('invalid-id').success).toBe(false);
      expect(escrowIdSchema.safeParse('123').success).toBe(false);
    });
  });
});

