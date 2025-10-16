/**
 * Rate Limiting Configuration
 *
 * This module exports all rate limiters for different services.
 * Each service has its own rate limiting configuration to prevent abuse
 * while allowing legitimate usage patterns.
 */

// Auth rate limiters
export {
  authRateLimit,
  authSignInRateLimit,
  authSignUpRateLimit,
  authPasswordResetRateLimit,
  authMagicLinkRateLimit,
  authOAuthRateLimit,
} from './auth';

// User rate limiters
export {
  userRateLimit,
  userProfileUpdateRateLimit,
  userAccountDeletionRateLimit,
  userDataRetrievalRateLimit,
} from './user';

// Subscription rate limiters
export {
  subscriptionRateLimit,
  subscriptionRetrievalRateLimit,
  subscriptionPlanChangeRateLimit,
  subscriptionPaymentRateLimit,
  subscriptionBillingRateLimit,
} from './subscription';

// Notification rate limiters
export {
  notificationRateLimit,
  notificationRetrievalRateLimit,
  notificationMarkReadRateLimit,
  notificationCreationRateLimit,
  notificationBulkRateLimit,
} from './notification';

// Re-export utility helpers
export { getClientIdentifier } from './utils';
