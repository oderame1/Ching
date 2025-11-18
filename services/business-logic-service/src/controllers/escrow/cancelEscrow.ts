import { Request, Response } from 'express';
import { getEscrowById, updateEscrowStatus } from '../../database/escrow';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import axios from 'axios';

export const cancelEscrowController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const escrow = await getEscrowById(id);
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    // Both buyer and seller can cancel if not completed
    if (escrow.buyer_id !== userId && escrow.seller_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (escrow.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed escrow' });
    }

    // If funded, refund buyer
    if (escrow.status === 'funded') {
      const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
      await axios.post(`${paymentServiceUrl}/refund`, {
        escrow_id: id,
        from_account: escrow.escrow_account_id,
        to_account: escrow.buyer_account_id,
        amount: escrow.amount,
        currency: escrow.currency,
      });
    }

    // Update status
    await updateEscrowStatus(id, 'cancelled');
    
    // Publish events
    await publishEvent('escrow.cancelled', {
      escrow_id: id,
      cancelled_by: userId,
    });

    await publishEvent('notification.escrow.cancelled', {
      escrow_id: id,
      buyer_id: escrow.buyer_id,
      seller_id: escrow.seller_id,
    });
    
    logger.info(`Escrow ${id} cancelled by ${userId}`);
    
    res.json({ message: 'Escrow cancelled successfully' });
  } catch (error: any) {
    logger.error('Cancel escrow error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.response?.data?.error || error.message 
    });
  }
};

