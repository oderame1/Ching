import { Router } from 'express';
import { sendNotification } from '../controllers/notifications';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/whatsapp', authenticateToken, sendNotification);
router.post('/email', authenticateToken, sendNotification);

export default router;

