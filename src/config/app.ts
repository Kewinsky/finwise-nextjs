import type { FontKey } from '@/lib/fonts';

/**
 * Environment detection
 */
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// =============================================================================
// SUBSCRIPTION PLANS CONFIGURATION
// =============================================================================

/**
 * SUBSCRIPTION_PLANS - Source of truth for all subscription plans
 *
 * This configuration is used throughout the application:
 * - Services layer (BillingService, SubscriptionService)
 * - Pricing pages and components
 * - Checkout flows
 * - Database plan_type column
 *
 * When adding/modifying plans:
 * 1. Update this configuration
 * 2. Update Stripe products/prices
 * 3. Update environment variables (NEXT_PUBLIC_STRIPE_*_PRICE_ID)
 * 4. Service layer types will automatically sync via PlanType
 */
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    price: 0,
    description: 'Perfect for getting started with basic expense tracking.',
    features: [
      'Track expenses and income',
      'Up to 2 accounts',
      '100 transactions/month',
      'AI financial insights (5 queries/month)',
      'Financial dashboard',
      'Category spending analysis',
      'Balance history (last 3 months)',
    ],
    trialDays: 0,
  },
  basic: {
    name: 'Basic',
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    price: 12,
    description: 'Ideal for regular users who need advanced analytics.',
    features: [
      'Up to 5 accounts',
      '1,000 transactions/month',
      'AI financial insights (50 queries/month)',
      'Export to CSV & JSON',
      'Full transaction history',
      'Advanced analytics dashboard',
      'Spending trends & analytics',
      'Monthly financial summaries',
      'Email support',
    ],
    trialDays: 14,
  },
  pro: {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    price: 29,
    description: 'For power users who need unlimited access to all features.',
    features: [
      'Unlimited accounts',
      'Unlimited transactions',
      'Unlimited AI financial insights',
      'Export to CSV & JSON',
      'Full transaction history',
      'Advanced analytics & reporting',
      'Detailed financial reports',
      'Priority support',
      'Access to all features',
    ],
    trialDays: 0,
  },
} as const;

/**
 * PlanType - Union type of all available plan keys
 * Automatically derived from SUBSCRIPTION_PLANS
 */
export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Application metadata
 */
export const APP_METADATA = {
  name: 'Finwise',
  description: 'AI-powered expense and income tracking for smarter financial decisions',
  version: '1.0.0',
  author: 'Finwise',
  keywords: [
    'finance',
    'expense tracking',
    'income tracking',
    'ai',
    'personal finance',
    'budgeting',
  ],
} as const;

/**
 * Application URLs
 */
export const APP_URLS = {
  // Base URLs
  base: isProduction
    ? process.env.NEXT_PUBLIC_APP_URL || 'https://finwise.app'
    : 'http://localhost:3000',

  // API URLs
  api: isProduction
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api` || 'https://finwise.app/api'
    : 'http://localhost:3000/api',

  // Documentation
  docs: 'http://localhost:3000/documentation',

  // Social links
  social: {
    twitter: 'https://twitter.com/finwise',
    github: 'https://github.com/finwise/finwise',
    linkedin: 'https://linkedin.com/company/finwise',
    discord: 'https://discord.gg/finwise',
  },

  // Legal pages
  legal: {
    privacy: '/privacy',
    terms: '/terms',
    cookies: '/cookies',
  },
} as const;

/**
 * Contact information
 */
export const CONTACT_INFO = {
  supportEmail: 'support@finwise.app',
  salesEmail: 'sales@finwise.app',
  generalEmail: 'hello@finwise.app',
  phone: '+1 (555) 123-4567',
} as const;

// =============================================================================
// USER PREFERENCES SETTINGS
// =============================================================================

/**
 * Language options for user preferences
 */
export const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
] as const;

export const DEFAULT_LANGUAGE = 'en' as const;

/**
 * Font options for user preferences
 */
export const FONT_OPTIONS = [
  {
    value: 'system' as const,
    label: 'System Default',
    description: "Use your system's default font",
  },
  {
    value: 'delius' as const,
    label: 'Delius',
    description: 'Handwritten style font',
  },
  {
    value: 'montserrat' as const,
    label: 'Montserrat',
    description: 'Geometric sans-serif font',
  },
  {
    value: 'jetbrainsMono' as const,
    label: 'JetBrains Mono',
    description: 'Monospace font for code',
  },
  {
    value: 'merriweather' as const,
    label: 'Merriweather',
    description: 'Serif font for reading',
  },
  {
    value: 'spaceGrotesk' as const,
    label: 'Space Grotesk',
    description: 'Modern sans-serif font',
  },
] as const;

export const DEFAULT_FONT = 'system' as const;

/**
 * Font size options for user preferences
 */
export const FONT_SIZE_OPTIONS = [
  {
    value: 'small' as const,
    label: 'Small',
    description: 'Compact text size',
    scale: 0.875,
  },
  {
    value: 'medium' as const,
    label: 'Medium',
    description: 'Standard text size',
    scale: 1,
  },
  {
    value: 'large' as const,
    label: 'Large',
    description: 'Larger text for better readability',
    scale: 1.125,
  },
] as const;

export const DEFAULT_FONT_SIZE = 'medium' as const;

/**
 * Notification categories and options
 */
export const NOTIFICATION_CATEGORIES = {
  email: {
    label: 'Email Notifications',
    description: 'Receive notifications via email',
    icon: 'Mail',
    options: [
      {
        key: 'marketing' as const,
        label: 'Marketing',
        description: 'Product updates, new features, and promotional content',
        default: false,
      },
      {
        key: 'security' as const,
        label: 'Security',
        description: 'Login alerts, password changes, and security updates',
        default: true,
      },
      {
        key: 'updates' as const,
        label: 'Updates',
        description: 'Important product updates and announcements',
        default: true,
      },
      {
        key: 'weeklyDigest' as const,
        label: 'Weekly Digest',
        description: 'Weekly summary of your activity and updates',
        default: false,
      },
      {
        key: 'billing' as const,
        label: 'Billing',
        description: 'Payment confirmations, invoices, and billing updates',
        default: true,
      },
      {
        key: 'social' as const,
        label: 'Social',
        description: 'Comments, mentions, and social interactions',
        default: true,
      },
    ],
  },
  push: {
    label: 'Push Notifications',
    description: 'Receive notifications in your browser',
    icon: 'Smartphone',
    options: [
      {
        key: 'security' as const,
        label: 'Security',
        description: 'Login alerts and security updates',
        default: true,
      },
      {
        key: 'updates' as const,
        label: 'Updates',
        description: 'Important product updates',
        default: true,
      },
      {
        key: 'mentions' as const,
        label: 'Mentions',
        description: 'When someone mentions you',
        default: true,
      },
      {
        key: 'comments' as const,
        label: 'Comments',
        description: 'New comments on your posts',
        default: true,
      },
      {
        key: 'likes' as const,
        label: 'Likes',
        description: 'When someone likes your content',
        default: false,
      },
    ],
  },
} as const;

/**
 * Application settings (non-user preferences)
 */
export const APP_SETTINGS = {
  defaultTimezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  currencySymbol: '$',
} as const;

// =============================================================================
// FINANCIAL CONFIGURATION
// =============================================================================

/**
 * Supported currencies for the application
 */
export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'PLN',
] as const;

export const DEFAULT_CURRENCY = 'USD' as const;

/**
 * Currency options with labels for display
 */
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'PLN', label: 'PLN - Polish Złoty' },
] as const;

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/**
 * Account types
 */
export const ACCOUNT_TYPES = ['checking', 'savings', 'investment', 'creditcard'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

/**
 * Transaction categories with id and name
 * This is the source of truth for all transaction categories
 */
export const TRANSACTION_CATEGORIES = {
  income: [
    { id: 'salary', name: 'Salary' },
    { id: 'freelance', name: 'Freelance' },
    { id: 'investment', name: 'Investment' },
    { id: 'gift', name: 'Gift' },
    { id: 'business', name: 'Business' },
    { id: 'other', name: 'Other' },
  ],
  expense: [
    { id: 'food', name: 'Food & Dining' },
    { id: 'transport', name: 'Transportation' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'utilities', name: 'Bills & Utilities' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'education', name: 'Education' },
    { id: 'travel', name: 'Travel' },
    { id: 'other', name: 'Other' },
  ],
  transfer: [{ id: 'transfer', name: 'Transfer' }],
} as const;

/**
 * Common categories as simple string arrays (for backward compatibility)
 */
export const COMMON_CATEGORIES = {
  income: TRANSACTION_CATEGORIES.income.map((cat) => cat.name),
  expense: TRANSACTION_CATEGORIES.expense.map((cat) => cat.name),
  transfer: TRANSACTION_CATEGORIES.transfer.map((cat) => cat.name),
} as const;

/**
 * Account colors for visual distinction
 */
export const ACCOUNT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
] as const;

/**
 * Plan limits configuration
 */
export type PlanLimits = {
  // Account limits
  maxAccounts: number;
  maxTransactionsPerMonth: number;
  maxStorageMB: number;
  aiQueriesPerMonth: number;
  dashboards: number;
  apiAccess: boolean;
  teamMembers: number;
  exportCSV: boolean;
  exportJSON: boolean;
  exportExcel: boolean;
  advancedAnalytics: boolean;
  historyMonths: number; // Number of months of history available (Infinity for full history)
  support: 'none' | 'standard' | 'priority';
};

/**
 * Plan limits by tier
 */
export const PLAN_LIMITS = {
  free: {
    maxAccounts: 2,
    maxTransactionsPerMonth: 100,
    maxStorageMB: 0, // Not used - no file upload system
    aiQueriesPerMonth: 5,
    dashboards: 1, // Only one dashboard exists
    apiAccess: false, // No external API
    teamMembers: 0, // No team sharing
    exportCSV: false,
    exportJSON: false,
    exportExcel: false, // Not implemented
    advancedAnalytics: false, // Same analytics for all, but limit features
    historyMonths: 3, // Last 3 months of data
    support: 'none',
  },
  basic: {
    maxAccounts: 5,
    maxTransactionsPerMonth: 1000,
    maxStorageMB: 0, // Not used - no file upload system
    aiQueriesPerMonth: 50,
    dashboards: 1, // Only one dashboard exists
    apiAccess: false, // No external API
    teamMembers: 0, // No team sharing
    exportCSV: true,
    exportJSON: true,
    exportExcel: false, // Not implemented
    advancedAnalytics: true, // Full analytics features
    historyMonths: Infinity, // Full history
    support: 'standard',
  },
  pro: {
    maxAccounts: Infinity,
    maxTransactionsPerMonth: Infinity,
    maxStorageMB: 0, // Not used - no file upload system
    aiQueriesPerMonth: Infinity,
    dashboards: 1, // Only one dashboard exists
    apiAccess: false, // No external API
    teamMembers: 0, // No team sharing
    exportCSV: true,
    exportJSON: true,
    exportExcel: false, // Not implemented
    advancedAnalytics: true, // Full analytics features
    historyMonths: Infinity, // Full history
    support: 'priority',
  },
} as const;

/**
 * Plan configuration (extends Stripe plans with limits)
 */
export const PLANS_CONFIG = Object.entries(SUBSCRIPTION_PLANS).reduce(
  (acc, [key, plan]) => {
    const planKey = key as PlanType;
    return {
      ...acc,
      [planKey]: {
        ...plan,
        limits: PLAN_LIMITS[planKey],
        key: planKey,
      },
    };
  },
  {} as Record<
    PlanType,
    (typeof SUBSCRIPTION_PLANS)[PlanType] & {
      limits: PlanLimits;
      key: PlanType;
    }
  >,
);

/**
 * Authentication settings
 */
export const AUTH_CONFIG = {
  // Session settings
  sessionDuration: 7 * 24 * 60 * 60, // 7 days in seconds
  refreshTokenDuration: 30 * 24 * 60 * 60, // 30 days in seconds

  // OAuth providers
  oauthProviders: ['google', 'github'] as const,

  // Password requirements
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,

  // Rate limiting
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60, // 15 minutes in seconds

  // Email verification
  requireEmailVerification: true,
  emailVerificationExpiry: 24 * 60 * 60, // 24 hours in seconds
} as const;

/**
 * Pagination settings
 */
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  maxPageSize: 100,
  pageSizeOptions: [10, 25, 50, 100] as const,
} as const;

/**
 * File upload settings
 */
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  maxFileSizeFormatted: '10MB',
  allowedFileTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    spreadsheets: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  allowedImageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  allowedDocumentExtensions: ['.pdf', '.doc', '.docx'],
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  // API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
  },
} as const;

/**
 * Notification settings
 */
export const NOTIFICATION_CONFIG = {
  // Email notifications
  email: {
    enabled: true,
    fromName: APP_METADATA.name,
    fromAddress: CONTACT_INFO.generalEmail,
    replyTo: CONTACT_INFO.supportEmail,
  },

  // In-app notifications
  inApp: {
    enabled: true,
    maxNotifications: 50,
    retentionDays: 30,
  },

  // Push notifications
  push: {
    enabled: false, // Coming soon
  },
} as const;

/**
 * Analytics configuration
 */
export const ANALYTICS_CONFIG = {
  enabled: isProduction,
  providers: {
    googleAnalytics: {
      enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    },
    plausible: {
      enabled: false,
      domain: APP_URLS.base,
    },
  },
  trackPageViews: true,
  trackEvents: true,
} as const;

/**
 * SEO configuration
 */
export const SEO_CONFIG = {
  defaultTitle: APP_METADATA.name,
  titleTemplate: `%s | ${APP_METADATA.name}`,
  defaultDescription: APP_METADATA.description,
  defaultKeywords: APP_METADATA.keywords,
  defaultOgImage: `${APP_URLS.base}/og-image.png`,
  twitterHandle: '@finwise',
  twitterCard: 'summary_large_image' as const,
} as const;

/**
 * Environment information
 */
export const ENVIRONMENT = {
  isProduction,
  isDevelopment,
  isTest,
  nodeEnv: process.env.NODE_ENV,
} as const;

/**
 * Helper functions
 */
export const configHelpers = {
  /**
   * Check if a feature is available for a plan
   */
  hasFeature: (planType: PlanType, feature: keyof PlanLimits) => {
    return PLAN_LIMITS[planType][feature];
  },

  /**
   * Check if limit is unlimited (-1)
   */
  isUnlimited: (value: number | string) => {
    return value === -1 || value === 'unlimited';
  },

  /**
   * Get formatted limit value
   */
  formatLimit: (value: number | string): string => {
    if (value === -1 || value === 'unlimited') return 'Unlimited';
    if (typeof value === 'number') return value.toLocaleString();
    return value;
  },

  /**
   * Check if user has reached limit
   */
  hasReachedLimit: (current: number, limit: number): boolean => {
    if (limit === -1) return false; // unlimited
    return current >= limit;
  },

  /**
   * Get usage percentage
   */
  getUsagePercentage: (current: number, limit: number): number => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  },

  /**
   * Get absolute URL
   */
  getAbsoluteUrl: (path: string): string => {
    return `${APP_URLS.base}${path.startsWith('/') ? path : `/${path}`}`;
  },
};

/**
 * Subscription configuration
 */
export const SUBSCRIPTION_CONFIG = {
  plans: SUBSCRIPTION_PLANS,
  trialExpiringThreshold: 3, // days before trial ends to show "expiring soon"
} as const;

/**
 * Main application configuration export
 *
 * Usage:
 * ```typescript
 * import { appConfig } from "@/config/app";
 *
 * console.log(appConfig.app.name);
 * console.log(appConfig.urls.base);
 * console.log(appConfig.subscription.plans.basic.price);
 * ```
 */
export const appConfig = {
  // Application metadata
  app: APP_METADATA,

  // URLs and links
  urls: APP_URLS,

  // Contact information
  contact: CONTACT_INFO,

  // Application settings
  settings: APP_SETTINGS,

  // Financial configuration
  finance: {
    currencyOptions: CURRENCY_OPTIONS,
    defaultCurrency: DEFAULT_CURRENCY,
    transactionTypes: TRANSACTION_TYPES,
    accountTypes: ACCOUNT_TYPES,
    categories: TRANSACTION_CATEGORIES,
    commonCategories: COMMON_CATEGORIES,
    accountColors: ACCOUNT_COLORS,
  },

  // Subscription configuration (raw plans + helpers)
  subscription: SUBSCRIPTION_CONFIG,

  // Plans and pricing (with limits)
  plans: PLANS_CONFIG,

  // Plan limits
  limits: PLAN_LIMITS,

  // Authentication configuration
  auth: AUTH_CONFIG,

  // Pagination settings
  pagination: PAGINATION_CONFIG,

  // File upload settings
  upload: UPLOAD_CONFIG,

  // Rate limiting
  rateLimit: RATE_LIMIT_CONFIG,

  // Notifications
  notifications: NOTIFICATION_CONFIG,

  // Analytics
  analytics: ANALYTICS_CONFIG,

  // SEO
  seo: SEO_CONFIG,

  // Environment
  env: ENVIRONMENT,

  // Helper functions
  helpers: configHelpers,
} as const;

// =============================================================================
// SETTINGS HELPER FUNCTIONS
// =============================================================================

/**
 * Get language option by code
 */
export function getLanguageOption(code: string) {
  return LANGUAGE_OPTIONS.find((lang) => lang.code === code) || LANGUAGE_OPTIONS[0];
}

/**
 * Get font option by value
 */
export function getFontOption(value: FontKey) {
  return FONT_OPTIONS.find((font) => font.value === value) || FONT_OPTIONS[0];
}

/**
 * Get font size option by value
 */
export function getFontSizeOption(value: string) {
  return FONT_SIZE_OPTIONS.find((size) => size.value === value) || FONT_SIZE_OPTIONS[1];
}

/**
 * Get font size scale by value
 */
export function getFontSizeScale(value: string): number {
  return getFontSizeOption(value).scale;
}

/**
 * Get notification option by category and key
 */
export function getNotificationOption(category: keyof typeof NOTIFICATION_CATEGORIES, key: string) {
  const cat = NOTIFICATION_CATEGORIES[category];
  return cat.options.find((option) => option.key === key);
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Settings types
export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];
export type FontValue = (typeof FONT_OPTIONS)[number]['value'];
export type FontSizeValue = (typeof FONT_SIZE_OPTIONS)[number]['value'];

export type NotificationEmailKey = (typeof NOTIFICATION_CATEGORIES.email.options)[number]['key'];
export type NotificationPushKey = (typeof NOTIFICATION_CATEGORIES.push.options)[number]['key'];

// App config types
export type AppConfig = typeof appConfig;
export type AppMetadata = typeof APP_METADATA;
export type AppUrls = typeof APP_URLS;
export type ContactInfo = typeof CONTACT_INFO;
export type AppSettings = typeof APP_SETTINGS;
export type AuthConfig = typeof AUTH_CONFIG;
