import twilio from 'twilio';
import { logger } from '../utils/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken 
  ? twilio(accountSid, authToken)
  : null;

export const sendSMS = async (to: string, message: string): Promise<void> => {
  if (!client || !fromNumber) {
    logger.warn('Twilio not configured, skipping SMS');
    logger.info(`SMS to ${to}: ${message}`);
    return;
  }

  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    logger.info(`SMS sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send SMS:', error);
    throw error;
  }
};

