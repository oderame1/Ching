import { Request, Response } from 'express';
import { createEscrow } from '../../database/escrow';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authenticateToken';
import axios from 'axios';

const createEscrowSchema = z.object({
  seller_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  terms: z.string().optional(),
});

export const createEscrowController = async (req: AuthRequest, res: Response) => {
  try {
    const buyerId = req.user!.userId;
    const data = createEscrowSchema.parse(req.body);
    
    // Create escrow transaction
    const escrow = await createEscrow({
      buyer_id: buyerId,
      seller_id: data.seller_id,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      terms: data.terms,
    });

    // Publish event for payment service
    await publishEvent('escrow.created', {
      escrow_id: escrow.id,
      buyer_id: buyerId,
      seller_id: data.seller_id,
      amount: data.amount,
      currency: data.currency,
    });

    // Publish event for notifications
    await publishEvent('notification.escrow.created', {
      escrow_id: escrow.id,
      buyer_id: buyerId,
      seller_id: data.seller_id,
    });

    logger.info(`Escrow ${escrow.id} created by buyer ${buyerId}`);
    
    res.status(201).json(escrow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Create escrow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

