import { Router } from 'express';
import { getCurrentUser, updateUser } from '../controllers/users';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/me', authenticateToken, asyncHandler(getCurrentUser));
router.patch('/me', authenticateToken, asyncHandler(updateUser));

export default router;

