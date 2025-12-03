import { Router } from 'express';
import { requestOTP, verifyOTP } from '../controllers/auth';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Security: Apply stricter rate limiting for OTP requests
router.post('/request-otp', otpRateLimiter, asyncHandler(requestOTP));
router.post('/verify', authRateLimiter, asyncHandler(verifyOTP));

export default router;

