import { Router } from 'express';
import {
  initiateEscrow,
  getEscrow,
  cancelEscrow,
  markDelivered,
  markReceived,
} from '../controllers/escrow';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/initiate', authenticateToken, initiateEscrow);
router.get('/:id', authenticateToken, getEscrow);
router.post('/:id/pay', authenticateToken, cancelEscrow); // Payment handled via payments route
router.post('/:id/cancel', authenticateToken, cancelEscrow);
router.post('/:id/delivered', authenticateToken, markDelivered);
router.post('/:id/received', authenticateToken, markReceived);

export default router;

