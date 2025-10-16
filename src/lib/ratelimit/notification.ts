import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis instance for notification rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Notification Management Rate Limiters
 *
 * Different rate limits for different notification operations:
 * - Notification retrieval: Higher frequency
 * - Mark as read: Higher frequency
 * - Notification creation: Moderate frequency
 * - Bulk operations: Lower frequency
 */

// Notification retrieval - higher frequency
export const notificationRetrievalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '15 m'), // 30 requests per 15 minutes
  analytics: true,
});

// Mark as read - higher frequency
export const notificationMarkReadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '15 m'), // 50 requests per 15 minutes
  analytics: true,
});

// Notification creation - moderate frequency
export const notificationCreationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 requests per 15 minutes
  analytics: true,
});

// Bulk operations - lower frequency
export const notificationBulkRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
});

// Default notification rate limiter (for general notification operations)
export const notificationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '15 m'), // 20 requests per 15 minutes
  analytics: true,
});
