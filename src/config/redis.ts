// config/redis.ts
import { Redis } from "ioredis";
import env from './env.js';
import logger from './logger.js';

// Create a singleton Redis connection
let redisConnection: Redis | null = null;

/**
 * Initialize the Redis connection
 * @returns {Promise<Redis>} Redis connection
 */
export async function initializeRedis(): Promise<Redis> {
  try {
    if (redisConnection) {
      return redisConnection;
    }
    
    // Create Redis connection with better defaults
    redisConnection = new Redis({
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT),
      password: env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        // Exponential backoff with max of 10 seconds
        const delay = Math.min(times * 100, 10000);
        return delay;
      }
    });

    // Set up event handlers
    redisConnection.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redisConnection.on('error', (error: Error) => {
      logger.error({ error }, 'Redis connection error');
    });

    redisConnection.on('reconnecting', () => {
      logger.warn('Reconnecting to Redis...');
    });

    // Test connection
    await redisConnection.ping();
    logger.info('Redis connection established');
    
    return redisConnection;
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Redis connection');
    throw error;
  }
}

/**
 * Get the Redis connection
 * @returns {Redis} Redis connection
 */
export function getRedisConnection(): Redis {
  if (!redisConnection) {
    throw new Error('Redis not initialized. Call initializeRedis() first.');
  }
  return redisConnection;
}

export default {
  initializeRedis,
  getRedisConnection
};