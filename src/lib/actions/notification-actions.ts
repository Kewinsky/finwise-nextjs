'use server';

import { createClientForServer } from '@/utils/supabase/server';
import { NotificationService } from '@/services';
import type { NotificationPreferences } from '@/types/notification.types';
import { log } from '@/lib/logger';
import { checkNotificationRateLimit } from '@/lib/ratelimit/rate-limit-utils';

/**
 * Get notification preferences for the current user
 */
export async function getNotificationPreferences(): Promise<{
  success: boolean;
  preferences: NotificationPreferences | null;
  error?: string;
}> {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        preferences: null,
        error: 'User not authenticated',
      };
    }

    // Delegate to service (business logic)
    const notificationService = new NotificationService(supabase);
    const result = await notificationService.getPreferences(user.id);

    if (!result.success) {
      return {
        success: false,
        preferences: null,
        error: result.error,
      };
    }

    return { success: true, preferences: result.data };
  } catch (error) {
    log.error(error, 'Error getting notification preferences');
    return {
      success: false,
      preferences: null,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Save notification preferences for the current user
 */
export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkNotificationRateLimit('save');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many save attempts. Please wait 15 minutes before trying again.',
      };
    }

    const supabase = await createClientForServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const notificationService = new NotificationService(supabase);
    const result = await notificationService.savePreferences(user.id, preferences);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    log.error(error, 'Error saving notification preferences');
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Reset notification preferences to defaults for the current user
 */
export async function resetNotificationPreferencesToDefaults(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkNotificationRateLimit('reset');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many reset attempts. Please wait 15 minutes before trying again.',
      };
    }

    const supabase = await createClientForServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const notificationService = new NotificationService(supabase);
    const result = await notificationService.resetToDefaults(user.id);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    log.error(error, 'Error resetting notification preferences');
    return { success: false, error: 'An unexpected error occurred' };
  }
}
