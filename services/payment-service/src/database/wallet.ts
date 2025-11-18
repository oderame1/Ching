import { pool } from './connection';

export interface Wallet {
  id: string;
  user_id: string;
  account_id: string;
  balance: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWalletData {
  user_id: string;
  currency: string;
}

export const createWallet = async (data: CreateWalletData): Promise<Wallet> => {
  const result = await pool.query(
    `INSERT INTO wallets (user_id, currency)
     VALUES ($1, $2)
     RETURNING *`,
    [data.user_id, data.currency]
  );
  return result.rows[0];
};

export const getWalletByUserId = async (userId: string): Promise<Wallet | null> => {
  const result = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
};

export const getWalletByAccountId = async (accountId: string): Promise<Wallet | null> => {
  const result = await pool.query('SELECT * FROM wallets WHERE account_id = $1', [accountId]);
  return result.rows[0] || null;
};

export const depositToWallet = async (walletId: string, amount: number): Promise<Wallet> => {
  const result = await pool.query(
    `UPDATE wallets 
     SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [amount, walletId]
  );
  return result.rows[0];
};

export const withdrawFromWallet = async (walletId: string, amount: number): Promise<Wallet> => {
  const result = await pool.query(
    `UPDATE wallets 
     SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [amount, walletId]
  );
  return result.rows[0];
};

export const transferBetweenWallets = async (
  fromWalletId: string,
  toWalletId: string,
  amount: number
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Withdraw from source
    await client.query(
      `UPDATE wallets SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [amount, fromWalletId]
    );
    
    // Deposit to destination
    await client.query(
      `UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [amount, toWalletId]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

