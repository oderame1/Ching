import { checkBlacklist as checkBlacklistDB, getTransactionHistory } from '../database/blacklist';
import { logger } from '../utils/logger';

export const checkBlacklist = async (data: {
  user_id?: string;
  email?: string;
  phone?: string;
  ip_address?: string;
}): Promise<boolean> => {
  const blacklist = await checkBlacklistDB(data);
  return blacklist.length > 0;
};

export const detectFraudPatterns = async (data: {
  user_id?: string;
  email?: string;
  phone?: string;
  ip_address?: string;
  amount?: number;
  transaction_count?: number;
}): Promise<any[]> => {
  const patterns: any[] = [];

  if (data.user_id) {
    const history = await getTransactionHistory(data.user_id);
    
    // High velocity transactions
    const recentTransactions = history.filter(t => {
      const transactionTime = new Date(t.created_at);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return transactionTime > oneHourAgo;
    });

    if (recentTransactions.length > 10) {
      patterns.push({
        type: 'high_velocity',
        description: 'Too many transactions in short time',
        count: recentTransactions.length,
      });
    }

    // Unusual amount
    if (data.amount) {
      const avgAmount = history.reduce((sum, t) => sum + parseFloat(t.amount), 0) / history.length;
      if (data.amount > avgAmount * 5 && history.length > 0) {
        patterns.push({
          type: 'unusual_amount',
          description: 'Amount significantly higher than average',
          amount: data.amount,
          average: avgAmount,
        });
      }
    }
  }

  // Suspicious IP
  if (data.ip_address) {
    // Check if IP is from known VPN/proxy (simplified)
    const suspiciousIPs = ['192.168.1.100']; // Would check against IP reputation service
    if (suspiciousIPs.includes(data.ip_address)) {
      patterns.push({
        type: 'suspicious_ip',
        description: 'IP address flagged as suspicious',
        ip: data.ip_address,
      });
    }
  }

  return patterns;
};

