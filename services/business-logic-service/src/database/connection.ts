import { Pool } from 'pg';
import { logger } from '../utils/logger';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS escrows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id UUID NOT NULL,
        seller_id UUID NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        description TEXT,
        terms TEXT,
        escrow_account_id UUID,
        buyer_account_id UUID,
        seller_account_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS disputes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        escrow_id UUID NOT NULL REFERENCES escrows(id),
        raised_by UUID NOT NULL,
        reason VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        resolution VARCHAR(50),
        buyer_amount DECIMAL(15, 2),
        seller_amount DECIMAL(15, 2),
        admin_notes TEXT,
        resolved_by UUID,
        evidence_urls TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_escrows_buyer ON escrows(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_escrows_seller ON escrows(seller_id);
      CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);
      CREATE INDEX IF NOT EXISTS idx_disputes_escrow ON disputes(escrow_id);
      CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
    `);
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};

