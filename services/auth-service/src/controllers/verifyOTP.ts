import { Request, Response } from 'express';
import { verifyOTP } from '../utils/otp';
import { logger } from '../utils/logger';
import { z } from 'zod';

const verifyOTPSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  otp: z.string().length(6),
});

export const verifyOTPController = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = verifyOTPSchema.parse(req.body);
    
    const isValid = await verifyOTP(phone, otp);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }
    
    logger.info(`OTP verified for ${phone}`);
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

