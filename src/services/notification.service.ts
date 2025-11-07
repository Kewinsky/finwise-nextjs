import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type {
  NotificationPreferences,
  NotificationPreferencesData,
  NotificationPreferencesRow,
} from '@/types/notification.types';
import { defaultNotificationPreferences } from '@/types/notification.types';
import { log } from '@/lib/logger';

/**
 * NotificationService handles notification preferences business logic
 *
 * Responsibilities:
 * - Get user notification preferences
 * - Save/update notification preferences
 * - Reset preferences to defaults
 * - Transform between UI and database formats
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const notificationService = new NotificationService(supabase);
 *
 * const result = await notificationService.getPreferences(userId);
 * if (result.success) {
 *   console.log(result.data.email.marketing);
 * }
 * ```
 */
export class NotificationService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Get notification preferences for a user
   * Returns defaults if no preferences exist
   */
  async getPreferences(userId: string): Promise<ServiceResult<NotificationPreferences>> {
    try {
      log.info({ userId }, 'Fetching notification preferences');

      const { data: preferences, error } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // PGRST116 = no rows returned (user has no preferences)
      if (error && error.code === 'PGRST116') {
        log.info({ userId }, 'No preferences found, returning defaults');
        return { success: true, data: defaultNotificationPreferences };
      }

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch notification preferences');
        return { success: false, error: error.message };
      }

      // Transform from database format to UI format
      const transformed = this.transformFromDatabase(preferences);

      log.info({ userId }, 'Notification preferences retrieved');
      return { success: true, data: transformed };
    } catch (error) {
      log.error(error, 'Error fetching notification preferences');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Save or update notification preferences for a user
   */
  async savePreferences(
    userId: string,
    preferences: NotificationPreferences,
  ): Promise<ServiceResult<NotificationPreferences>> {
    try {
      log.info({ userId }, 'Saving notification preferences');

      // Transform to database format
      const dbFormat = this.transformToDatabase(preferences);

      // Check if preferences already exist
      const { data: existing } = await this.supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      let result;

      if (existing) {
        // Update existing preferences
        const { data, error } = await this.supabase
          .from('notification_preferences')
          .update(dbFormat)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          log.error({ userId, error: error.message }, 'Failed to update notification preferences');
          return { success: false, error: error.message };
        }

        result = data;
      } else {
        // Insert new preferences
        const { data, error } = await this.supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            ...dbFormat,
          })
          .select()
          .single();

        if (error) {
          log.error({ userId, error: error.message }, 'Failed to insert notification preferences');
          return { success: false, error: error.message };
        }

        result = data;
      }

      log.info({ userId }, 'Notification preferences saved successfully');

      // Transform back to UI format
      const transformed = this.transformFromDatabase(result);
      return { success: true, data: transformed };
    } catch (error) {
      log.error(error, 'Error saving notification preferences');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reset notification preferences to defaults for a user
   */
  async resetToDefaults(userId: string): Promise<ServiceResult<NotificationPreferences>> {
    try {
      log.info({ userId }, 'Resetting notification preferences to defaults');

      const dbFormat = this.transformToDatabase(defaultNotificationPreferences);

      // Check if preferences already exist
      const { data: existing } = await this.supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      let result;

      if (existing) {
        // Update to defaults
        const { data, error } = await this.supabase
          .from('notification_preferences')
          .update(dbFormat)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          log.error({ userId, error: error.message }, 'Failed to reset notification preferences');
          return { success: false, error: error.message };
        }

        result = data;
      } else {
        // Insert defaults
        const { data, error } = await this.supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            ...dbFormat,
          })
          .select()
          .single();

        if (error) {
          log.error(
            { userId, error: error.message },
            'Failed to insert default notification preferences',
          );
          return { success: false, error: error.message };
        }

        result = data;
      }

      log.info({ userId }, 'Notification preferences reset to defaults');

      // Transform back to UI format
      const transformed = this.transformFromDatabase(result);
      return { success: true, data: transformed };
    } catch (error) {
      log.error(error, 'Error resetting notification preferences');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete notification preferences for a user
   */
  async deletePreferences(userId: string): Promise<ServiceResult<void>> {
    try {
      log.info({ userId }, 'Deleting notification preferences');

      const { error } = await this.supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to delete notification preferences');
        return { success: false, error: error.message };
      }

      log.info({ userId }, 'Notification preferences deleted successfully');
      return { success: true };
    } catch (error) {
      log.error(error, 'Error deleting notification preferences');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user has custom preferences (not using defaults)
   */
  async hasCustomPreferences(userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Transform database row to UI-friendly format
   */
  private transformFromDatabase(dbRow: NotificationPreferencesRow): NotificationPreferences {
    return {
      email: {
        marketing: dbRow.email_marketing,
        security: dbRow.email_security,
        updates: dbRow.email_updates,
        weeklyDigest: dbRow.email_weekly_digest,
        billing: dbRow.email_billing,
        social: dbRow.email_social,
      },
      push: {
        security: dbRow.push_security,
        updates: dbRow.push_updates,
        mentions: dbRow.push_mentions,
        comments: dbRow.push_comments,
        likes: dbRow.push_likes,
      },
    };
  }

  /**
   * Transform UI format to database format
   */
  private transformToDatabase(preferences: NotificationPreferences): NotificationPreferencesData {
    return {
      email_marketing: preferences.email.marketing,
      email_security: preferences.email.security,
      email_updates: preferences.email.updates,
      email_weekly_digest: preferences.email.weeklyDigest,
      email_billing: preferences.email.billing,
      email_social: preferences.email.social,
      push_security: preferences.push.security,
      push_updates: preferences.push.updates,
      push_mentions: preferences.push.mentions,
      push_comments: preferences.push.comments,
      push_likes: preferences.push.likes,
    };
  }
}
