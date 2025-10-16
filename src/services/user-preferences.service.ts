import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type { UserPreferences, PartialUserPreferences } from '@/types/user-preferences.types';
import {
  defaultUserPreferences,
  preferencesHelpers,
  dbToAppPreferences,
  appToDbPreferences,
  appToDbUpdate,
} from '@/types/user-preferences.types';
import { fontConfig, type FontKey } from '@/lib/fonts';
import { log } from '@/lib/logger';

/**
 * UserPreferencesService handles all user preferences business logic
 *
 * Responsibilities:
 * - User preferences CRUD operations
 * - Preferences validation and sanitization
 * - Font validation
 * - Preferences merging with defaults
 * - Conflict resolution for concurrent updates
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const preferencesService = new UserPreferencesService(supabase);
 *
 * const result = await preferencesService.getPreferences("user-id");
 * if (result.success) {
 *   console.log(result.data.theme);
 * }
 * ```
 */
export class UserPreferencesService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Get user preferences by user ID
   * Returns merged preferences with defaults if no preferences exist
   */
  async getPreferences(userId: string): Promise<ServiceResult<UserPreferences>> {
    try {
      const { data: dbPreferences, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no preferences exist, return defaults
        if (error.code === 'PGRST116') {
          log.info({ userId }, 'No preferences found, returning defaults');
          return { success: true, data: defaultUserPreferences };
        }

        log.warn({ userId, error: error.message }, 'Failed to fetch preferences');
        return { success: false, error: error.message };
      }

      // Convert database format to app format
      const appPreferences = dbToAppPreferences(dbPreferences);

      // Validate and sanitize preferences
      const validation = preferencesHelpers.validatePreferences(appPreferences);
      if (!validation.isValid) {
        log.warn({ userId, errors: validation.errors }, 'Invalid preferences found, sanitizing');
      }

      // Merge with defaults and validate fonts
      const mergedPreferences = preferencesHelpers.mergeWithDefaults(
        validation.sanitizedPreferences,
      );
      const finalPreferences = this.validateAndFixFonts(mergedPreferences);

      return { success: true, data: finalPreferences };
    } catch (error) {
      log.error(error, 'Error fetching user preferences');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update user preferences
   * Performs optimistic updates with conflict resolution
   */
  async updatePreferences(
    userId: string,
    preferences: PartialUserPreferences,
  ): Promise<ServiceResult<UserPreferences>> {
    try {
      log.info({ userId }, 'Updating user preferences');

      // Validate and sanitize input preferences
      const validation = preferencesHelpers.validatePreferences(preferences);
      if (!validation.isValid) {
        log.warn({ userId, errors: validation.errors }, 'Invalid preferences provided');
        return {
          success: false,
          error: `Invalid preferences: ${validation.errors.join(', ')}`,
        };
      }

      // Get current preferences to merge
      const currentResult = await this.getPreferences(userId);
      if (!currentResult.success) {
        return currentResult;
      }

      const mergedPreferences = preferencesHelpers.mergeWithDefaults(
        validation.sanitizedPreferences,
      );
      const finalPreferences = this.validateAndFixFonts(mergedPreferences);

      // Convert to database format
      const dbUpdate = appToDbUpdate(finalPreferences);

      // Update database using upsert (insert or update)
      const { data: dbPreferences, error } = await this.supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            ...dbUpdate,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          },
        )
        .select()
        .single();

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to update preferences');
        return { success: false, error: error.message };
      }

      // Convert back to app format
      const updatedPreferences = dbToAppPreferences(dbPreferences);
      const finalUpdatedPreferences = this.validateAndFixFonts(updatedPreferences);

      log.info({ userId }, 'User preferences updated successfully');
      return { success: true, data: finalUpdatedPreferences };
    } catch (error) {
      log.error(error, 'Error updating user preferences');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reset user preferences to defaults
   */
  async resetPreferences(userId: string): Promise<ServiceResult<UserPreferences>> {
    try {
      log.info({ userId }, 'Resetting user preferences to defaults');

      // Convert defaults to database format
      const dbDefaults = appToDbPreferences(defaultUserPreferences, userId);

      const { data: dbPreferences, error } = await this.supabase
        .from('user_preferences')
        .upsert(
          {
            ...dbDefaults,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          },
        )
        .select()
        .single();

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to reset preferences');
        return { success: false, error: error.message };
      }

      // Convert back to app format
      const resetPreferences = dbToAppPreferences(dbPreferences);
      const finalResetPreferences = this.validateAndFixFonts(resetPreferences);

      log.info({ userId }, 'User preferences reset successfully');
      return { success: true, data: finalResetPreferences };
    } catch (error) {
      log.error(error, 'Error resetting user preferences');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate and fix font preferences
   * Ensures the selected font exists in the font configuration
   */
  private validateAndFixFonts(preferences: UserPreferences): UserPreferences {
    const validFonts = Object.keys(fontConfig) as FontKey[];

    if (!validFonts.includes(preferences.systemFont)) {
      log.warn(
        { invalidFont: preferences.systemFont, validFonts },
        'Invalid font detected, falling back to system font',
      );
      preferences.systemFont = 'system';
    }

    return preferences;
  }

  /**
   * Check if user has custom preferences (not just defaults)
   */
  async hasCustomPreferences(userId: string): Promise<boolean> {
    try {
      const { data: dbPreferences, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !dbPreferences) {
        return false;
      }

      // Convert to app format and check if they differ from defaults
      const appPreferences = dbToAppPreferences(dbPreferences);
      const mergedPreferences = preferencesHelpers.mergeWithDefaults(appPreferences);
      return !preferencesHelpers.areEqual(mergedPreferences, defaultUserPreferences);
    } catch {
      return false;
    }
  }
}
