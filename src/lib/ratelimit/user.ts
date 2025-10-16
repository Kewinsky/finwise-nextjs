import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis instance for user rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * User Management Rate Limiters
 *
 * Different rate limits for different user operations:
 * - Profile updates: Moderate frequency
 * - Account deletion: Very low frequency (destructive action)
 * - User data retrieval: Higher frequency
 */

// Profile updates - moderate frequency
export const userProfileUpdateRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 requests per 15 minutes
  analytics: true,
});

// Account deletion - very low frequency (destructive action)
export const userAccountDeletionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '60 m'), // 1 request per hour
  analytics: true,
});

// User data retrieval - higher frequency
export const userDataRetrievalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '15 m'), // 20 requests per 15 minutes
  analytics: true,
});

// Default user rate limiter (for general user operations)
export const userRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, '15 m'), // 15 requests per 15 minutes
  analytics: true,
});
