import Redis from 'ioredis';

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
      console.error('[Redis] Connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
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
      console.error('[Redis Cache] Connection error:', err);
    });

    cacheClient.on('connect', () => {
      console.log('[Redis Cache] Connected successfully');
    });
  }

  return cacheClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[Redis] Connection closed');
  }

  if (cacheClient) {
    await cacheClient.quit();
    cacheClient = null;
    console.log('[Redis Cache] Connection closed');
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
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('[Cache] Get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      console.error('[Cache] Set error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('[Cache] Delete error:', error);
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
      console.error('[Cache] Delete pattern error:', error);
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
      console.error('[Cache] Exists error:', error);
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
      console.error('[Cache] Expire error:', error);
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('[Cache] TTL error:', error);
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
      console.error('[Cache] Flush error:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
