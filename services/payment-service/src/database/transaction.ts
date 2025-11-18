import { pool } from './connection';

export interface Transaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  payment_method_id?: string;
  bank_account?: string;
  related_wallet_id?: string;
  escrow_id?: string;
  external_transaction_id?: string;
  created_at: Date;
}

export interface CreateTransactionData {
  wallet_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  payment_method_id?: string;
  bank_account?: string;
  related_wallet_id?: string;
  escrow_id?: string;
  external_transaction_id?: string;
}

export const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
  const result = await pool.query(
    `INSERT INTO transactions (wallet_id, type, amount, currency, status, payment_method, 
      payment_method_id, bank_account, related_wallet_id, escrow_id, external_transaction_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [data.wallet_id, data.type, data.amount, data.currency, data.status,
     data.payment_method || null, data.payment_method_id || null, data.bank_account || null,
     data.related_wallet_id || null, data.escrow_id || null, data.external_transaction_id || null]
  );
  return result.rows[0];
};

export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
  return result.rows[0] || null;
};

