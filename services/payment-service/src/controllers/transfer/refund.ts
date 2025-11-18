import { Request, Response } from 'express';
import { getWalletByAccountId, transferBetweenWallets } from '../../database/wallet';
import { createTransaction } from '../../database/transaction';
import { publishEvent } from '../../utils/eventQueue';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middleware/authenticateToken';
import { z } from 'zod';

const refundSchema = z.object({
  escrow_id: z.string().uuid(),
  from_account: z.string().uuid(),
  to_account: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
});

export const refundController = async (req: AuthRequest, res: Response) => {
  try {
    const data = refundSchema.parse(req.body);
    
    const fromWallet = await getWalletByAccountId(data.from_account);
    const toWallet = await getWalletByAccountId(data.to_account);

    if (!fromWallet || !toWallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (fromWallet.balance < data.amount) {
      return res.status(400).json({ error: 'Insufficient balance for refund' });
    }

    // Perform refund transfer
    await transferBetweenWallets(fromWallet.id, toWallet.id, data.amount);
    
    // Create transaction records
    const refundTransaction = await createTransaction({
      wallet_id: toWallet.id,
      type: 'refund',
      amount: data.amount,
      currency: data.currency,
      status: 'completed',
      related_wallet_id: fromWallet.id,
      escrow_id: data.escrow_id,
    });

    // Publish event
    await publishEvent('payment.refund', {
      transaction_id: refundTransaction.id,
      escrow_id: data.escrow_id,
      from_wallet_id: fromWallet.id,
      to_wallet_id: toWallet.id,
      amount: data.amount,
    });
    
    logger.info(`Refund of ${data.amount} ${data.currency} for escrow ${data.escrow_id}`);
    
    res.json({ transaction: refundTransaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Refund error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

