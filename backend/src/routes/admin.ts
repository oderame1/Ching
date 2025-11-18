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

const router = Router();

// Admin routes require authentication, admin role, and IP allowlist
router.use(authenticateToken);
router.use(requireRole('admin'));
router.use(ipAllowlist);

router.get('/escrows', getEscrows);
router.get('/users', getUsers);
router.post('/release/:id', releaseEscrow);
router.post('/refund/:id', refundEscrow);
router.get('/audit-logs', getAuditLogs);

export default router;

