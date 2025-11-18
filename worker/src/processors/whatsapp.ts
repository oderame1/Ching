import { Job } from 'bullmq';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

interface WhatsAppJobData {
  phone: string;
  message: string;
  escrowId?: string;
  userId?: string;
}

export const sendWhatsAppMessageProcessor = async (job: Job<WhatsAppJobData>) => {
  const { phone, message, escrowId, userId } = job.data;

  logger.info(`Sending WhatsApp message to ${phone}`);

  try {
    // Placeholder implementation
    // TODO: Integrate with actual WhatsApp API
    // await notifyViaWhatsApp(phone, message);

    logger.info(`WhatsApp message sent to ${phone}`);

    // Log notification
    if (escrowId) {
      await prisma.notificationLog.create({
        data: {
          escrowId,
          userId: userId || null,
          channel: 'whatsapp',
          recipient: phone,
          message,
          status: 'sent',
          sentAt: new Date(),
        },
      });
    }

    return { success: true };
  } catch (error) {
    logger.error('WhatsApp send error:', error);
    
    // Log failed notification
    if (escrowId) {
      await prisma.notificationLog.create({
        data: {
          escrowId,
          userId: userId || null,
          channel: 'whatsapp',
          recipient: phone,
          message,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }

    throw error;
  }
};

