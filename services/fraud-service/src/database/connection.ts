import { Pool } from 'pg';
import { logger } from '../utils/logger';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blacklist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        email VARCHAR(255),
        phone VARCHAR(20),
        ip_address VARCHAR(45),
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID
      );

      CREATE TABLE IF NOT EXISTS transaction_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_blacklist_user ON blacklist(user_id);
      CREATE INDEX IF NOT EXISTS idx_blacklist_email ON blacklist(email);
      CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON blacklist(phone);
      CREATE INDEX IF NOT EXISTS idx_blacklist_ip ON blacklist(ip_address);
      CREATE INDEX IF NOT EXISTS idx_transaction_history_user ON transaction_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_transaction_history_created ON transaction_history(created_at);
    `);
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};

