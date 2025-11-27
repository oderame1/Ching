import { Router } from 'express';
import { sendNotification } from '../controllers/notifications';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/whatsapp', authenticateToken, asyncHandler(sendNotification));
router.post('/email', authenticateToken, asyncHandler(sendNotification));

export default router;

