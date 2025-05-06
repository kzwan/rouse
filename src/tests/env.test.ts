import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dotenv before importing env
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn()
  }
}));

// Save original process.env
const originalEnv = process.env;

describe('Environment Module', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load environment variables correctly', async () => {
    const testEnv = {
      SERVER_PORT: '3000',
      DB_USER: 'test_user',
      DB_HOST: 'localhost',
      DB_NAME: 'test_db',
      DB_PASSWORD: 'password123',
      DB_PORT: '5432',
      SLACK_BOT_TOKEN: 'xoxb-test-token',
      SLACK_SIGNING_SECRET: 'test-secret',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: 'redis_password',
      LOG_LEVEL: 'info',
      NODE_ENV: 'test'
    };

    process.env = { ...process.env, ...testEnv };
    const env = (await import('../config/env.js')).default;

    expect(env).toEqual({
      ...testEnv,
      SERVER_PORT: 3000,
      DB_PORT: 5432
    });
  });

  it('should provide default values for missing environment variables', async () => {
    const env = (await import('../config/env.js')).default;
    
    expect(env).toEqual({
      NODE_ENV: 'test',
      SERVER_PORT: 3000,
      DB_USER: '',
      DB_HOST: '',
      DB_NAME: '',
      DB_PASSWORD: '',
      DB_PORT: 5432,
      SLACK_BOT_TOKEN: '',
      SLACK_SIGNING_SECRET: '',
      REDIS_HOST: '',
      REDIS_PORT: '',
      REDIS_PASSWORD: '',
      LOG_LEVEL: 'info'
    });
  });

  it.each([
    ['SERVER_PORT', '3000', 3000],
    ['DB_PORT', '5432', 5432],
    ['SERVER_PORT', '0', 0],
    ['DB_PORT', '0', 0]
  ])('should correctly parse %s from %s to %d', async (key, value, expected) => {
    process.env[key] = value;
    const env = (await import('../config/env.js')).default;
    expect(env[key]).toBe(expected);
  });
});