import { Pool } from 'pg';
import { logger } from '../utils/logger';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        account_id UUID UNIQUE DEFAULT gen_random_uuid(),
        balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        payment_method_id VARCHAR(255) NOT NULL,
        last_four VARCHAR(4) NOT NULL,
        cardholder_name VARCHAR(255) NOT NULL,
        expiry_month INTEGER NOT NULL,
        expiry_year INTEGER NOT NULL,
        masked_number VARCHAR(20) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_id UUID NOT NULL REFERENCES wallets(id),
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_method_id VARCHAR(255),
        bank_account VARCHAR(255),
        related_wallet_id UUID,
        escrow_id UUID,
        external_transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
      CREATE INDEX IF NOT EXISTS idx_wallets_account ON wallets(account_id);
      CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_escrow ON transactions(escrow_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    `);
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};

