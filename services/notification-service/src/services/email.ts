import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('SMTP not configured, skipping email');
    logger.info(`Email to ${to}: ${subject} - ${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@escrow-platform.com',
      to: to,
      subject: subject,
      text: text,
      html: `<p>${text}</p>`,
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

