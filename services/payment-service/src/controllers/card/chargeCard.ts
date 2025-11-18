import { Request, Response } from 'express';
import { getCardById, getWalletByUserId, depositToWallet } from '../../database/wallet';
import { createTransaction } from '../../database/transaction';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const chargeCardSchema = z.object({
  card_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
});

export const chargeCardController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = chargeCardSchema.parse(req.body);
    
    const card = await getCardById(data.card_id);
    if (!card || card.user_id !== userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const wallet = await getWalletByUserId(userId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Charge card via Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        payment_method: card.payment_method_id,
        confirm: true,
      });

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment failed' });
      }

      // Deposit to wallet
      const updatedWallet = await depositToWallet(wallet.id, data.amount);
      
      // Create transaction
      const transaction = await createTransaction({
        wallet_id: wallet.id,
        type: 'deposit',
        amount: data.amount,
        currency: data.currency,
        status: 'completed',
        payment_method: 'card',
        payment_method_id: card.payment_method_id,
        external_transaction_id: paymentIntent.id,
      });

      // Publish event
      await publishEvent('payment.card.charged', {
        transaction_id: transaction.id,
        wallet_id: wallet.id,
        user_id: userId,
        amount: data.amount,
      });

      res.json({ wallet: updatedWallet, transaction });
    } catch (error: any) {
      logger.error('Stripe charge error:', error);
      return res.status(400).json({ error: error.message || 'Payment failed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Charge card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

