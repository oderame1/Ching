import { pool } from './connection';

export interface Card {
  id: string;
  user_id: string;
  payment_method_id: string;
  last_four: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  masked_number: string;
  is_default: boolean;
  created_at: Date;
}

export interface CreateCardData {
  user_id: string;
  payment_method_id: string;
  last_four: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  masked_number: string;
}

export const addCard = async (data: CreateCardData): Promise<Card> => {
  const result = await pool.query(
    `INSERT INTO cards (user_id, payment_method_id, last_four, cardholder_name, expiry_month, expiry_year, masked_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.user_id, data.payment_method_id, data.last_four, data.cardholder_name, 
     data.expiry_month, data.expiry_year, data.masked_number]
  );
  return result.rows[0];
};

export const getCardsByUserId = async (userId: string): Promise<Card[]> => {
  const result = await pool.query('SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
};

export const getCardById = async (id: string): Promise<Card | null> => {
  const result = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const deleteCard = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM cards WHERE id = $1', [id]);
};

