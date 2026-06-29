// Database query optimizations
import { getDb } from './db';
import { eq, and, or, desc, asc, sql } from 'drizzle-orm';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
  cache?: boolean;
  cacheTime?: number; // in seconds
}

// Simple in-memory cache for database queries
const queryCache = new Map<string, { data: any; timestamp: number }>();

export function clearQueryCache() {
  queryCache.clear();
}

export function getCachedQuery<T>(key: string): T | null {
  const cached = queryCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  const age = (now - cached.timestamp) / 1000; // convert to seconds
  
  // Cache expires after 5 minutes by default
  if (age > 300) {
    queryCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCachedQuery<T>(key: string, data: T): void {
  queryCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Optimized query builder with caching
export async function optimizedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): Promise<T> {
  const { cache = true } = options;
  
  // Check cache first
  if (cache) {
    const cached = getCachedQuery<T>(queryKey);
    if (cached) return cached;
  }
  
  // Execute query
  const result = await queryFn();
  
  // Cache result
  if (cache) {
    setCachedQuery(queryKey, result);
  }
  
  return result;
}

// Batch query helper
export async function batchQuery<T>(
  queries: Array<() => Promise<T>>
): Promise<T[]> {
  return Promise.all(queries.map(query => query()));
}

// Optimized pagination
export function getPaginationParams(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  return { limit, offset };
}

// Query result size limiter
export function limitResultSize<T>(data: T[], maxSize: number = 1000): T[] {
  if (data.length <= maxSize) return data;
  return data.slice(0, maxSize);
}

// Debounced query executor
export function createDebouncedQuery<T>(
  queryFn: () => Promise<T>,
  delay: number = 300
): () => Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastPromise: Promise<T> | null = null;
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          lastPromise = queryFn();
          const result = await lastPromise;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

// Database connection pool configuration
export const dbPoolConfig = {
  // Connection pool size
  min: 2,
  max: 10,
  
  // Connection timeout
  acquireTimeoutMillis: 30000,
  
  // Idle connection timeout
  idleTimeoutMillis: 30000,
  
  // Connection retry settings
  retries: 3,
  retryDelay: 1000,
  
  // Query timeout
  queryTimeout: 10000,
};

// Monitor database performance
export class DatabasePerformanceMonitor {
  private queryTimes: Map<string, number[]> = new Map();
  
  recordQuery(queryName: string, duration: number) {
    if (!this.queryTimes.has(queryName)) {
      this.queryTimes.set(queryName, []);
    }
    
    const times = this.queryTimes.get(queryName)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }
  
  getAverageTime(queryName: string): number {
    const times = this.queryTimes.get(queryName);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }
  
  getSlowQueries(threshold: number = 1000): string[] {
    const slowQueries: string[] = [];
    
    const entries = Array.from(this.queryTimes.entries());
    for (const [queryName, times] of entries) {
      const avgTime = this.getAverageTime(queryName);
      if (avgTime > threshold) {
        slowQueries.push(queryName);
      }
    }
    
    return slowQueries;
  }
}

export const dbPerformanceMonitor = new DatabasePerformanceMonitor();