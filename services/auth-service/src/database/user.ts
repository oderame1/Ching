import { pool } from './connection';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  phone?: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  name: string;
  role: string;
  phone?: string;
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.email, data.password_hash, data.name, data.role, data.phone || null]
  );
  return result.rows[0];
};

