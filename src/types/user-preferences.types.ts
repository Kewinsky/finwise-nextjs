import type { Tables } from '@/types/database.types';
import type { HeaderTitleType } from '@/types/header.types';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
  DEFAULT_CURRENCY,
  CURRENCY_OPTIONS,
  type LanguageCode,
  type FontValue,
  type FontSizeValue,
} from '@/config/app';

/**
 * User preferences interface - MVP version
 * Contains only essential user-customizable settings
 */
export interface UserPreferences {
  // Language preferences
  language: LanguageCode;

  // Font preferences
  systemFont: FontValue;
  fontSize: FontSizeValue;

  // UI preferences
  headerTitlePreference: HeaderTitleType;

  // Financial preferences
  baseCurrency: string; // ISO 4217 currency code (e.g., 'USD', 'EUR')
}

/**
 * Default user preferences - MVP version
 */
export const defaultUserPreferences: UserPreferences = {
  language: DEFAULT_LANGUAGE,
  systemFont: DEFAULT_FONT,
  fontSize: DEFAULT_FONT_SIZE,
  headerTitlePreference: 'time-based',
  baseCurrency: DEFAULT_CURRENCY,
};

/**
 * Partial user preferences for updates
 */
export type PartialUserPreferences = Partial<UserPreferences>;

/**
 * User preferences update input
 */
export interface UpdateUserPreferencesInput {
  userId: string;
  preferences: PartialUserPreferences;
}

/**
 * User preferences with metadata
 */
export interface UserPreferencesWithMetadata extends UserPreferences {
  userId: string;
  updatedAt: string;
  version: number; // For optimistic updates and conflict resolution
}

/**
 * Preferences validation result
 */
export interface PreferencesValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedPreferences: PartialUserPreferences;
}

/**
 * Re-export settings from centralized config
 */
export {
  LANGUAGE_OPTIONS as SUPPORTED_LANGUAGES,
  FONT_SIZE_OPTIONS as FONT_SIZES,
  FONT_OPTIONS,
  getLanguageOption,
  getFontOption,
  getFontSizeOption,
  getFontSizeScale,
} from '@/config/app';

// Import for internal use
import { LANGUAGE_OPTIONS, FONT_SIZE_OPTIONS, FONT_OPTIONS } from '@/config/app';

/**
 * Helper functions for preferences
 */
export const preferencesHelpers = {
  /**
   * Validate user preferences - MVP version
   */
  validatePreferences(preferences: PartialUserPreferences): PreferencesValidationResult {
    const errors: string[] = [];
    const sanitized: PartialUserPreferences = {};

    // Validate language
    if (preferences.language !== undefined) {
      const validLanguages = LANGUAGE_OPTIONS.map((lang) => lang.code);
      if (validLanguages.includes(preferences.language)) {
        sanitized.language = preferences.language;
      } else {
        errors.push('Invalid language code');
      }
    }

    // Validate font size
    if (preferences.fontSize !== undefined) {
      const validFontSizes = FONT_SIZE_OPTIONS.map((size) => size.value);
      if (validFontSizes.includes(preferences.fontSize)) {
        sanitized.fontSize = preferences.fontSize;
      } else {
        errors.push('Invalid font size');
      }
    }

    // Validate system font
    if (preferences.systemFont !== undefined) {
      const validFonts = FONT_OPTIONS.map((font) => font.value);
      if (validFonts.includes(preferences.systemFont)) {
        sanitized.systemFont = preferences.systemFont;
      } else {
        errors.push('Invalid system font value');
      }
    }

    // Validate header title preference
    if (preferences.headerTitlePreference !== undefined) {
      const validHeaderTypes = [
        'time-based',
        'page-based',
        'financial-status',
        'quick-stats',
        'motivational',
      ];
      if (validHeaderTypes.includes(preferences.headerTitlePreference)) {
        sanitized.headerTitlePreference = preferences.headerTitlePreference;
      } else {
        errors.push('Invalid header title preference');
      }
    }

    // Validate base currency
    if (preferences.baseCurrency !== undefined) {
      const isValidCurrency = CURRENCY_OPTIONS.some(
        (option) => option.value === preferences.baseCurrency,
      );
      if (isValidCurrency) {
        sanitized.baseCurrency = preferences.baseCurrency;
      } else {
        errors.push('Invalid base currency code');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedPreferences: sanitized,
    };
  },

  /**
   * Merge preferences with defaults - MVP version
   */
  mergeWithDefaults(preferences: PartialUserPreferences): UserPreferences {
    return {
      ...defaultUserPreferences,
      ...preferences,
    };
  },

  /**
   * Get font size scale
   */
  getFontSizeScale(fontSize: string): number {
    const size = FONT_SIZE_OPTIONS.find((size) => size.value === fontSize);
    return size?.scale || 1;
  },

  /**
   * Check if preferences are equal
   */
  areEqual(a: UserPreferences, b: UserPreferences): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  },
};
// =============================================================================
// DATABASE CONVERSION HELPERS
// =============================================================================

/**
 * User preferences from database
 */
export type UserPreferencesDB = Tables<'user_preferences'>;

/**
 * User preferences insert input - MVP version
 */
export type UserPreferencesInsert = {
  user_id: string;
  language?: string;
  system_font?: string;
  font_size?: string;
  header_title_preference?: string;
  base_currency?: string;
};

/**
 * User preferences update input - MVP version
 */
export type UserPreferencesUpdate = {
  language?: string;
  system_font?: string;
  font_size?: string;
  header_title_preference?: string;
  base_currency?: string;
};

/**
 * Helper function to convert database preferences to app preferences - MVP version
 */
export function dbToAppPreferences(db: UserPreferencesDB): UserPreferences {
  return {
    language: db.language as LanguageCode,
    systemFont: db.system_font as FontValue,
    fontSize: db.font_size as FontSizeValue,
    headerTitlePreference: (db.header_title_preference as HeaderTitleType) || 'time-based',
    baseCurrency: (db.base_currency as string) || DEFAULT_CURRENCY,
  };
}

/**
 * Helper function to convert app preferences to database format - MVP version
 */
export function appToDbPreferences(app: UserPreferences, userId: string): UserPreferencesInsert {
  return {
    user_id: userId,
    language: app.language,
    system_font: app.systemFont,
    font_size: app.fontSize,
    header_title_preference: app.headerTitlePreference,
    base_currency: app.baseCurrency,
  };
}

/**
 * Helper function to convert app preferences to database update format - MVP version
 */
export function appToDbUpdate(app: PartialUserPreferences): UserPreferencesUpdate {
  const update: UserPreferencesUpdate = {};

  if (app.language !== undefined) update.language = app.language;
  if (app.systemFont !== undefined) update.system_font = app.systemFont;
  if (app.fontSize !== undefined) update.font_size = app.fontSize;
  if (app.headerTitlePreference !== undefined)
    update.header_title_preference = app.headerTitlePreference;
  if (app.baseCurrency !== undefined) update.base_currency = app.baseCurrency;

  return update;
}
