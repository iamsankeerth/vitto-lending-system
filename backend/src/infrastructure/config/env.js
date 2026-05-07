import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  postgresUrl: requireEnv('POSTGRES_URL'),
  mongodbUrl: requireEnv('MONGODB_URL'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  annualInterestRatePct: parseFloat(process.env.ANNUAL_INTEREST_RATE_PCT || '18'),
  approvalScoreThreshold: parseInt(process.env.APPROVAL_SCORE_THRESHOLD || '60', 10),
};