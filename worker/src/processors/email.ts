import { Job } from 'bullmq';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

interface EmailJobData {
  email: string;
  subject: string;
  body: string;
  escrowId?: string;
  userId?: string;
}

export const sendEmailProcessor = async (job: Job<EmailJobData>) => {
  const { email, subject, body, escrowId, userId } = job.data;

  logger.info(`Sending email to ${email}`);

  try {
    // Placeholder implementation
    // TODO: Integrate with actual email service
    // await notifyViaEmail(email, subject, body);

    logger.info(`Email sent to ${email}`);

    // Log notification
    if (escrowId) {
      await prisma.notificationLog.create({
        data: {
          escrowId,
          userId: userId || null,
          channel: 'email',
          recipient: email,
          subject,
          message: body,
          status: 'sent',
          sentAt: new Date(),
        },
      });
    }

    return { success: true };
  } catch (error) {
    logger.error('Email send error:', error);
    
    // Log failed notification
    if (escrowId) {
      await prisma.notificationLog.create({
        data: {
          escrowId,
          userId: userId || null,
          channel: 'email',
          recipient: email,
          subject,
          message: body,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }

    throw error;
  }
};

