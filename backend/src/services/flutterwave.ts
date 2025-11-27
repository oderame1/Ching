import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';
import { generateReference } from '@escrow/shared';
import { logger } from '../utils/logger';

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

export interface InitializePaymentParams {
  email: string;
  amount: number;
  currency?: string;
  txRef?: string;
  customerName: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface FlutterwaveResponse {
  status: string;
  message: string;
  data: {
    link: string;
    tx_ref: string;
  };
}

export const initializePayment = async (
  params: InitializePaymentParams
): Promise<FlutterwaveResponse> => {
  try {
    const txRef = params.txRef || `FLW-${generateReference()}`;

    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/payments`,
      {
        tx_ref: txRef,
        amount: params.amount,
        currency: params.currency || 'NGN',
        redirect_url: params.callbackUrl,
        payment_options: 'card,banktransfer,ussd',
        customer: {
          email: params.email,
          name: params.customerName,
        },
        customizations: {
          title: 'Escrow Payment',
          description: params.metadata?.description || 'Escrow transaction payment',
        },
        meta: params.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${config.flutterwave.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Payment initialization failed');
    }

    return response.data;
  } catch (error: any) {
    logger.error('Flutterwave initialization error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to initialize payment with Flutterwave'
    );
  }
};

export const verifyPayment = async (txRef: string) => {
  try {
    const response = await axios.get(
      `${FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?tx_ref=${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${config.flutterwave.secretKey}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    logger.error('Flutterwave verification error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to verify payment with Flutterwave'
    );
  }
};

export const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const computedHash = crypto
    .createHmac('sha256', config.flutterwave.webhookSecret)
    .update(payload)
    .digest('hex');

  return computedHash === signature;
};

