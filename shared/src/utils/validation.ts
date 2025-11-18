import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z
  .string()
  .regex(/^\+?234\d{10}$|^0\d{10}$/, 'Invalid Nigerian phone number');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only digits');

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .min(1, 'Minimum amount is 1')
  .max(10000000, 'Maximum amount is 10,000,000');

export const currencySchema = z.enum(['NGN', 'USD']);

export const escrowIdSchema = z.string().uuid('Invalid escrow ID');

