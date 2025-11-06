import { Redis } from '@upstash/redis';

// Create Redis instance for caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cache service using Upstash Redis
 * Currently only used for rate limiting, but can be extended for data caching
 */
export class RedisCache {
  /**
   * Get cached value
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get<T>(key);
      return value;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached value with optional TTL (time to live) in seconds
   */
  static async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached value
   */
  static async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis cache delete error:', error);
      return false;
    }
  }
}

/**
 * Cache key generators for consistent key naming
 */
export const CacheKeys = {
  dashboard: (userId: string) => `dashboard:${userId}`,
  transactions: (userId: string, filters?: string) =>
    `transactions:${userId}${filters ? `:${filters}` : ''}`,
  accounts: (userId: string) => `accounts:${userId}`,
  categorySpending: (userId: string, year: number, month: number) =>
    `category:${userId}:${year}:${month}`,
  areaChart: (userId: string, timeRange: string, series: string) =>
    `areachart:${userId}:${timeRange}:${series}`,
  balanceHistory: (userId: string, year: number, accountIds: string) =>
    `balance:${userId}:${year}:${accountIds}`,
} as const;

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
} as const;
