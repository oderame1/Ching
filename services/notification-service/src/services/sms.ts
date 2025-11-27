import axios from 'axios';
import { logger } from '../utils/logger';

// Termii SMS service for Nigeria
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'Escrow';
const TERMII_BASE_URL = 'https://api.ng.termii.com/api';

export const sendSMS = async (to: string, message: string): Promise<void> => {
  if (!TERMII_API_KEY) {
    logger.warn('Termii API key not configured, skipping SMS');
    logger.info(`SMS to ${to}: ${message}`);
    return;
  }

  try {
    // Clean phone number (remove + and ensure it starts with 234 for Nigeria)
    let phoneNumber = to.replace(/\+/g, '').replace(/\s/g, '');
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '234' + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('234')) {
      phoneNumber = '234' + phoneNumber;
    }

    const response = await axios.post(
      `${TERMII_BASE_URL}/sms/send`,
      {
        to: phoneNumber,
        from: TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: TERMII_API_KEY,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.code !== 'ok') {
      throw new Error(response.data.message || 'Failed to send SMS');
    }

    logger.info(`SMS sent via Termii to ${to}`);
  } catch (error: any) {
    logger.error('Failed to send SMS via Termii:', error);
    throw new Error(error.response?.data?.message || 'Failed to send SMS');
  }
};
