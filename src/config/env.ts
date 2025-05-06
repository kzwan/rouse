import dotenv from 'dotenv';
dotenv.config();

interface Env {
  NODE_ENV: string;
  SERVER_PORT: number;
  
  // Database Settings
  DB_USER: string;
  DB_HOST: string;
  DB_NAME: string;
  DB_PASSWORD: string;
  DB_PORT: number;

  // Slack Credentials
  SLACK_BOT_TOKEN: string;
  SLACK_SIGNING_SECRET: string;

  // Redis Settings
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD: string;

  // Logging Settings
  LOG_LEVEL: string;
}

const env: Env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  SERVER_PORT: parseInt(process.env.SERVER_PORT || '3000'),
  
  // Database Settings
  DB_USER: process.env.DB_USER || '',
  DB_HOST: process.env.DB_HOST || '',
  DB_NAME: process.env.DB_NAME || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),

  // Slack Credentials
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET || '',

  // Redis Settings
  REDIS_HOST: process.env.REDIS_HOST || '',
  REDIS_PORT: process.env.REDIS_PORT || '',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',

  // Logging Settings
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

export default env;