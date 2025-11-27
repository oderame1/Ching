import { Router } from 'express';
import { prisma } from '../utils/db';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Dev-only endpoint to get the latest OTP for a phone number
router.get('/otp/:phone', asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        return res.status(404).json({ error: 'Not found' });
    }

    try {
        const { phone } = req.params;

        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

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
            return res.status(404).json({ error: 'No valid OTP found' });
        }

        res.json({
            phone: user.phone,
            message: 'OTP found (hashed in DB, check backend logs for plain text)',
            expiresAt: otpCode.expiresAt,
            createdAt: otpCode.createdAt,
        });
}));

export default router;
