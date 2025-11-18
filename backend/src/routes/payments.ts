import { Router } from 'express';
import { initializePayment, getPaymentStatus } from '../controllers/payments';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/initialize', authenticateToken, initializePayment);
router.get('/status/:reference', authenticateToken, getPaymentStatus);

export default router;

