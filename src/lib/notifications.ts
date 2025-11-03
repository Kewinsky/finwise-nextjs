import { toast } from 'sonner';

/**
 * Centralized notification helper utility for consistent toast messages across the app.
 *
 * This utility provides standardized functions for different notification types
 * with consistent styling, duration, and accessibility features.
 */

export interface NotificationOptions {
  /** Optional description text shown below the title */
  description?: string;
  /** Custom duration in milliseconds (default: 4000ms) */
  duration?: number;
  /** Whether the toast can be dismissed by the user (default: true) */
  dismissible?: boolean;
  /** Custom action button text */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Default notification configuration
 */
const DEFAULT_CONFIG = {
  duration: 5000,
  dismissible: true,
} as const;

/**
 * Shows a success notification with a green checkmark icon
 *
 * @param message - The main notification message
 * @param options - Optional configuration for the notification
 *
 * @example
 * ```ts
 * notifySuccess("Profile updated successfully");
 * notifySuccess("Payment processed", {
 *   description: "Your subscription is now active"
 * });
 * ```
 */
export function notifySuccess(message: string, options?: NotificationOptions) {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration ?? DEFAULT_CONFIG.duration,
    dismissible: options?.dismissible ?? DEFAULT_CONFIG.dismissible,
    action: options?.action,
  });
}

/**
 * Shows an error notification with a red X icon
 *
 * @param message - The main notification message
 * @param options - Optional configuration for the notification
 *
 * @example
 * ```ts
 * notifyError("Failed to save changes");
 * notifyError("Payment failed", {
 *   description: "Please check your payment method and try again"
 * });
 * ```
 */
export function notifyError(message: string, options?: NotificationOptions) {
  return toast.error(message, {
    description: options?.description,
    duration: options?.duration ?? DEFAULT_CONFIG.duration,
    dismissible: options?.dismissible ?? DEFAULT_CONFIG.dismissible,
    action: options?.action,
  });
}

/**
 * Shows an info notification with a blue info icon
 *
 * @param message - The main notification message
 * @param options - Optional configuration for the notification
 *
 * @example
 * ```ts
 * notifyInfo("New features available");
 * notifyInfo("System maintenance", {
 *   description: "Scheduled for tonight at 2 AM EST"
 * });
 * ```
 */
export function notifyInfo(message: string, options?: NotificationOptions) {
  return toast.info(message, {
    description: options?.description,
    duration: options?.duration ?? DEFAULT_CONFIG.duration,
    dismissible: options?.dismissible ?? DEFAULT_CONFIG.dismissible,
    action: options?.action,
  });
}

/**
 * Shows a warning notification with an orange warning icon
 *
 * @param message - The main notification message
 * @param options - Optional configuration for the notification
 *
 * @example
 * ```ts
 * notifyWarning("Storage space running low");
 * notifyWarning("Subscription expires soon", {
 *   description: "Your plan expires in 3 days"
 * });
 * ```
 */
export function notifyWarning(message: string, options?: NotificationOptions) {
  return toast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? DEFAULT_CONFIG.duration,
    dismissible: options?.dismissible ?? DEFAULT_CONFIG.dismissible,
    action: options?.action,
  });
}
