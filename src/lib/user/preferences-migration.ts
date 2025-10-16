'use client';

import { createClientForBrowser } from '@/utils/supabase/client';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { preferencesHelpers, type UserPreferences } from '@/types/user-preferences.types';
import { log } from '@/lib/logger';

const SETTINGS_STORAGE_KEY = 'user-settings';

/**
 * Migrate localStorage preferences to database for authenticated users
 * This should be called after successful authentication
 */
export async function migrateLocalStoragePreferencesToDatabase(
  userId: string,
): Promise<{ migrated: boolean; preferences?: UserPreferences }> {
  try {
    // Check if user has localStorage preferences
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
      return { migrated: false };
    }

    // Parse localStorage preferences
    let localStoragePreferences: Partial<UserPreferences>;
    try {
      localStoragePreferences = JSON.parse(stored);
    } catch (parseError) {
      log.warn({ userId, error: parseError }, 'Failed to parse localStorage preferences');
      return { migrated: false };
    }

    // Check if user already has database preferences
    const supabase = createClientForBrowser();
    const preferencesService = new UserPreferencesService(supabase);

    const hasCustomPreferences = await preferencesService.hasCustomPreferences(userId);
    if (hasCustomPreferences) {
      log.info({ userId }, 'User already has database preferences, skipping migration');
      return { migrated: false };
    }

    // Validate and merge localStorage preferences with defaults
    const validation = preferencesHelpers.validatePreferences(localStoragePreferences);
    if (!validation.isValid) {
      log.warn(
        { userId, errors: validation.errors },
        'Invalid localStorage preferences, skipping migration',
      );
      return { migrated: false };
    }

    const mergedPreferences = preferencesHelpers.mergeWithDefaults(validation.sanitizedPreferences);

    // Save to database
    const result = await preferencesService.updatePreferences(userId, mergedPreferences);
    if (!result.success) {
      log.error({ userId, error: result.error }, 'Failed to migrate preferences to database');
      return { migrated: false };
    }

    // Clear localStorage after successful migration
    localStorage.removeItem(SETTINGS_STORAGE_KEY);

    log.info({ userId }, 'Successfully migrated preferences from localStorage to database');
    return { migrated: true, preferences: result.data };
  } catch (error) {
    log.error(error, 'Error migrating preferences from localStorage to database');
    return { migrated: false };
  }
}
