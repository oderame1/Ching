export const config = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  },
  monnify: {
    apiKey: process.env.MONNIFY_API_KEY || '',
    secretKey: process.env.MONNIFY_SECRET_KEY || '',
    contractCode: process.env.MONNIFY_CONTRACT_CODE || '',
  },
};

