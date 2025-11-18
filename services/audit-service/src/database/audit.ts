import { pool } from './connection';

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: any;
  ip_address?: string;
  created_at: Date;
}

export interface CreateAuditLogData {
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: any;
  ip_address?: string;
}

export interface GetAuditLogsFilters {
  user_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  limit?: number;
  offset?: number;
}

export const createAuditLog = async (data: CreateAuditLogData): Promise<AuditLog> => {
  const result = await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.user_id || null,
      data.action,
      data.entity_type,
      data.entity_id || null,
      JSON.stringify(data.details),
      data.ip_address || null,
    ]
  );
  return result.rows[0];
};

export const getAuditLogs = async (filters: GetAuditLogsFilters): Promise<AuditLog[]> => {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters.user_id) {
    conditions.push(`user_id = $${paramCount++}`);
    values.push(filters.user_id);
  }
  if (filters.action) {
    conditions.push(`action = $${paramCount++}`);
    values.push(filters.action);
  }
  if (filters.entity_type) {
    conditions.push(`entity_type = $${paramCount++}`);
    values.push(filters.entity_type);
  }
  if (filters.entity_id) {
    conditions.push(`entity_id = $${paramCount++}`);
    values.push(filters.entity_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 100;
  const offset = filters.offset || 0;

  const result = await pool.query(
    `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`,
    [...values, limit, offset]
  );
  return result.rows;
};

export const getAuditLogById = async (id: string): Promise<AuditLog | null> => {
  const result = await pool.query('SELECT * FROM audit_logs WHERE id = $1', [id]);
  return result.rows[0] || null;
};

