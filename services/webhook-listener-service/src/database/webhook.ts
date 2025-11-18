import { pool } from './connection';
import axios from 'axios';

export interface WebhookEvent {
  id: string;
  source: string;
  event_type: string;
  payload: any;
  signature?: string;
  processed: boolean;
  created_at: Date;
}

export interface CreateWebhookEventData {
  source: string;
  event_type: string;
  payload: any;
  signature?: string;
}

export const saveWebhookEvent = async (data: CreateWebhookEventData): Promise<WebhookEvent> => {
  const result = await pool.query(
    `INSERT INTO webhook_events (source, event_type, payload, signature)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.source, data.event_type, JSON.stringify(data.payload), data.signature || null]
  );
  return result.rows[0];
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: string,
  metadata?: any
): Promise<void> => {
  // This would typically update the transaction in the payment service
  // For now, we'll just log it
  console.log(`Updating transaction ${transactionId} to status ${status}`, metadata);
};

