import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

const OTP_EXPIRY = 600; // 10 minutes

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (phone: string, otp: string): Promise<void> => {
  await redisClient.setEx(`otp:${phone}`, OTP_EXPIRY, otp);
};

export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  const storedOTP = await redisClient.get(`otp:${phone}`);
  if (!storedOTP) {
    return false;
  }
  
  if (storedOTP === otp) {
    await redisClient.del(`otp:${phone}`);
    return true;
  }
  
  return false;
};

