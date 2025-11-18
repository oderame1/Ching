import { Router } from 'express';
import { loginController } from '../controllers/login';
import { registerController } from '../controllers/register';
import { sendOTPController } from '../controllers/sendOTP';
import { verifyOTPController } from '../controllers/verifyOTP';
import { refreshTokenController } from '../controllers/refreshToken';
import { authenticateToken } from '../middleware/authenticateToken';

export const authRoutes = Router();

authRoutes.post('/register', registerController);
authRoutes.post('/login', loginController);
authRoutes.post('/send-otp', sendOTPController);
authRoutes.post('/verify-otp', verifyOTPController);
authRoutes.post('/refresh-token', refreshTokenController);
authRoutes.get('/me', authenticateToken, (req, res) => {
  res.json({ user: (req as any).user });
});

