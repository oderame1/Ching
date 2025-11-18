import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const sendNotificationSchema = z.object({
  recipient: z.string(),
  message: z.string(),
  subject: z.string().optional(),
});

export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const channel = req.path.includes('whatsapp') ? 'whatsapp' : 'email';
    const data = sendNotificationSchema.parse(req.body);

    // Placeholder implementation
    logger.info(`Sending ${channel} notification to ${data.recipient}`);

    // TODO: Integrate with actual notification services
    // notifyViaWhatsApp(phone, message)
    // notifyViaEmail(email, subject, body)

    res.json({
      message: `${channel} notification queued`,
      recipient: data.recipient,
    });
  } catch (error) {
    logger.error('Send notification error:', error);
    throw error;
  }
};

