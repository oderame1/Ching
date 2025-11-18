import { Router } from 'express';
import { getPayoutStatus } from '../controllers/payouts';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/status/:reference', authenticateToken, getPayoutStatus);

export default router;

