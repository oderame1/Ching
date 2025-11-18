import crypto from 'crypto';
import axios from 'axios';
import { config } from '../config';
import { generateReference } from '@escrow/shared';
import { logger } from '../utils/logger';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (multiply by 100)
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export const initializePayment = async (
  params: InitializePaymentParams
): Promise<PaystackResponse> => {
  try {
    const reference = params.reference || `PAY-${generateReference()}`;
    
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: params.email,
        amount: Math.round(params.amount * 100), // Convert to kobo
        reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Payment initialization failed');
    }

    return response.data;
  } catch (error: any) {
    logger.error('Paystack initialization error:', error);
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    logger.error('Paystack verification error:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
};

export const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const hash = crypto
    .createHmac('sha512', config.paystack.webhookSecret)
    .update(payload)
    .digest('hex');

  return hash === signature;
};

