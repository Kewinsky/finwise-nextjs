'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { DEFAULT_CURRENCY } from '@/config/app';

/**
 * Hook to get user's base currency from preferences
 * Falls back to DEFAULT_CURRENCY if preferences are not loaded
 */
export function useBaseCurrency(): string {
  const { preferences, isLoading } = useSettings();
  const [baseCurrency, setBaseCurrency] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    if (!isLoading && preferences?.baseCurrency) {
      setBaseCurrency(preferences.baseCurrency);
    }
  }, [preferences, isLoading]);

  return baseCurrency;
}
