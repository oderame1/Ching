import twilio from 'twilio';
import { logger } from '../utils/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const client = accountSid && authToken 
  ? twilio(accountSid, authToken)
  : null;

export const sendWhatsApp = async (to: string, message: string): Promise<void> => {
  if (!client) {
    logger.warn('Twilio not configured, skipping WhatsApp');
    logger.info(`WhatsApp to ${to}: ${message}`);
    return;
  }

  try {
    // Format phone number for WhatsApp
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    await client.messages.create({
      body: message,
      from: whatsappFrom,
      to: whatsappTo,
    });
    logger.info(`WhatsApp sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send WhatsApp:', error);
    throw error;
  }
};

