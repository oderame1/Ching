import { Request, Response } from 'express';
import { addCard, getCardsByUserId } from '../../database/card';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const addCardSchema = z.object({
  card_number: z.string().regex(/^\d{13,19}$/),
  expiry_month: z.number().min(1).max(12),
  expiry_year: z.number().min(new Date().getFullYear()),
  cvv: z.string().regex(/^\d{3,4}$/),
  cardholder_name: z.string().min(2),
});

export const addCardController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = addCardSchema.parse(req.body);
    
    // Create payment method with Stripe (or other payment processor)
    let paymentMethodId: string;
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: data.card_number,
          exp_month: data.expiry_month,
          exp_year: data.expiry_year,
          cvc: data.cvv,
        },
      });
      paymentMethodId = paymentMethod.id;
    } catch (error) {
      logger.error('Stripe error:', error);
      return res.status(400).json({ error: 'Invalid card details' });
    }

    // Store card in database (masked)
    const maskedCard = `****${data.card_number.slice(-4)}`;
    const card = await addCard({
      user_id: userId,
      payment_method_id: paymentMethodId,
      last_four: data.card_number.slice(-4),
      cardholder_name: data.cardholder_name,
      expiry_month: data.expiry_month,
      expiry_year: data.expiry_year,
      masked_number: maskedCard,
    });
    
    logger.info(`Card added for user ${userId}`);
    
    res.status(201).json(card);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Add card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

