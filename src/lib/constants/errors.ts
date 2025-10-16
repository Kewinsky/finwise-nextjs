/**
 * Centralized error message constants for consistent error handling across the application.
 *
 * These constants ensure that error messages are consistent, user-friendly, and maintainable.
 * All error messages should be defined here and imported where needed.
 */

export const ERROR_MESSAGES = {
  // Generic errors
  UNEXPECTED: 'An unexpected error occurred',
  NETWORK: 'Please check your connection and try again',
  VALIDATION: 'Please check your information and try again',
  AUTH_REQUIRED: 'Please sign in to continue',
  RATE_LIMITED: 'Too many requests. Please wait before trying again',

  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'This email is already associated with an account',
  ACCOUNT_NOT_FOUND: 'No account found with this email address',
  INVALID_RESET_LINK: 'Invalid or expired reset link',
  PASSWORD_TOO_WEAK: 'Password must be at least 8 characters with uppercase, lowercase, and number',

  // Billing errors
  NO_SUBSCRIPTION: 'No active subscription found',
  PAYMENT_FAILED: 'Payment processing failed',
  INVALID_PLAN: 'Invalid subscription plan',
  SUBSCRIPTION_CANCELED: 'Subscription has been canceled',

  // Permission errors
  ACCESS_DENIED: 'You do not have permission to access this resource',
  INSUFFICIENT_PERMISSIONS: 'Your current plan does not include this feature',

  // Data errors
  DATA_NOT_FOUND: 'The requested data could not be found',
  INVALID_DATA: 'The provided data is invalid',
  DUPLICATE_ENTRY: 'This entry already exists',

  // System errors
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
  MAINTENANCE_MODE: 'System is under maintenance',
  CONFIGURATION_ERROR: 'System configuration error',
} as const;

/**
 * Type for error message keys
 */
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/**
 * Helper function to get error message by key
 */
export function getErrorMessage(key: ErrorMessageKey): string {
  return ERROR_MESSAGES[key];
}

/**
 * Helper function to get error message with fallback
 */
export function getErrorMessageSafe(
  key: ErrorMessageKey,
  fallback = ERROR_MESSAGES.UNEXPECTED,
): string {
  return ERROR_MESSAGES[key] || fallback;
}
