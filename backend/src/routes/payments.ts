import { Router } from 'express';
import { initializePayment, getPaymentStatus } from '../controllers/payments';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/initialize', authenticateToken, asyncHandler(initializePayment));
router.get('/status/:reference', authenticateToken, asyncHandler(getPaymentStatus));

export default router;

