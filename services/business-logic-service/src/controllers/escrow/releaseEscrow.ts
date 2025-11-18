import { Request, Response } from 'express';
import { getEscrowById, updateEscrowStatus } from '../../database/escrow';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import axios from 'axios';

export const releaseEscrowController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const escrow = await getEscrowById(id);
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    // Only buyer can release
    if (escrow.buyer_id !== userId) {
      return res.status(403).json({ error: 'Only buyer can release escrow' });
    }

    if (escrow.status !== 'funded') {
      return res.status(400).json({ error: 'Escrow must be funded to release' });
    }

    // Call payment service to transfer funds
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
    await axios.post(`${paymentServiceUrl}/transfer`, {
      escrow_id: id,
      from_account: escrow.escrow_account_id,
      to_account: escrow.seller_account_id,
      amount: escrow.amount,
      currency: escrow.currency,
    });

    // Update status
    await updateEscrowStatus(id, 'completed');
    
    // Publish events
    await publishEvent('escrow.released', {
      escrow_id: id,
      buyer_id: escrow.buyer_id,
      seller_id: escrow.seller_id,
      amount: escrow.amount,
    });

    await publishEvent('notification.escrow.released', {
      escrow_id: id,
      seller_id: escrow.seller_id,
    });
    
    logger.info(`Escrow ${id} released by buyer ${userId}`);
    
    res.json({ message: 'Escrow released successfully' });
  } catch (error: any) {
    logger.error('Release escrow error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.response?.data?.error || error.message 
    });
  }
};

