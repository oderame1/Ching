import { pool } from './connection';

export interface Escrow {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  terms?: string;
  escrow_account_id?: string;
  buyer_account_id?: string;
  seller_account_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Dispute {
  id: string;
  escrow_id: string;
  raised_by: string;
  reason: string;
  description: string;
  status: string;
  resolution?: string;
  buyer_amount?: number;
  seller_amount?: number;
  admin_notes?: string;
  resolved_by?: string;
  evidence_urls: string[];
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

export interface CreateEscrowData {
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  description?: string;
  terms?: string;
}

export interface CreateDisputeData {
  escrow_id: string;
  raised_by: string;
  reason: string;
  description: string;
  evidence_urls: string[];
}

export const createEscrow = async (data: CreateEscrowData): Promise<Escrow> => {
  const result = await pool.query(
    `INSERT INTO escrows (buyer_id, seller_id, amount, currency, description, terms)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.buyer_id, data.seller_id, data.amount, data.currency, data.description || null, data.terms || null]
  );
  return result.rows[0];
};

export const getEscrowById = async (id: string): Promise<Escrow | null> => {
  const result = await pool.query('SELECT * FROM escrows WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updateEscrowStatus = async (id: string, status: string): Promise<Escrow> => {
  const result = await pool.query(
    'UPDATE escrows SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

export const createDispute = async (data: CreateDisputeData): Promise<Dispute> => {
  const result = await pool.query(
    `INSERT INTO disputes (escrow_id, raised_by, reason, description, evidence_urls)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.escrow_id, data.raised_by, data.reason, data.description, data.evidence_urls]
  );
  return result.rows[0];
};

export const getDisputeById = async (id: string): Promise<Dispute | null> => {
  const result = await pool.query('SELECT * FROM disputes WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updateDispute = async (id: string, data: Partial<Dispute>): Promise<Dispute> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.status) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }
  if (data.admin_notes) {
    updates.push(`admin_notes = $${paramCount++}`);
    values.push(data.admin_notes);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE disputes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const resolveDispute = async (
  id: string,
  data: {
    resolution: string;
    buyer_amount?: number;
    seller_amount?: number;
    admin_notes: string;
    resolved_by: string;
  }
): Promise<Dispute> => {
  const result = await pool.query(
    `UPDATE disputes 
     SET resolution = $1, buyer_amount = $2, seller_amount = $3, admin_notes = $4, 
         resolved_by = $5, status = 'resolved', resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [data.resolution, data.buyer_amount || null, data.seller_amount || null, data.admin_notes, data.resolved_by, id]
  );
  return result.rows[0];
};

