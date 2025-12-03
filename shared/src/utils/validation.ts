import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z
  .string()
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long') // Security: Prevent extremely long inputs
  .refine((val) => !val.includes('\0'), {
    message: 'Null bytes not allowed' // Security: Prevent null byte injection
  })
  // Security: Block dangerous characters that could be used for injection attacks
  // Allow safe formatting characters: spaces, dashes, parentheses, plus sign
  .refine((val) => {
    const dangerousChars = /[;'\"`|&$<>{}[\]\\\/\*]/;
    return !dangerousChars.test(val);
  }, {
    message: 'Invalid characters detected. Only digits, spaces, dashes, parentheses, and + are allowed'
  })
  .transform((val) => {
    // Security: Remove null bytes first
    let cleaned = val.replace(/\0/g, '');
    
    // Normalize to standard format: remove spaces, dashes, parentheses
    const normalized = cleaned.replace(/[\s\-()]/g, '');
    
    // Convert to standard format
    if (normalized.startsWith('0')) {
      return normalized; // Keep as 0XXXXXXXXXX
    } else if (normalized.startsWith('234')) {
      return '+' + normalized; // Convert to +234XXXXXXXXXX
    } else if (normalized.startsWith('+234')) {
      return normalized; // Already in correct format
    } else {
      return normalized; // Return normalized for validation
    }
  })
  .refine((val) => {
    // Validate normalized format: +234XXXXXXXXXX or 0XXXXXXXXXX
    return /^\+?234\d{10}$|^0\d{10}$/.test(val);
  }, {
    message: 'Invalid Nigerian phone number format'
  });

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .refine((val) => !val.includes('\0'), {
    message: 'Null bytes not allowed' // Security: Prevent null byte injection
  })
  .transform((val) => val.replace(/\0/g, '')) // Security: Sanitize null bytes
  .refine((val) => /^\d+$/.test(val), {
    message: 'OTP must contain only digits'
  });

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .min(1, 'Minimum amount is 1')
  .max(10000000, 'Maximum amount is 10,000,000');

export const currencySchema = z.enum(['NGN', 'USD']);

export const escrowIdSchema = z.string().uuid('Invalid escrow ID');

