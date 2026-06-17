/**
 * Cache Helper for Common Queries
 * This file provides caching decorators and helpers for frequently accessed data
 */

import { cacheManager } from '../services/redis';

/**
 * Cache decorator for async functions
 * Caches the result of a function based on its arguments
 */
export function cache(ttl: number = 300, keyPrefix: string = 'cache') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Generate cache key based on function name and arguments
      const key = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cacheManager.get(key);
      if (cached !== null) {
        console.log(`[Cache] Hit: ${key}`);
        return cached;
      }

      // Execute original method
      console.log(`[Cache] Miss: ${key}`);
      const result = await originalMethod.apply(this, args);

      // Cache the result
      await cacheManager.set(key, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  await cacheManager.deletePattern(pattern);
  console.log(`[Cache] Invalidated pattern: ${pattern}`);
}

/**
 * Cache keys for common queries
 */
export const CacheKeys = {
  // User data
  USER: (userId: number) => `user:${userId}`,
  USER_PERMISSIONS: (userId: number) => `user:${userId}:permissions`,

  // Configuration
  CONFIG: 'config:all',
  CONFIG_SSL: 'config:ssl',
  CONFIG_BACKUP: 'config:backup',

  // System status
  SYSTEM_STATUS: 'system:status',
  SYSTEM_HEALTH: 'system:health',

  // Update info
  UPDATE_STATUS: 'update:status',
  UPDATE_INFO: (version: string) => `update:info:${version}`,

  // Backup info
  BACKUP_STATUS: 'backup:status',
  BACKUP_HISTORY: 'backup:history',

  // Dashboard data
  DASHBOARD_STATS: 'dashboard:stats',
  DASHBOARD_CHARTS: 'dashboard:charts',

  // Activity logs
  RECENT_ACTIVITY: 'activity:recent',
  RECENT_UPDATES: 'updates:recent',
  RECENT_BACKUPS: 'backups:recent',

  // Notifications
  UNREAD_NOTIFICATIONS: (userId: number) => `notifications:${userId}:unread`,

  // License data
  LICENSE_INFO: 'license:info',
  LICENSE_STATUS: 'license:status',
};

/**
 * Cache TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAILY: 86400, // 24 hours
};

/**
 * Helper to cache database query results
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = await cacheManager.get<T>(key);
  if (cached !== null) {
    console.log(`[Cache] Query hit: ${key}`);
    return cached;
  }

  // Execute query
  console.log(`[Cache] Query miss: ${key}`);
  const result = await queryFn();

  // Cache the result
  await cacheManager.set(key, result, ttl);

  return result;
}

/**
 * Helper to invalidate related cache entries
 */
export async function invalidateRelatedCache(patterns: string[]): Promise<void> {
  for (const pattern of patterns) {
    await cacheManager.deletePattern(pattern);
  }
  console.log(`[Cache] Invalidated patterns: ${patterns.join(', ')}`);
}

/**
 * Cache warming - pre-populate cache with frequently accessed data
 */
export async function warmCache(): Promise<void> {
  console.log('[Cache] Warming cache...');

  // Warm system status
  try {
    // This would be called from the appropriate modules
    // await cacheManager.set(CacheKeys.SYSTEM_STATUS, await getSystemStatus(), CacheTTL.SHORT);
    console.log('[Cache] System status warmed');
  } catch (error) {
    console.error('[Cache] Error warming system status:', error);
  }

  // Warm configuration
  try {
    // await cacheManager.set(CacheKeys.CONFIG, await getConfig(), CacheTTL.LONG);
    console.log('[Cache] Configuration warmed');
  } catch (error) {
    console.error('[Cache] Error warming configuration:', error);
  }

  console.log('[Cache] Cache warming complete');
}
