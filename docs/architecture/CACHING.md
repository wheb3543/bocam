# Caching System Documentation

This document describes the caching system implemented in BOCAM CRM Platform using Redis.

## Overview

The caching system uses Redis to improve application performance by reducing database load and response times for frequently accessed data.

## Components

### 1. Redis Configuration

**File:** `server/redis.ts`

Provides:
- Redis connection management
- Separate connections for BullMQ and caching
- CacheManager class for cache operations

### 2. Cache Helper

**File:** `server/_core/cacheHelper.ts`

Provides:
- Cache decorators for functions
- Cache key generators
- Cache TTL constants
- Cache invalidation helpers

### 3. Docker Compose

**File:** `docker-compose.yml`

Includes:
- Redis service configuration
- Persistent storage
- Health checks
- Password protection

## Implementation Notes (updated)

- Primary implementation files:
  - `server/services/redis.ts` — manages Redis connections and exposes `getRedisConnection()` and `getCacheClient()`; separates connections for BullMQ and general caching.
  - `server/_core/cacheHelper.ts` — cache decorators, helpers, and `warmCache()` entrypoints.
  - `server/services/cacheInvalidator.ts` — centralized invalidation helpers used across routers (appointments, campRegistrations, offerLeads).
  - `server/integrations/queues/` and `server/_core/routes/*` use the cache utilities where appropriate (e.g., `backupRoutes`, `updateRoutes`, `configRoutes`).

- The codebase exports a singleton `cacheManager` (implemented in `server/services/redis.ts`) used throughout the server to `get`, `set`, `delete`, and `deletePattern` keys. Many tRPC procedures call caching helpers via `server/_core/cacheHelper.ts` and `server/database/db-optimizations.ts`.

## Usage locations (examples)

- `server/_core/routes/backupRoutes.ts` — reads/writes `CacheKeys.BACKUP_STATUS` and uses cached update status when available.
- `server/_core/routes/configRoutes.ts` — caches configuration (`config:all`) and invalidates on updates.
- `server/routers/whatsapp/settings/routes/*` — uses caching for templates and connection metadata.


## Setup

### Prerequisites

- Redis installed locally or accessible via Docker
- Node.js and npm/pnpm installed
- Environment variables configured

### Installation

```bash
# Install Redis client
pnpm add ioredis

# Start Redis with Docker Compose
docker-compose up -d redis
```

### Configuration

Add to `.env`:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
```

## Usage

### Basic Cache Operations

```typescript
import { cacheManager } from "../redis";

// Get value from cache
const cached = await cacheManager.get("key");

// Set value in cache
await cacheManager.set("key", value, 300); // 300 seconds TTL

// Delete value from cache
await cacheManager.delete("key");

// Check if key exists
const exists = await cacheManager.exists("key");
```

### Cache Decorator

```typescript
import { cache, CacheTTL } from "../cacheHelper";

class UserService {
  @cache(CacheTTL.MEDIUM, "user")
  async getUser(id: number) {
    // This will be cached for 5 minutes
    return await database.query("SELECT * FROM users WHERE id = ?", [id]);
  }
}
```

### Cached Query Helper

```typescript
import { cachedQuery, CacheKeys, CacheTTL } from "../redis";

const result = await cachedQuery(
  CacheKeys.USER(userId),
  async () => {
    return await database.query("SELECT * FROM users WHERE id = ?", [userId]);
  },
  CacheTTL.LONG
);
```

### Cache Invalidation

```typescript
import { cacheManager, CacheKeys } from "../redis";

// Invalidate specific key
await cacheManager.delete(CacheKeys.CONFIG);

// Invalidate by pattern
await cacheManager.deletePattern("user:*");

// Invalidate related caches
await invalidateRelatedCache([
  CacheKeys.CONFIG,
  "config:*"
]);
```

## Cache Keys

Predefined cache keys for common data:

```typescript
import { CacheKeys } from "../redis";

// User data
CacheKeys.USER(userId)
CacheKeys.USER_PERMISSIONS(userId)

// Configuration
CacheKeys.CONFIG
CacheKeys.CONFIG_SSL
CacheKeys.CONFIG_BACKUP

// System status
CacheKeys.SYSTEM_STATUS
CacheKeys.SYSTEM_HEALTH

// Update info
CacheKeys.UPDATE_STATUS
CacheKeys.UPDATE_INFO(version)

// Backup info
CacheKeys.BACKUP_STATUS
CacheKeys.BACKUP_HISTORY

// Dashboard data
CacheKeys.DASHBOARD_STATS
CacheKeys.DASHBOARD_CHARTS

// Activity logs
CacheKeys.RECENT_ACTIVITY
CacheKeys.RECENT_UPDATES
CacheKeys.RECENT_BACKUPS

// Notifications
CacheKeys.UNREAD_NOTIFICATIONS(userId)

// License data
CacheKeys.LICENSE_INFO
CacheKeys.LICENSE_STATUS
```

## Cache TTL Values

Predefined TTL values (in seconds):

```typescript
import { CacheTTL } from "../redis";

CacheTTL.SHORT      // 60 seconds (1 minute)
CacheTTL.MEDIUM    // 300 seconds (5 minutes)
CacheTTL.LONG      // 1800 seconds (30 minutes)
CacheTTL.VERY_LONG // 3600 seconds (1 hour)
CacheTTL.DAILY     // 86400 seconds (24 hours)
```

## Applied Caching

Currently cached endpoints:

### GET /api/config
- **TTL:** 30 minutes
- **Key:** `config:all`
- **Invalidation:** On POST /api/config

### GET /api/update/status
- **TTL:** 1 minute
- **Key:** `update:status`
- **Invalidation:** On update operations

## Best Practices

### 1. Choose Appropriate TTL

- **Short (1-5 min):** Frequently changing data (system status, update status)
- **Medium (5-30 min):** User data, permissions
- **Long (30-60 min):** Configuration, static data
- **Daily (24 hours):** Analytics, reports

### 2. Cache Invalidation

Always invalidate cache when data changes:

```typescript
async function updateUser(userId: number, data: any) {
  // Update database
  await database.update("users", data, { id: userId });
  
  // Invalidate cache
  await cacheManager.delete(CacheKeys.USER(userId));
  await cacheManager.deletePattern(`user:${userId}:*`);
}
```

### 3. Cache Warming

Pre-populate cache with frequently accessed data:

```typescript
import { warmCache } from "../cacheHelper";

// Warm cache on server startup
await warmCache();
```

### 4. Error Handling

Cache failures should not break the application:

```typescript
try {
  const cached = await cacheManager.get(key);
  if (cached) return cached;
} catch (error) {
  console.error("Cache error:", error);
  // Fall back to database
}

const data = await database.query(...);
```

### 5. Monitor Cache Performance

Track cache hit/miss ratios:

```typescript
// CacheManager already logs hits and misses
// Monitor logs to analyze cache effectiveness
```

## Monitoring

### Redis CLI

```bash
# Connect to Redis
redis-cli

# Check memory usage
INFO memory

# Check keyspace
INFO keyspace

# Monitor commands
MONITOR

# Check slow log
SLOWLOG GET 10
```

### Grafana Dashboard

Use the monitoring stack (Prometheus + Grafana) to monitor:

- Redis memory usage
- Cache hit/miss ratio
- Connection count
- Command rate

## Troubleshooting

### Redis Connection Failed

**Problem:** Cannot connect to Redis

**Solution:**
```bash
# Check if Redis is running
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

### Cache Not Working

**Problem:** Data not being cached

**Solution:**
1. Check Redis connection: `redis-cli ping`
2. Verify environment variables: `echo $REDIS_URL`
3. Check server logs for cache errors
4. Verify cache keys are correct

### High Memory Usage

**Problem:** Redis using too much memory

**Solution:**
1. Reduce TTL values
2. Implement cache eviction policies
3. Monitor and clean unused keys
4. Use Redis maxmemory setting

### Stale Data

**Problem:** Cache returning old data

**Solution:**
1. Reduce TTL
2. Implement proper cache invalidation
3. Use cache versioning
4. Implement cache warming

## Performance Tips

1. **Batch Operations:** Use MGET/MSET for multiple keys
2. **Pipeline Commands:** Use Redis pipelines for multiple commands
3. **Use Appropriate Data Types:** Choose the right Redis data type
4. **Avoid Large Values:** Keep cached values small
5. **Use Compression:** Compress large cached values

## Security

1. **Enable Authentication:** Always use Redis password
2. **Use TLS:** Enable TLS for production
3. **Network Isolation:** Run Redis in private network
4. **Access Control:** Limit Redis access to application servers
5. **Regular Updates:** Keep Redis updated

## Maintenance

### Backup Redis Data

```bash
# Save Redis data
redis-cli SAVE

# Or use BGSAVE for background save
redis-cli BGSAVE
```

### Clear Cache

```bash
# Clear all cache (use with caution)
redis-cli FLUSHDB

# Clear specific pattern
redis-cli --scan --pattern "user:*" | xargs redis-cli DEL
```

### Monitor Redis

```bash
# Check Redis info
redis-cli INFO

# Check slow queries
redis-cli SLOWLOG GET

# Monitor in real-time
redis-cli MONITOR
```

## Future Enhancements

1. **Distributed Caching:** Add Redis Cluster for scalability
2. **Cache Partitioning:** Partition cache by user/tenant
3. **Cache Compression:** Compress large cached values
4. **Cache Analytics:** Add detailed cache analytics
5. **Auto-scaling:** Auto-scale Redis based on load
