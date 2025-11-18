import { Request, Response } from 'express';
import { getWalletByAccountId, transferBetweenWallets } from '../../database/wallet';
import { createTransaction } from '../../database/transaction';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import { z } from 'zod';

const transferSchema = z.object({
  escrow_id: z.string().uuid().optional(),
  from_account: z.string().uuid(),
  to_account: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
});

export const transferController = async (req: AuthRequest, res: Response) => {
  try {
    const data = transferSchema.parse(req.body);
    
    const fromWallet = await getWalletByAccountId(data.from_account);
    const toWallet = await getWalletByAccountId(data.to_account);

    if (!fromWallet || !toWallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (fromWallet.balance < data.amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Perform transfer
    await transferBetweenWallets(fromWallet.id, toWallet.id, data.amount);
    
    // Create transaction records
    const fromTransaction = await createTransaction({
      wallet_id: fromWallet.id,
      type: 'transfer_out',
      amount: data.amount,
      currency: data.currency,
      status: 'completed',
      related_wallet_id: toWallet.id,
      escrow_id: data.escrow_id,
    });

    const toTransaction = await createTransaction({
      wallet_id: toWallet.id,
      type: 'transfer_in',
      amount: data.amount,
      currency: data.currency,
      status: 'completed',
      related_wallet_id: fromWallet.id,
      escrow_id: data.escrow_id,
    });

    // Publish event
    await publishEvent('payment.transfer', {
      transaction_id: fromTransaction.id,
      from_wallet_id: fromWallet.id,
      to_wallet_id: toWallet.id,
      amount: data.amount,
      escrow_id: data.escrow_id,
    });
    
    logger.info(`Transfer of ${data.amount} ${data.currency} from ${fromWallet.id} to ${toWallet.id}`);
    
    res.json({ 
      from_transaction: fromTransaction,
      to_transaction: toTransaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

