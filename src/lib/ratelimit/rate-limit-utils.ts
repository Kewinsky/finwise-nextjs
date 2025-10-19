/**
 * Consolidated rate limiting utilities for server actions
 *
 * This replaces the duplicate rate limiting functions across different action files
 * with a single, reusable utility that handles all rate limiting scenarios.
 */

import { headers } from 'next/headers';
import { log } from '@/lib/logger';
import { LOG_MESSAGES } from '@/lib/constants/logs';
import {
  authRateLimit,
  subscriptionRateLimit,
  notificationRateLimit,
  getClientIdentifier,
} from './index';

export type RateLimitType = 'auth' | 'billing' | 'notification';

export type AuthActionType = 'signin' | 'reset' | 'magic' | 'oauth';
export type BillingActionType = 'checkout' | 'portal' | 'trial' | 'upgrade';
export type NotificationActionType = 'save' | 'reset';

export type ActionType = AuthActionType | BillingActionType | NotificationActionType;

export interface RateLimitResult {
  success: boolean;
  isRateLimited?: boolean;
  error?: string;
}

/**
 * Consolidated rate limiting function that handles all action types
 *
 * @param type - The type of rate limiting (auth, billing, notification)
 * @param actionType - The specific action being rate limited
 * @returns RateLimitResult indicating success/failure and rate limit status
 */
export async function checkRateLimit(
  type: RateLimitType,
  actionType: ActionType,
): Promise<RateLimitResult> {
  try {
    // Get headers from server action context
    const headersList = await headers();

    // Use shared client identifier function
    const baseId = getClientIdentifier(headersList);
    const clientId = `${type}-${actionType}:${baseId}`;

    // Select the appropriate rate limiter based on type
    let rateLimiter;
    switch (type) {
      case 'auth':
        rateLimiter = authRateLimit;
        break;
      case 'billing':
        rateLimiter = subscriptionRateLimit;
        break;
      case 'notification':
        rateLimiter = notificationRateLimit;
        break;
      default:
        throw new Error(`Unknown rate limit type: ${type}`);
    }

    const { success } = await rateLimiter.limit(clientId);

    if (!success) {
      log.warn({ clientId, type, actionType }, LOG_MESSAGES.RATE_LIMITED(`${type} ${actionType}`));
      return {
        success: false,
        isRateLimited: true,
        error: `Too many ${actionType} attempts. Please wait 15 minutes before trying again.`,
      };
    }

    return { success: true };
  } catch (error) {
    log.error(
      { error, type, actionType },
      LOG_MESSAGES.RATE_LIMITING_FAILED(`${type} ${actionType}`),
    );
    // If rate limiting fails, allow the action to proceed
    return { success: true };
  }
}

/**
 * Convenience function for auth rate limiting
 */
export async function checkAuthRateLimit(actionType: AuthActionType): Promise<RateLimitResult> {
  return checkRateLimit('auth', actionType);
}

/**
 * Convenience function for billing rate limiting
 */
export async function checkBillingRateLimit(
  actionType: BillingActionType,
): Promise<RateLimitResult> {
  return checkRateLimit('billing', actionType);
}

/**
 * Convenience function for notification rate limiting
 */
export async function checkNotificationRateLimit(
  actionType: NotificationActionType,
): Promise<RateLimitResult> {
  return checkRateLimit('notification', actionType);
}
