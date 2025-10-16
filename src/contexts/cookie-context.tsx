'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CookiePreferences,
  CookieConsent,
  DEFAULT_COOKIE_PREFERENCES,
} from '@/types/cookies.types';
import {
  getCookieConsent,
  setCookieConsent,
  getCookiePreferences,
  setCookiePreferences,
} from '@/lib/cookies';

interface CookieContextType {
  hasConsented: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  acceptSelected: (preferences: CookiePreferences) => void;
  updatePreferences: (preferences: CookiePreferences) => void;
  showCookieSettings: () => void;
  hideBanner: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function useCookieContext() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieContext must be used within a CookieProvider');
  }
  return context;
}

interface CookieProviderProps {
  children: React.ReactNode;
}

export function CookieProvider({ children }: CookieProviderProps) {
  const [hasConsented, setHasConsented] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_COOKIE_PREFERENCES);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = getCookieConsent();
    const userPreferences = getCookiePreferences();

    if (consent?.hasConsented) {
      setHasConsented(true);
      setPreferences(userPreferences);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };

    const consent: CookieConsent = {
      hasConsented: true,
      preferences: allAccepted,
      timestamp: Date.now(),
    };

    setCookieConsent(consent);
    setCookiePreferences(allAccepted);
    setHasConsented(true);
    setPreferences(allAccepted);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };

    const consent: CookieConsent = {
      hasConsented: true,
      preferences: onlyNecessary,
      timestamp: Date.now(),
    };

    setCookieConsent(consent);
    setCookiePreferences(onlyNecessary);
    setHasConsented(true);
    setPreferences(onlyNecessary);
    setShowBanner(false);
  };

  const acceptSelected = (selectedPreferences: CookiePreferences) => {
    const consent: CookieConsent = {
      hasConsented: true,
      preferences: selectedPreferences,
      timestamp: Date.now(),
    };

    setCookieConsent(consent);
    setCookiePreferences(selectedPreferences);
    setHasConsented(true);
    setPreferences(selectedPreferences);
    setShowBanner(false);
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setCookiePreferences(newPreferences);
    setPreferences(newPreferences);

    // Update consent if user has already consented
    if (hasConsented) {
      const consent: CookieConsent = {
        hasConsented: true,
        preferences: newPreferences,
        timestamp: Date.now(),
      };
      setCookieConsent(consent);
    }
  };

  const showCookieSettings = () => {
    setShowBanner(true);
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  const value: CookieContextType = {
    hasConsented,
    preferences,
    showBanner,
    acceptAll,
    rejectAll,
    acceptSelected,
    updatePreferences,
    showCookieSettings,
    hideBanner,
  };

  return <CookieContext.Provider value={value}>{children}</CookieContext.Provider>;
}
