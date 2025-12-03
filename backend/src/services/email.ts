import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';
import { config } from '../config';

// Email templates type
export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}

// Email params
export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

// Initialize SendGrid
const isSendGridConfigured = !!config.email?.sendgridApiKey;
if (isSendGridConfigured) {
    sgMail.setApiKey(config.email.sendgridApiKey);
} else if (config.nodeEnv !== 'test') {
    logger.warn('SendGrid API key not configured. Emails will be logged instead of sent.');
}

// Email templates
export const templates = {
    otpEmail: (otp: string, expiresInMinutes: number): EmailTemplate => ({
        subject: 'Your OTP Code - Escrow Platform',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p>Your one-time password is:</p>
        <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in ${expiresInMinutes} minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">Escrow Platform - Secure Transactions</p>
      </div>
    `,
        text: `Your OTP code is: ${otp}. This code will expire in ${expiresInMinutes} minutes.`,
    }),

    escrowCreated: (escrowId: string, amount: number, currency: string, role: 'buyer' | 'seller'): EmailTemplate => ({
        subject: `Escrow Created - ${escrowId.substring(0, 8)}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Escrow Created</h2>
        <p>A new escrow transaction has been created.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Escrow ID:</strong> ${escrowId}</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</p>
          <p><strong>Your Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
        </div>
        ${role === 'buyer' ? '<p>Please proceed with payment to activate the escrow.</p>' : '<p>You will be notified when the buyer makes payment.</p>'}
        <p><a href="${config.frontendUrl}/escrow/${escrowId}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Escrow</a></p>
      </div>
    `,
        text: `New escrow created. ID: ${escrowId}, Amount: ${currency} ${amount}, Your role: ${role}`,
    }),

    paymentReceived: (escrowId: string, amount: number, currency: string): EmailTemplate => ({
        subject: `Payment Received - ${escrowId.substring(0, 8)}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✓ Payment Received</h2>
        <p>The payment for your escrow has been received and is now being held securely.</p>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p><strong>Escrow ID:</strong> ${escrowId}</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</p>
          <p><strong>Status:</strong> Paid - Awaiting Delivery</p>
        </div>
        <p>The seller has been notified and can now proceed with the delivery.</p>
        <p><a href="${config.frontendUrl}/escrow/${escrowId}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Escrow</a></p>
      </div>
    `,
        text: `Payment received for escrow ${escrowId}. Amount: ${currency} ${amount}. Status: Paid.`,
    }),

    itemDelivered: (escrowId: string, deliveryNotes?: string): EmailTemplate => ({
        subject: `Item Delivered - ${escrowId.substring(0, 8)}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">📦 Item Delivered</h2>
        <p>The seller has marked the item as delivered.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Escrow ID:</strong> ${escrowId}</p>
          ${deliveryNotes ? `<p><strong>Delivery Notes:</strong><br>${deliveryNotes}</p>` : ''}
        </div>
        <p>Please confirm receipt of the item to release the payment to the seller.</p>
        <p><a href="${config.frontendUrl}/escrow/${escrowId}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm Receipt</a></p>
      </div>
    `,
        text: `Item delivered for escrow ${escrowId}. Please confirm receipt.${deliveryNotes ? ' Notes: ' + deliveryNotes : ''}`,
    }),

    fundsReleased: (escrowId: string, amount: number, currency: string): EmailTemplate => ({
        subject: `Funds Released - ${escrowId.substring(0, 8)}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✓ Funds Released</h2>
        <p>The escrow has been completed successfully and funds have been released!</p>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p><strong>Escrow ID:</strong> ${escrowId}</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</p>
          <p><strong>Status:</strong> ✓ Completed</p>
        </div>
        <p>Thank you for using our escrow service!</p>
      </div>
    `,
        text: `Funds released for escrow ${escrowId}. Amount: ${currency} ${amount}. Transaction completed.`,
    }),
};

// Send email function
export const sendEmail = async (params: SendEmailParams): Promise<void> => {
    const from = config.email?.fromEmail || 'noreply@escrow.com';

    // Mock mode if SendGrid not configured
    if (!isSendGridConfigured) {
        logger.info('[MOCK EMAIL]', {
            to: params.to,
            from,
            subject: params.subject,
            preview: params.text?.substring(0, 100) || params.html.substring(0, 100),
        });
        return;
    }

    try {
        await sgMail.send({
            to: params.to,
            from,
            subject: params.subject,
            html: params.html,
            text: params.text,
        });

        logger.info(`Email sent to ${params.to}: ${params.subject}`);
    } catch (error: any) {
        logger.error('SendGrid error:', error.response?.body || error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// Convenience functions
export const sendOTPEmail = async (to: string, otp: string) => {
    const template = templates.otpEmail(otp, config.otp.expiryMinutes);
    await sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};

export const sendEscrowCreatedEmail = async (
    to: string,
    escrowId: string,
    amount: number,
    currency: string,
    role: 'buyer' | 'seller'
) => {
    const template = templates.escrowCreated(escrowId, amount, currency, role);
    await sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};

export const sendPaymentReceivedEmail = async (
    to: string,
    escrowId: string,
    amount: number,
    currency: string
) => {
    const template = templates.paymentReceived(escrowId, amount, currency);
    await sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};

export const sendItemDeliveredEmail = async (
    to: string,
    escrowId: string,
    deliveryNotes?: string
) => {
    const template = templates.itemDelivered(escrowId, deliveryNotes);
    await sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};

export const sendFundsReleasedEmail = async (
    to: string,
    escrowId: string,
    amount: number,
    currency: string
) => {
    const template = templates.fundsReleased(escrowId, amount, currency);
    await sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};
