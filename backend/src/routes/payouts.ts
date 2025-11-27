import { Router } from 'express';
import { getPayoutStatus } from '../controllers/payouts';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/status/:reference', authenticateToken, asyncHandler(getPayoutStatus));

export default router;

