import { pool } from './connection';

export interface BlacklistEntry {
  id: string;
  user_id?: string;
  email?: string;
  phone?: string;
  ip_address?: string;
  reason: string;
  created_at: Date;
  created_by?: string;
}

export interface CreateBlacklistData {
  user_id?: string;
  email?: string;
  phone?: string;
  ip_address?: string;
  reason: string;
  created_by?: string;
}

export const addToBlacklist = async (data: CreateBlacklistData): Promise<BlacklistEntry> => {
  const result = await pool.query(
    `INSERT INTO blacklist (user_id, email, phone, ip_address, reason, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.user_id || null, data.email || null, data.phone || null, data.ip_address || null, data.reason, data.created_by || null]
  );
  return result.rows[0];
};

export const checkBlacklist = async (data: {
  user_id?: string;
  email?: string;
  phone?: string;
  ip_address?: string;
}): Promise<BlacklistEntry[]> => {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.user_id) {
    conditions.push(`user_id = $${paramCount++}`);
    values.push(data.user_id);
  }
  if (data.email) {
    conditions.push(`email = $${paramCount++}`);
    values.push(data.email);
  }
  if (data.phone) {
    conditions.push(`phone = $${paramCount++}`);
    values.push(data.phone);
  }
  if (data.ip_address) {
    conditions.push(`ip_address = $${paramCount++}`);
    values.push(data.ip_address);
  }

  if (conditions.length === 0) {
    return [];
  }

  const result = await pool.query(
    `SELECT * FROM blacklist WHERE ${conditions.join(' OR ')}`,
    values
  );
  return result.rows;
};

export const getBlacklist = async (filters: {
  user_id?: string;
  email?: string;
  phone?: string;
  ip_address?: string;
}): Promise<BlacklistEntry[]> => {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters.user_id) {
    conditions.push(`user_id = $${paramCount++}`);
    values.push(filters.user_id);
  }
  if (filters.email) {
    conditions.push(`email = $${paramCount++}`);
    values.push(filters.email);
  }
  if (filters.phone) {
    conditions.push(`phone = $${paramCount++}`);
    values.push(filters.phone);
  }
  if (filters.ip_address) {
    conditions.push(`ip_address = $${paramCount++}`);
    values.push(filters.ip_address);
  }

  const query = conditions.length > 0
    ? `SELECT * FROM blacklist WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`
    : 'SELECT * FROM blacklist ORDER BY created_at DESC';

  const result = await pool.query(query, values);
  return result.rows;
};

export const removeFromBlacklist = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM blacklist WHERE id = $1', [id]);
};

export const getTransactionHistory = async (userId: string): Promise<any[]> => {
  const result = await pool.query(
    `SELECT * FROM transaction_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [userId]
  );
  return result.rows;
};

