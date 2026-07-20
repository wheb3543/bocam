import Redis from 'ioredis';
import { createLogger } from '../_core/logger';

const logger = createLogger('redis');

/**
 * Redis connection for BullMQ queues and caching
 * Uses environment variable REDIS_URL or defaults to localhost
 */

let redisClient: Redis | null = null;
let cacheClient: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Connection error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected successfully');
    });
  }

  return redisClient;
}

/**
 * Get Redis client for caching (separate connection for better performance)
 */
export function getCacheClient(): Redis {
  if (!cacheClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    cacheClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    cacheClient.on('error', (err) => {
      logger.error('Cache Connection error:', err);
    });

    cacheClient.on('connect', () => {
      logger.info('Cache Connected successfully');
    });
  }

  return cacheClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Connection closed');
  }

  if (cacheClient) {
    await cacheClient.quit();
    cacheClient = null;
    logger.info('Cache Connection closed');
  }
}

/**
 * Cache helper functions
 */
export class CacheManager {
  private client: Redis;

  constructor() {
    this.client = getCacheClient();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error('Set error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Delete pattern error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Exists error:', error);
      return false;
    }
  }

  /**
   * Set TTL for existing key
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error('Expire error:', error);
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return this.client.ttl(key);
    } catch (error) {
      logger.error('TTL error:', error);
      return -1;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async flush(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      logger.error('Flush error:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
