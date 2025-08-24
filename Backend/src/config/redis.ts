import Redis from 'ioredis';
import { logger } from '@/utils/logger';

let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<Redis | null> => {
  try {
    if (redisClient) {
      return redisClient;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    return null;
  }
};

export const getRedisClient = (): Redis | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
};