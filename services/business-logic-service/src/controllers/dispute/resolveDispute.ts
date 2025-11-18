import { Request, Response } from 'express';
import { resolveDispute, getDisputeById, getEscrowById, updateEscrowStatus } from '../../database/escrow';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authenticateToken';
import axios from 'axios';

const resolveDisputeSchema = z.object({
  resolution: z.enum(['favor_buyer', 'favor_seller', 'partial_buyer', 'partial_seller', 'refund']),
  buyer_amount: z.number().optional(),
  seller_amount: z.number().optional(),
  admin_notes: z.string().min(10),
});

export const resolveDisputeController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = resolveDisputeSchema.parse(req.body);
    
    // Only admin can resolve disputes
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can resolve disputes' });
    }

    const dispute = await getDisputeById(id);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    const escrow = await getEscrowById(dispute.escrow_id);
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    // Calculate amounts based on resolution
    let buyerAmount = 0;
    let sellerAmount = 0;

    if (data.resolution === 'favor_buyer') {
      buyerAmount = escrow.amount;
    } else if (data.resolution === 'favor_seller') {
      sellerAmount = escrow.amount;
    } else if (data.resolution === 'partial_buyer' || data.resolution === 'partial_seller') {
      buyerAmount = data.buyer_amount || 0;
      sellerAmount = data.seller_amount || 0;
    }

    // Execute transfers via payment service
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
    
    if (buyerAmount > 0) {
      await axios.post(`${paymentServiceUrl}/transfer`, {
        escrow_id: escrow.id,
        from_account: escrow.escrow_account_id,
        to_account: escrow.buyer_account_id,
        amount: buyerAmount,
        currency: escrow.currency,
      });
    }

    if (sellerAmount > 0) {
      await axios.post(`${paymentServiceUrl}/transfer`, {
        escrow_id: escrow.id,
        from_account: escrow.escrow_account_id,
        to_account: escrow.seller_account_id,
        amount: sellerAmount,
        currency: escrow.currency,
      });
    }

    // Resolve dispute
    await resolveDispute(id, {
      resolution: data.resolution,
      buyer_amount: buyerAmount,
      seller_amount: sellerAmount,
      admin_notes: data.admin_notes,
      resolved_by: req.user!.userId,
    });

    // Update escrow status
    await updateEscrowStatus(escrow.id, 'completed');
    
    // Publish events
    await publishEvent('dispute.resolved', {
      dispute_id: id,
      escrow_id: escrow.id,
      resolution: data.resolution,
      buyer_amount: buyerAmount,
      seller_amount: sellerAmount,
    });

    await publishEvent('notification.dispute.resolved', {
      dispute_id: id,
      escrow_id: escrow.id,
      buyer_id: escrow.buyer_id,
      seller_id: escrow.seller_id,
    });
    
    logger.info(`Dispute ${id} resolved by admin ${req.user!.userId}`);
    
    res.json({ message: 'Dispute resolved successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Resolve dispute error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.response?.data?.error || error.message 
    });
  }
};

