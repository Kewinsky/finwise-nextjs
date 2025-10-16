export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface CookieConsent {
  hasConsented: boolean;
  preferences: CookiePreferences;
  timestamp: number;
}

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Necessary',
    description:
      'Essential cookies required for the website to function properly. These cannot be disabled.',
    required: true,
  },
  analytics: {
    name: 'Analytics',
    description:
      'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    required: false,
  },
  marketing: {
    name: 'Marketing',
    description:
      'Used to track visitors across websites to display relevant and engaging advertisements.',
    required: false,
  },
  functional: {
    name: 'Functional',
    description:
      'Enable enhanced functionality and personalization, such as remembering your preferences.',
    required: false,
  },
} as const;
