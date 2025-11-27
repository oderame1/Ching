import { Request, Response } from 'express';
import { z } from 'zod';
import { phoneSchema, otpSchema } from '@escrow/shared';
import { prisma } from '../utils/db';
import { generateOTP, hashOTP, verifyOTP as verifyOTPCode, getOTPExpiry } from '../utils/otp';
import { generateTokens } from '../utils/jwt';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES } from '@escrow/shared';
import { config } from '../config';

const requestOTPSchema = z.object({
  phone: phoneSchema,
});

const verifyOTPSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const requestOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = requestOTPSchema.parse(req.body);

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const expiresAt = getOTPExpiry();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Create user with buyer role by default
      user = await prisma.user.create({
        data: {
          phone,
          email: `${phone}@temp.escrow`, // Temporary email
          name: phone, // Temporary name
          role: 'buyer',
          isVerified: false,
        },
      });
    }

    // Delete all unused OTPs for this user (expired or not)
    // This prevents multiple valid OTPs from existing simultaneously
    await prisma.otpCode.deleteMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
    });

    // Create new OTP
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        phone: user.phone,
        code: hashedOTP,
        expiresAt,
      },
    });

    // TODO: Send OTP via SMS/WhatsApp
    logger.info(`OTP for ${phone}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      expiresIn: 5 * 60, // 5 minutes in seconds
      // In development or test, return OTP for testing
      ...((config.nodeEnv === 'development' || config.nodeEnv === 'test') && { otp }),
    });
  } catch (error) {
    logger.error('Request OTP error:', error);
    throw error;
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = verifyOTPSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
    }

    // Find valid OTP
    const otpCode = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        phone: user.phone,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpCode) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired OTP', 401);
    }

    // Verify OTP
    const isValid = await verifyOTPCode(otp, otpCode.code);

    if (!isValid) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Invalid OTP', 401);
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpCode.id },
      data: { isUsed: true },
    });

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    throw error;
  }
};

