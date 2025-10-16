import {
  CookiePreferences,
  CookieConsent,
  DEFAULT_COOKIE_PREFERENCES,
} from '@/types/cookies.types';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

// Cookie utility functions
export function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Cookie consent management
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return consent ? JSON.parse(consent) : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // Silently fail - not critical
  }
}

export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_COOKIE_PREFERENCES;

  try {
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    return preferences ? JSON.parse(preferences) : DEFAULT_COOKIE_PREFERENCES;
  } catch {
    return DEFAULT_COOKIE_PREFERENCES;
  }
}

export function setCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));

    // Update consent with new preferences
    const consent: CookieConsent = {
      hasConsented: true,
      preferences,
      timestamp: Date.now(),
    };
    setCookieConsent(consent);
  } catch {
    // Silently fail - not critical
  }
}

export function clearAllCookies(): void {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  localStorage.removeItem(COOKIE_PREFERENCES_KEY);

  // Clear all cookies except necessary ones
  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

    // Don't delete Supabase auth cookies or other necessary cookies
    if (!name.startsWith('sb-') && name !== 'cookie-consent') {
      deleteCookie(name);
    }
  });
}

export function hasUserConsented(): boolean {
  const consent = getCookieConsent();
  return consent?.hasConsented ?? false;
}

// Analytics cookie helpers
export function setAnalyticsCookie(name: string, value: string, days: number = 365): void {
  const preferences = getCookiePreferences();
  if (preferences.analytics) {
    setCookie(name, value, days);
  }
}

export function setMarketingCookie(name: string, value: string, days: number = 365): void {
  const preferences = getCookiePreferences();
  if (preferences.marketing) {
    setCookie(name, value, days);
  }
}

export function setFunctionalCookie(name: string, value: string, days: number = 365): void {
  const preferences = getCookiePreferences();
  if (preferences.functional) {
    setCookie(name, value, days);
  }
}
