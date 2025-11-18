import { Request, Response } from 'express';
import { checkBlacklist, detectFraudPatterns } from '../services/fraudDetection';
import { logger } from '../utils/logger';
import { z } from 'zod';

const checkFraudSchema = z.object({
  user_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  ip_address: z.string().optional(),
  amount: z.number().optional(),
  transaction_count: z.number().optional(),
});

export const checkFraudController = async (req: Request, res: Response) => {
  try {
    const data = checkFraudSchema.parse(req.body);
    
    // Check blacklist
    const blacklisted = await checkBlacklist(data);
    if (blacklisted) {
      return res.json({
        is_fraud: true,
        reason: 'User or entity is blacklisted',
        risk_score: 100,
      });
    }

    // Detect fraud patterns
    const fraudPatterns = await detectFraudPatterns(data);
    
    const riskScore = calculateRiskScore(fraudPatterns);
    const isFraud = riskScore >= 70;

    logger.info(`Fraud check completed`, { 
      user_id: data.user_id, 
      risk_score: riskScore,
      is_fraud: isFraud 
    });
    
    res.json({
      is_fraud: isFraud,
      risk_score: riskScore,
      patterns: fraudPatterns,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Check fraud error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateRiskScore = (patterns: any[]): number => {
  let score = 0;
  
  patterns.forEach(pattern => {
    if (pattern.type === 'high_velocity') score += 30;
    if (pattern.type === 'unusual_amount') score += 25;
    if (pattern.type === 'suspicious_ip') score += 20;
    if (pattern.type === 'multiple_accounts') score += 25;
  });
  
  return Math.min(score, 100);
};

