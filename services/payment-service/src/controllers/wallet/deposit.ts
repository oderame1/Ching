import { Request, Response } from 'express';
import { depositToWallet, getWalletByUserId } from '../../database/wallet';
import { createTransaction } from '../../database/transaction';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import { z } from 'zod';

const depositSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  payment_method: z.enum(['card', 'bank_transfer', 'other']),
  payment_method_id: z.string().optional(),
});

export const depositController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = depositSchema.parse(req.body);
    
    const wallet = await getWalletByUserId(userId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Process payment (integrate with payment gateway)
    // For now, we'll simulate success
    
    // Update wallet balance
    const updatedWallet = await depositToWallet(wallet.id, data.amount);
    
    // Create transaction record
    const transaction = await createTransaction({
      wallet_id: wallet.id,
      type: 'deposit',
      amount: data.amount,
      currency: data.currency,
      status: 'completed',
      payment_method: data.payment_method,
      payment_method_id: data.payment_method_id,
    });

    // Publish event
    await publishEvent('payment.deposit', {
      transaction_id: transaction.id,
      wallet_id: wallet.id,
      user_id: userId,
      amount: data.amount,
    });
    
    logger.info(`Deposit of ${data.amount} ${data.currency} to wallet ${wallet.id}`);
    
    res.json({ wallet: updatedWallet, transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

