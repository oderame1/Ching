import { Router } from 'express';
import { requestOTP, verifyOTP } from '../controllers/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/request-otp', authRateLimiter, requestOTP);
router.post('/verify', authRateLimiter, verifyOTP);

export default router;

