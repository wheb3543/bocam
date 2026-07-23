import Redis from 'ioredis';
import { createLogger } from '../_core/logger';

const logger = createLogger('redis');
const redisUrl = process.env.REDIS_URL;
const redisConfigured = Boolean(redisUrl);
let redisUnavailable = false;
let cacheUnavailable = false;

let redisClient: Redis | null = null;
let cacheClient: Redis | null = null;

function createRedisClient(): Redis {
  const client = new Redis(redisUrl as string, {
    lazyConnect: true,
    connectTimeout: 1000,
    maxRetriesPerRequest: 0,
    enableReadyCheck: false,
    enableOfflineQueue: false,
    reconnectOnError: () => false,
    retryStrategy: () => null,
  });

  client.on('error', (err) => {
    logger.error('Connection error:', err);
  });

  client.on('connect', () => {
    logger.info('Connected successfully');
  });

  return client;
}

function createCacheClient(): Redis {
  const client = new Redis(redisUrl as string, {
    lazyConnect: true,
    connectTimeout: 1000,
    maxRetriesPerRequest: 0,
    enableReadyCheck: false,
    enableOfflineQueue: false,
    reconnectOnError: () => false,
    retryStrategy: () => null,
  });

  client.on('error', (err) => {
    logger.error('Cache Connection error:', err);
  });

  client.on('connect', () => {
    logger.info('Cache Connected successfully');
  });

  return client;
}

export async function getRedisConnection(): Promise<Redis | null> {
  if (!redisConfigured || redisUnavailable) {
    if (!redisConfigured) {
      logger.info('Redis is not configured. Skipping Redis connection.');
    }
    return null;
  }

  if (!redisClient) {
    redisClient = createRedisClient();
  }

  try {
    await redisClient.connect();
    await redisClient.ping();
    return redisClient;
  } catch {
    logger.warn('Redis unavailable. Falling back to null connection.');
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch {
        // ignore cleanup errors
      }
    }
    redisClient = null;
    redisUnavailable = true;
    return null;
  }
}

export function getCacheClient(): Redis {
  if (!redisConfigured) {
    throw new Error('Redis is not configured. Set REDIS_URL to enable Redis.');
  }

  if (!cacheClient) {
    cacheClient = createCacheClient();
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

interface FallbackEntry {
  value: string;
  expiresAt: number | null;
}

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
  const regex = escaped.replace(/\\\*/g, '.*');
  return new RegExp(`^${regex}$`);
}

export class CacheManager {
  private client: Redis | null = null;
  private initialized = false;
  private fallbackStore = new Map<string, FallbackEntry>();

  private async getClient(): Promise<Redis | null> {
    if (this.initialized) {
      return this.client;
    }

    this.initialized = true;

    if (!redisConfigured || cacheUnavailable) {
      logger.info('Redis cache not available. Using in-memory cache fallback.');
      return null;
    }

    try {
      this.client = getCacheClient();
      await this.client.ping();
      return this.client;
    } catch {
      logger.warn('Redis cache unavailable. Falling back to in-memory cache.');
      if (this.client) {
        try {
          await this.client.quit();
        } catch {
          // ignore cleanup errors
        }
      }
      cacheClient = null;
      this.client = null;
      cacheUnavailable = true;
      return null;
    }
  }

  private cleanupFallback(): void {
    const now = Date.now();
    Array.from(this.fallbackStore.entries()).forEach(([key, entry]) => {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        this.fallbackStore.delete(key);
      }
    });
  }

  private getFallback<T>(key: string): T | null {
    this.cleanupFallback();
    const entry = this.fallbackStore.get(key);
    if (!entry) {
      return null;
    }

    return JSON.parse(entry.value) as T;
  }

  private setFallback(key: string, value: unknown, ttl?: number): void {
    const serialized = JSON.stringify(value);
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    this.fallbackStore.set(key, { value: serialized, expiresAt });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      if (!client) {
        return this.getFallback<T>(key);
      }

      const value = await client.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Get error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) {
        this.setFallback(key, value, ttl);
        return;
      }

      const serialized = JSON.stringify(value);
      if (ttl) {
        await client.setex(key, ttl, serialized);
      } else {
        await client.set(key, serialized);
      }
    } catch (error) {
      logger.error('Set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) {
        this.fallbackStore.delete(key);
        return;
      }
      await client.del(key);
    } catch (error) {
      logger.error('Delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) {
        const regex = patternToRegExp(pattern);
        for (const key of Array.from(this.fallbackStore.keys())) {
          if (regex.test(key)) {
            this.fallbackStore.delete(key);
          }
        }
        return;
      }

      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      logger.error('Delete pattern error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) {
        return this.fallbackStore.has(key);
      }
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Exists error:', error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) {
        const entry = this.fallbackStore.get(key);
        if (!entry) {
          return;
        }
        entry.expiresAt = Date.now() + ttl * 1000;
        this.fallbackStore.set(key, entry);
        return;
      }
      await client.expire(key, ttl);
    } catch (error) {
      logger.error('Expire error:', error);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const client = await this.getClient();
      if (!client) {
        const entry = this.fallbackStore.get(key);
        if (!entry || entry.expiresAt === null) {
          return -1;
        }
        return Math.max(Math.ceil((entry.expiresAt - Date.now()) / 1000), -1);
      }
      return await client.ttl(key);
    } catch (error) {
      logger.error('TTL error:', error);
      return -1;
    }
  }

  async flush(): Promise<void> {
    try {
      const client = await this.getClient();
      if (!client) {
        this.fallbackStore.clear();
        return;
      }
      await client.flushdb();
    } catch (error) {
      logger.error('Flush error:', error);
    }
  }
}

export const cacheManager = new CacheManager();
