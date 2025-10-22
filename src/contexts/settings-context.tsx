'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { type FontKey, applyFont } from '@/lib/fonts';
import { log } from '@/lib/logger';
import { useUser } from '@/hooks/use-user';
import { createClientForBrowser } from '@/utils/supabase/client';
import { UserPreferencesService } from '@/services/user-preferences.service';
import type { UserPreferences, PartialUserPreferences } from '@/types/user-preferences.types';
import { defaultUserPreferences, preferencesHelpers } from '@/types/user-preferences.types';
import type { LanguageCode } from '@/config/app';
import type { HeaderTitleType } from '@/types/header.types';
import { migrateLocalStoragePreferencesToDatabase } from '@/lib/user/preferences-migration';

interface SettingsContextType {
  // Current preferences
  preferences: UserPreferences;
  systemFont: FontKey;
  language: string;
  fontSize: string;
  darkMode: boolean;
  headerTitlePreference: HeaderTitleType;

  // Preference setters (direct updates)
  setSystemFont: (font: FontKey) => void;
  setLanguage: (language: string) => void;
  setFontSize: (fontSize: string) => void;
  setDarkMode: (enabled: boolean) => void;
  setHeaderTitlePreference: (preference: HeaderTitleType) => void;
  setPreferences: (preferences: PartialUserPreferences) => void;

  // State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  savePreferences: () => Promise<void>;
  resetPreferences: () => Promise<void>;
  refreshPreferences: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

const SETTINGS_STORAGE_KEY = 'user-settings';

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { setTheme } = useTheme();
  const { user, loading: userLoading } = useUser();

  // State
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Services
  const [preferencesService] = useState(() => {
    const supabase = createClientForBrowser();
    return new UserPreferencesService(supabase);
  });

  const isLoading = !isInitialized || userLoading;

  // Apply preferences to the UI
  const applyPreferences = useCallback((prefs: UserPreferences) => {
    // Apply font
    applyFont(prefs.systemFont);

    // Apply font size
    document.documentElement.style.setProperty(
      '--font-size-scale',
      preferencesHelpers.getFontSizeScale(prefs.fontSize).toString(),
    );
  }, []);

  // Load preferences from database or localStorage
  const loadPreferences = useCallback(async () => {
    try {
      setError(null);

      if (user) {
        // User is authenticated - load from database

        // First, try to migrate localStorage preferences if they exist
        const migrationResult = await migrateLocalStoragePreferencesToDatabase(user.id);
        if (migrationResult.migrated) {
          log.info({ userId: user.id }, 'Migrated localStorage preferences to database');
        }

        const result = await preferencesService.getPreferences(user.id);

        if (result.success) {
          setPreferences(result.data);
          applyPreferences(result.data);
        } else {
          log.warn(
            { error: result.error },
            'Failed to load preferences from database, using defaults',
          );
          setPreferences(defaultUserPreferences);
          applyPreferences(defaultUserPreferences);
        }
      } else {
        // User is not authenticated - load from localStorage
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);

        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const mergedPreferences = preferencesHelpers.mergeWithDefaults(parsed);
            setPreferences(mergedPreferences);
            applyPreferences(mergedPreferences);
          } catch (parseError) {
            log.warn(
              { error: parseError },
              'Failed to parse localStorage preferences, using defaults',
            );
            setPreferences(defaultUserPreferences);
            applyPreferences(defaultUserPreferences);
          }
        } else {
          setPreferences(defaultUserPreferences);
          applyPreferences(defaultUserPreferences);
        }
      }
    } catch (err) {
      log.error(err, 'Error loading preferences');
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPreferences(defaultUserPreferences);
      applyPreferences(defaultUserPreferences);
    } finally {
      setIsInitialized(true);
    }
  }, [user, preferencesService, applyPreferences]);

  // Save preferences to database or localStorage
  const savePreferences = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (user) {
        // User is authenticated - save to database
        log.info({ userId: user.id }, 'Saving preferences to database');
        const result = await preferencesService.updatePreferences(user.id, preferences);

        if (!result.success) {
          log.error({ error: result.error }, 'Failed to save preferences to database');
          setError(result.error);
          return;
        }

        // Update saved preferences
        setPreferences(result.data);
      } else {
        // User is not authenticated - save to localStorage
        log.info('Saving preferences to localStorage');
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
      }
    } catch (err) {
      log.error(err, 'Error saving preferences');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }, [user, preferencesService, preferences]);

  // Load preferences when user changes
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Individual preference setters (direct updates)
  const setSystemFont = useCallback((font: FontKey) => {
    setPreferences((prev) => ({ ...prev, systemFont: font }));
  }, []);

  const setLanguage = useCallback((language: string) => {
    setPreferences((prev) => ({ ...prev, language: language as LanguageCode }));
  }, []);

  const setFontSize = useCallback((fontSize: string) => {
    setPreferences((prev) => ({
      ...prev,
      fontSize: fontSize as 'small' | 'medium' | 'large',
    }));
  }, []);

  const setDarkMode = useCallback(
    (enabled: boolean) => {
      const theme = enabled ? 'dark' : 'light';
      setTheme(theme);
    },
    [setTheme],
  );

  const setHeaderTitlePreference = useCallback((preference: HeaderTitleType) => {
    setPreferences((prev) => ({ ...prev, headerTitlePreference: preference }));
  }, []);

  const setPreferencesCallback = useCallback((newPreferences: PartialUserPreferences) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }));
  }, []);

  const resetPreferences = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (user) {
        const result = await preferencesService.resetPreferences(user.id);
        if (result.success) {
          setPreferences(result.data);
          applyPreferences(result.data);
        } else {
          setError(result.error);
        }
      } else {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        setPreferences(defaultUserPreferences);
        applyPreferences(defaultUserPreferences);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  }, [user, preferencesService, applyPreferences]);

  const refreshPreferences = useCallback(() => {
    loadPreferences();
  }, [loadPreferences]);

  const value: SettingsContextType = {
    // Current preferences
    preferences,

    // Individual preference getters (for backward compatibility)
    systemFont: preferences.systemFont,
    language: preferences.language,
    fontSize: preferences.fontSize,
    darkMode: false, // Theme is now managed by next-themes directly
    headerTitlePreference: preferences.headerTitlePreference,

    // Preference setters (direct updates)
    setSystemFont,
    setLanguage,
    setFontSize,
    setDarkMode,
    setHeaderTitlePreference,
    setPreferences: setPreferencesCallback,

    // State
    isLoading,
    isSaving,
    error,

    // Actions
    savePreferences,
    resetPreferences,
    refreshPreferences,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
