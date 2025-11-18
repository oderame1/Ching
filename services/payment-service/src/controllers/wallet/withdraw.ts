import { Request, Response } from 'express';
import { withdrawFromWallet, getWalletByUserId } from '../../database/wallet';
import { createTransaction } from '../../database/transaction';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import { z } from 'zod';

const withdrawSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  bank_account: z.string().optional(),
});

export const withdrawController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = withdrawSchema.parse(req.body);
    
    const wallet = await getWalletByUserId(userId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (wallet.balance < data.amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update wallet balance
    const updatedWallet = await withdrawFromWallet(wallet.id, data.amount);
    
    // Create transaction record
    const transaction = await createTransaction({
      wallet_id: wallet.id,
      type: 'withdrawal',
      amount: data.amount,
      currency: data.currency,
      status: 'pending', // Will be updated when bank transfer completes
      bank_account: data.bank_account,
    });

    // Publish event
    await publishEvent('payment.withdrawal', {
      transaction_id: transaction.id,
      wallet_id: wallet.id,
      user_id: userId,
      amount: data.amount,
    });
    
    logger.info(`Withdrawal of ${data.amount} ${data.currency} from wallet ${wallet.id}`);
    
    res.json({ wallet: updatedWallet, transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Withdraw error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

