import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis instance for subscription rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Subscription Management Rate Limiters
 *
 * Different rate limits for different subscription operations:
 * - Subscription retrieval: Higher frequency
 * - Plan changes: Lower frequency (business logic)
 * - Payment operations: Very low frequency (financial)
 * - Billing operations: Moderate frequency
 */

// Subscription retrieval - higher frequency
export const subscriptionRetrievalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '15 m'), // 20 requests per 15 minutes
  analytics: true,
});

// Plan changes - lower frequency (business logic)
export const subscriptionPlanChangeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '15 m'), // 3 requests per 15 minutes
  analytics: true,
});

// Payment operations - very low frequency (financial)
export const subscriptionPaymentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, '15 m'), // 2 requests per 15 minutes
  analytics: true,
});

// Billing operations - moderate frequency
export const subscriptionBillingRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(8, '15 m'), // 8 requests per 15 minutes
  analytics: true,
});

// Default subscription rate limiter (for general subscription operations)
export const subscriptionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 requests per 15 minutes
  analytics: true,
});
