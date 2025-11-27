import axios from 'axios';
import { logger } from '../utils/logger';

// Support both SendGrid and Mailgun
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'sendgrid'; // 'sendgrid' or 'mailgun'
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@escrow-platform.com';

export const sendEmail = async (to: string, subject: string, text: string, html?: string): Promise<void> => {
  if (EMAIL_PROVIDER === 'sendgrid') {
    if (!SENDGRID_API_KEY) {
      logger.warn('SendGrid API key not configured, skipping email');
      logger.info(`Email to ${to}: ${subject} - ${text}`);
      return;
    }

    try {
      await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email: to }],
              subject: subject,
            },
          ],
          from: { email: EMAIL_FROM },
          content: [
            {
              type: 'text/plain',
              value: text,
            },
            ...(html
              ? [
                  {
                    type: 'text/html',
                    value: html,
                  },
                ]
              : []),
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info(`Email sent via SendGrid to ${to}`);
    } catch (error: any) {
      logger.error('Failed to send email via SendGrid:', error);
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  } else if (EMAIL_PROVIDER === 'mailgun') {
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      logger.warn('Mailgun API key or domain not configured, skipping email');
      logger.info(`Email to ${to}: ${subject} - ${text}`);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('from', EMAIL_FROM);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('text', text);
      if (html) {
        formData.append('html', html);
      }

      await axios.post(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, formData, {
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      logger.info(`Email sent via Mailgun to ${to}`);
    } catch (error: any) {
      logger.error('Failed to send email via Mailgun:', error);
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  } else {
    throw new Error(`Unsupported email provider: ${EMAIL_PROVIDER}`);
  }
};
