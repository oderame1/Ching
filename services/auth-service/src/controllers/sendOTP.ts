import { Request, Response } from 'express';
import { generateOTP, storeOTP } from '../utils/otp';
import { sendSMS } from '../utils/sms';
import { logger } from '../utils/logger';
import { z } from 'zod';

const sendOTPSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});

export const sendOTPController = async (req: Request, res: Response) => {
  try {
    const { phone } = sendOTPSchema.parse(req.body);
    
    const otp = generateOTP();
    await storeOTP(phone, otp);
    
    // Send OTP via SMS
    await sendSMS(phone, `Your OTP code is: ${otp}. Valid for 10 minutes.`);
    
    logger.info(`OTP sent to ${phone}`);
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

