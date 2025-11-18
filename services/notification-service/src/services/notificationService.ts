import { sendSMS } from './sms';
import { sendEmail } from './email';
import { sendWhatsApp } from './whatsapp';
import { logger } from '../utils/logger';

export const sendNotification = async (eventType: string, payload: any) => {
  try {
    const { user_id, buyer_id, seller_id, escrow_id, dispute_id } = payload;
    
    // Determine notification type and recipients
    let recipients: string[] = [];
    let message = '';
    let subject = '';

    switch (eventType) {
      case 'notification.escrow.created':
        message = `New escrow transaction created. Escrow ID: ${escrow_id}`;
        subject = 'New Escrow Transaction';
        // Get seller contact info (would fetch from user service)
        break;

      case 'notification.escrow.released':
        message = `Your escrow has been released. Escrow ID: ${escrow_id}`;
        subject = 'Escrow Released';
        break;

      case 'notification.escrow.cancelled':
        message = `Escrow has been cancelled. Escrow ID: ${escrow_id}`;
        subject = 'Escrow Cancelled';
        break;

      case 'notification.dispute.created':
        message = `A dispute has been raised. Dispute ID: ${dispute_id}`;
        subject = 'New Dispute';
        break;

      case 'notification.dispute.resolved':
        message = `Your dispute has been resolved. Dispute ID: ${dispute_id}`;
        subject = 'Dispute Resolved';
        break;

      case 'payment.deposit':
        message = `Deposit of ${payload.amount} ${payload.currency} successful`;
        subject = 'Deposit Confirmed';
        break;

      case 'payment.withdrawal':
        message = `Withdrawal of ${payload.amount} ${payload.currency} initiated`;
        subject = 'Withdrawal Initiated';
        break;

      default:
        logger.warn(`Unknown notification event type: ${eventType}`);
        return;
    }

    // Send via multiple channels
    // In production, fetch user preferences and contact info
    const phone = payload.phone || '+1234567890'; // Would fetch from user service
    const email = payload.email || 'user@example.com'; // Would fetch from user service

    // Send SMS
    if (phone) {
      try {
        await sendSMS(phone, message);
      } catch (error) {
        logger.error('Failed to send SMS:', error);
      }
    }

    // Send Email
    if (email) {
      try {
        await sendEmail(email, subject, message);
      } catch (error) {
        logger.error('Failed to send email:', error);
      }
    }

    // Send WhatsApp (if enabled)
    if (phone && process.env.WHATSAPP_ENABLED === 'true') {
      try {
        await sendWhatsApp(phone, message);
      } catch (error) {
        logger.error('Failed to send WhatsApp:', error);
      }
    }

    logger.info(`Notification sent for event: ${eventType}`);
  } catch (error) {
    logger.error('Error sending notification:', error);
  }
};

