# 🔧 Security Vulnerability Fixes

## Identified Vulnerabilities

Based on the security test suite, 4 vulnerabilities were found:

1. ⚠️ **Rate Limiting Bypass** - HIGH severity
2. ⚠️ **Input Length Validation Missing** - MEDIUM severity  
3. ⚠️ **Input Format Validation Insufficient** - MEDIUM severity
4. ⚠️ **Null Byte Injection Not Handled** - LOW severity

---

## Fix 1: Strengthen Input Validation

### Current State
The `phoneSchema` and `otpSchema` in `shared/src/utils/validation.ts` need enhancement.

### Fix Implementation

```typescript
// shared/src/utils/validation.ts

import { z } from 'zod';

// Enhanced phone schema with max length and null byte protection
export const phoneSchema = z
  .string()
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long') // ADD: Max length validation
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .refine((val) => !val.includes('\0'), {
    message: 'Null bytes not allowed' // ADD: Null byte protection
  })
  .refine((val) => !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
    message: 'Special characters not allowed' // ADD: Special character validation
  })
  .transform((val) => val.replace(/\0/g, '')); // ADD: Sanitize null bytes

// Enhanced OTP schema
export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits') // Already has length
  .regex(/^\d{6}$/, 'OTP must contain only digits')
  .refine((val) => !val.includes('\0'), {
    message: 'Null bytes not allowed'
  })
  .transform((val) => val.replace(/\0/g, '')); // Sanitize null bytes
```

---

## Fix 2: Improve Rate Limiting

### Current State
Rate limiting exists but may not be strict enough for authentication endpoints.

### Fix Implementation

```typescript
// backend/src/middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import { config } from '../config';

// Stricter rate limiter for authentication
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // REDUCE: 3 login attempts per 15 minutes (was 5)
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // ADD: Store rate limit info in Redis for distributed systems
  // store: redisStore,
});

// Stricter rate limiter for OTP requests
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // ADD: Limit OTP requests to 3 per 15 minutes
  message: 'Too many OTP requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // REDUCE: 50 requests per 15 minutes (was 100)
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Update Routes

```typescript
// backend/src/routes/auth.ts

import { Router } from 'express';
import { requestOTP, verifyOTP } from '../controllers/auth';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Apply stricter rate limiting
router.post('/request-otp', otpRateLimiter, asyncHandler(requestOTP));
router.post('/verify', authRateLimiter, asyncHandler(verifyOTP));

export default router;
```

---

## Fix 3: Add Request Body Size Limits

### Implementation

```typescript
// backend/src/index.ts

import express from 'express';

const app = express();

// ADD: Limit request body size
app.use(express.json({ limit: '10kb' })); // Limit JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limit URL-encoded
```

---

## Fix 4: Add Input Sanitization Middleware

### Implementation

```typescript
// backend/src/middleware/sanitize.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize input by removing null bytes and dangerous characters
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/\0/g, '').trim();
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return obj;
    };
    req.body = sanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/\0/g, '').trim();
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return obj;
    };
    req.query = sanitize(req.query);
  }

  next();
};
```

### Apply Middleware

```typescript
// backend/src/index.ts

import { sanitizeInput } from './middleware/sanitize';

// Apply sanitization early in the middleware chain
app.use(sanitizeInput);
```

---

## Testing the Fixes

After implementing the fixes, run the security test suite again:

```bash
cd /Users/pro/Ching
./security-test-suite.sh
```

Expected results:
- ✅ Rate limiting should now block after 3 requests
- ✅ Input length validation should reject long inputs
- ✅ Input format validation should reject special characters
- ✅ Null byte injection should be sanitized

---

## Priority Order

1. **Immediate:** Fix rate limiting (HIGH severity)
2. **Immediate:** Add input length validation (MEDIUM severity)
3. **Short-term:** Strengthen format validation (MEDIUM severity)
4. **Short-term:** Add null byte sanitization (LOW severity)

---

## Additional Recommendations

1. **Implement Redis-based rate limiting** for distributed systems
2. **Add CAPTCHA** for sensitive operations (OTP requests)
3. **Implement request timeout** middleware
4. **Add security headers** (HSTS, CSP, X-Frame-Options)
5. **Set up security monitoring** and alerting
6. **Regular security audits** (quarterly)

