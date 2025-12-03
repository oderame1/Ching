import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config';

// Termii API configuration
const TERMII_BASE_URL = 'https://api.ng.termii.com/api';

// SMS params
export interface SendSMSParams {
    to: string;
    message: string;
}

// Check if Termii is configured
const isTermiiConfigured = !!config.sms?.termiiApiKey;

if (!isTermiiConfigured && config.nodeEnv !== 'test') {
    logger.warn('Termii API key not configured. SMS will be logged instead of sent.');
}

// Send SMS function
export const sendSMS = async (params: SendSMSParams): Promise<void> => {
    // Mock mode if Termii not configured
    if (!isTermiiConfigured) {
        logger.info('[MOCK SMS]', {
            to: params.to,
            message: params.message.substring(0, 100),
        });
        return;
    }

    try {
        const response = await axios.post(`${TERMII_BASE_URL}/sms/send`, {
            to: params.to,
            from: config.sms.senderId || 'Escrow',
            sms: params.message,
            type: 'plain',
            channel: 'generic',
            api_key: config.sms.termiiApiKey,
        });

        if (response.data.message !== 'Successfully Sent') {
            throw new Error(response.data.message || 'Unknown error');
        }

        logger.info(`SMS sent to ${params.to}`);
    } catch (error: any) {
        logger.error('Termii SMS error:', error.response?.data || error.message);
        throw new Error(`Failed to send SMS: ${error.message}`);
    }
};

// Send OTP via SMS
export const sendOTPSMS = async (to: string, otp: string): Promise<void> => {
    const message = `Your Escrow Platform OTP is: ${otp}. Valid for ${config.otp.expiryMinutes} minutes. Do not share this code.`;
    await sendSMS({ to, message });
};

// Send escrow notification via SMS
export const sendEscrowNotificationSMS = async (
    to: string,
    escrowId: string,
    status: string
): Promise<void> => {
    const messages: Record<string, string> = {
        created: `New escrow created: ${escrowId.substring(0, 8)}. Check your account for details.`,
        paid: `Payment received for escrow ${escrowId.substring(0, 8)}. Seller can now deliver.`,
        delivered: `Item delivered for escrow ${escrowId.substring(0, 8)}. Please confirm receipt.`,
        released: `Escrow ${escrowId.substring(0, 8)} completed. Funds released.`,
        cancelled: `Escrow ${escrowId.substring(0, 8)} has been cancelled.`,
    };

    const message = messages[status] || `Escrow ${escrowId.substring(0, 8)} status updated to: ${status}`;
    await sendSMS({ to, message });
};

// Send OTP via Termii's dedicated OTP endpoint (recommended)
export const sendTermiiOTP = async (to: string, otp: string): Promise<void> => {
    // Mock mode
    if (!isTermiiConfigured) {
        logger.info('[MOCK TERMII OTP]', {
            to,
            otp,
        });
        return;
    }

    try {
        const response = await axios.post(`${TERMII_BASE_URL}/sms/otp/send`, {
            api_key: config.sms.termiiApiKey,
            message_type: 'NUMERIC',
            to,
            from: config.sms.senderId || 'Escrow',
            channel: 'generic',
            pin_attempts: 3,
            pin_time_to_live: config.otp.expiryMinutes,
            pin_length: 6,
            pin_placeholder: '< 1234 >',
            message_text: `Your Escrow Platform verification code is < 1234 >. Valid for ${config.otp.expiryMinutes} minutes.`,
            pin_type: 'NUMERIC',
        });

        logger.info(`Termii OTP sent to ${to}`, response.data);
    } catch (error: any) {
        logger.error('Termii OTP error:', error.response?.data || error.message);
        // Fall back to regular SMS
        await sendOTPSMS(to, otp);
    }
};
