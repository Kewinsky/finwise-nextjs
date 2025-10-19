import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis instance for auth rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Authentication Rate Limiters
 *
 * Different rate limits for different auth operations:
 * - Sign in/up: Lower frequency (security sensitive)
 * - Password reset: Very low frequency (security action)
 * - Magic link: Moderate frequency
 * - OAuth: Moderate frequency
 */

// Sign in/up - security sensitive, lower frequency
export const authSignInRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '15 m'), // 3 requests per 15 minutes
  analytics: true,
});

// Password reset - very low frequency (security action)
export const authPasswordResetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '15 m'), // 1 request per 15 minutes
  analytics: true,
});

// Magic link - moderate frequency
export const authMagicLinkRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
});

// OAuth - moderate frequency
export const authOAuthRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
});

// Default auth rate limiter (for general auth operations)
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
});
