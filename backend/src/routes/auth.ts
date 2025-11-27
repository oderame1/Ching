import { Router } from 'express';
import { requestOTP, verifyOTP } from '../controllers/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/request-otp', authRateLimiter, asyncHandler(requestOTP));
router.post('/verify', authRateLimiter, asyncHandler(verifyOTP));

export default router;

