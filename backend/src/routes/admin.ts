import { Router } from 'express';
import {
  getEscrows,
  getUsers,
  releaseEscrow,
  refundEscrow,
  getAuditLogs,
} from '../controllers/admin';
import { authenticateToken, requireRole } from '../middleware/auth';
import { ipAllowlist } from '../middleware/ipAllowlist';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Admin routes require authentication, admin role, and IP allowlist
router.use(authenticateToken);
router.use(requireRole('admin'));
router.use(ipAllowlist);

router.get('/escrows', asyncHandler(getEscrows));
router.get('/users', asyncHandler(getUsers));
router.post('/release/:id', asyncHandler(releaseEscrow));
router.post('/refund/:id', asyncHandler(refundEscrow));
router.get('/audit-logs', asyncHandler(getAuditLogs));

export default router;

