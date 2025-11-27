import { Router } from 'express';
import {
  initiateEscrow,
  getEscrow,
  cancelEscrow,
  markDelivered,
  markReceived,
} from '../controllers/escrow';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Wrap all async handlers to catch errors
router.post('/initiate', authenticateToken, asyncHandler(initiateEscrow));
router.get('/:id', authenticateToken, asyncHandler(getEscrow));
router.post('/:id/pay', authenticateToken, asyncHandler(cancelEscrow)); // Payment handled via payments route
router.post('/:id/cancel', authenticateToken, asyncHandler(cancelEscrow));
router.post('/:id/delivered', authenticateToken, asyncHandler(markDelivered));
router.post('/:id/received', authenticateToken, asyncHandler(markReceived));

export default router;

