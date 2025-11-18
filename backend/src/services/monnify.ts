import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';
import { generateReference } from '@escrow/shared';
import { logger } from '../utils/logger';

const MONNIFY_BASE_URL = 'https://api.monnify.com';

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

const getAccessToken = async (): Promise<string> => {
  // Check if token is still valid
  if (accessToken && tokenExpiry && tokenExpiry > new Date()) {
    return accessToken;
  }

  try {
    const authString = Buffer.from(
      `${config.monnify.apiKey}:${config.monnify.secretKey}`
    ).toString('base64');

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/auth/login`,
      {},
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      }
    );

    accessToken = response.data.responseBody.accessToken;
    // Token expires in 1 hour, refresh at 50 minutes
    tokenExpiry = new Date(Date.now() + 50 * 60 * 1000);

    return accessToken;
  } catch (error: any) {
    logger.error('Monnify auth error:', error);
    throw new Error('Failed to authenticate with Monnify');
  }
};

export interface InitializePaymentParams {
  email: string;
  amount: number;
  currency?: string;
  paymentReference?: string;
  customerName: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface MonnifyResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    checkoutUrl: string;
  };
}

export const initializePayment = async (
  params: InitializePaymentParams
): Promise<MonnifyResponse> => {
  try {
    const token = await getAccessToken();
    const paymentReference = params.paymentReference || `MON-${generateReference()}`;

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
      {
        amount: params.amount,
        customerName: params.customerName,
        customerEmail: params.email,
        paymentReference,
        paymentDescription: params.metadata?.description || 'Escrow payment',
        currencyCode: params.currency || 'NGN',
        contractCode: config.monnify.contractCode,
        redirectUrl: params.callbackUrl,
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
        metadata: params.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.requestSuccessful) {
      throw new Error(response.data.responseMessage || 'Payment initialization failed');
    }

    return response.data;
  } catch (error: any) {
    logger.error('Monnify initialization error:', error);
    throw new Error(error.response?.data?.responseMessage || 'Failed to initialize payment');
  }
};

export const verifyPayment = async (transactionReference: string) => {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      `${MONNIFY_BASE_URL}/api/v2/transactions/${transactionReference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    logger.error('Monnify verification error:', error);
    throw new Error(error.response?.data?.responseMessage || 'Failed to verify payment');
  }
};

export const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const computedHash = crypto
    .createHmac('sha512', config.monnify.webhookSecret)
    .update(payload)
    .digest('hex');

  return computedHash === signature;
};

