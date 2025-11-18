import { Router } from 'express';
import { getCurrentUser, updateUser } from '../controllers/users';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateToken, getCurrentUser);
router.patch('/me', authenticateToken, updateUser);

export default router;

