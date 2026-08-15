/**
 * Health Check & Metrics
 * فحوصات الصحة والمقاييس
 */

import { getDb } from '../database/db';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    redis?: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    memory: {
      status: 'up' | 'down';
      usage: number;
      total: number;
      percentage: number;
    };
    uptime: {
      status: 'up' | 'down';
      seconds: number;
    };
  };
}

interface Metrics {
  timestamp: string;
  uptime: number;
  memory: {
    usage: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  requests: {
    total: number;
    success: number;
    error: number;
  };
  database: {
    connections: number;
    queries: number;
  };
}

/**
 * فحص صحة قاعدة البيانات
 */
async function checkDatabaseHealth(): Promise<{
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const db = await getDb();
    if (!db) {
      return { status: 'down', error: 'Database connection failed' };
    }

    // Simple query to check connection
    await db.execute('SELECT 1');
    const latency = Date.now() - startTime;

    return { status: 'up', latency };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * فحص صحة Redis
 */
async function checkRedisHealth(): Promise<{
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const { cacheManager } = await import('../services/redis');
    await cacheManager.set('health-check', 'ok', 10);
    await cacheManager.get('health-check');
    const latency = Date.now() - startTime;

    return { status: 'up', latency };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * الحصول على معلومات الذاكرة
 */
function getMemoryInfo(): { usage: number; total: number; percentage: number } {
  const usage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
  const total = process.memoryUsage().heapTotal / 1024 / 1024; // MB
  const percentage = (usage / total) * 100;

  return { usage, total, percentage };
}

/**
 * الحصول على وقت التشغيل
 */
function getUptime(): number {
  return process.uptime();
}

/**
 * فحص صحة النظام بالكامل
 */
export async function healthCheck(): Promise<HealthCheckResult> {
  const [databaseHealth, memoryInfo, uptime] = await Promise.all([
    checkDatabaseHealth(),
    Promise.resolve(getMemoryInfo()),
    Promise.resolve(getUptime()),
  ]);

  // Check Redis if available
  let redisHealth;
  try {
    redisHealth = await checkRedisHealth();
  } catch {
    // Redis is optional
  }

  const checks: HealthCheckResult['checks'] = {
    database: databaseHealth,
    memory: {
      status: memoryInfo.percentage < 90 ? 'up' : 'down',
      usage: memoryInfo.usage,
      total: memoryInfo.total,
      percentage: memoryInfo.percentage,
    },
    uptime: {
      status: 'up',
      seconds: uptime,
    },
  };

  if (redisHealth) {
    checks.redis = redisHealth;
  }

  // Determine overall status
  const allChecks = Object.values(checks);
  const downChecks = allChecks.filter((check) => check.status === 'down').length;
  const totalChecks = allChecks.length;

  let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
  if (downChecks === 0) {
    overallStatus = 'healthy';
  } else if (downChecks === totalChecks) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
  };
}

/**
 * الحصول على المقاييس الحالية
 */
export function getMetrics(): Metrics {
  const memoryInfo = getMemoryInfo();
  const uptime = getUptime();

  return {
    timestamp: new Date().toISOString(),
    uptime,
    memory: memoryInfo,
    cpu: {
      usage: 0, // CPU usage requires additional libraries
    },
    requests: {
      total: 0,
      success: 0,
      error: 0,
    },
    database: {
      connections: 0,
      queries: 0,
    },
  };
}

/**
 * إعداد health check endpoint في Express
 */
export function setupHealthCheckRoutes(app: import('express').Express): void {
  app.get('/health', async (_req, res) => {
    const health = await healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);
  });

  app.get('/health/ready', async (_req, res) => {
    const health = await healthCheck();
    const isReady = health.status !== 'unhealthy';
    res.status(isReady ? 200 : 503).json({ ready: isReady });
  });

  app.get('/health/live', (_req, res) => {
    res.status(200).json({ alive: true });
  });

  app.get('/metrics', (_req, res) => {
    const metrics = getMetrics();
    res.status(200).json(metrics);
  });
}
