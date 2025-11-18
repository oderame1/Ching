import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch {
    return null;
  }
};

