/**
 * Services Layer Exports
 *
 * This is the main entry point for the services layer.
 * Import services and types from here for consistency.
 *
 * @example
 * ```typescript
 * import { UserService, AuthService } from "@/services";
 * import type { ServiceResult } from "@/services";
 * ```
 */

// Base types
export type { ServiceResult, PaginationOptions, SortOptions } from '@/types/service.types';

// User service
export { UserService } from './user.service';
export type {
  UserProfile,
  UpdateProfileInput,
  CreateUserProfileInput,
  UserSearchFilters,
} from '@/types/user.types';

// Auth service
export { AuthService } from './auth.service';
export type {
  SignInInput,
  MagicLinkInput,
  OAuthProvider,
  ResetPasswordInput,
  UserWithProfile,
  AuthResult,
  AuthMethod,
} from '@/types/auth.types';

// Subscription service
export { SubscriptionService } from './subscription.service';
export type {
  Subscription,
  SubscriptionStatus,
  SubscriptionWithStatus,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionSyncData,
} from '@/types/subscription.types';
export type { PlanType } from '@/types/subscription.types';

// Billing service
export { BillingService } from './billing.service';
export type {
  BillingPlanType,
  CheckoutSessionOptions,
  CheckoutSession,
  CustomerPortalOptions,
  CustomerPortalSession,
  PaymentMethod,
  Invoice,
  BillingInfo,
} from '@/types/billing.types';

// Notification service
export { NotificationService } from './notification.service';
export type {
  NotificationPreferences,
  NotificationPreferencesData,
} from '@/types/notification.types';
export { defaultNotificationPreferences } from '@/types/notification.types';

// User preferences service
export { UserPreferencesService } from './user-preferences.service';
export type {
  UserPreferences,
  PartialUserPreferences,
  UserPreferencesWithMetadata,
  UpdateUserPreferencesInput,
  PreferencesValidationResult,
  UserPreferencesDB,
  UserPreferencesInsert,
  UserPreferencesUpdate,
} from '@/types/user-preferences.types';
export {
  defaultUserPreferences,
  preferencesHelpers,
  SUPPORTED_LANGUAGES,
  FONT_SIZES,
  dbToAppPreferences,
  appToDbPreferences,
  appToDbUpdate,
} from '@/types/user-preferences.types';

// Finance services
export { AccountService } from './account.service';
export { TransactionService } from './transaction.service';
export { AIAssistantService } from './ai.service';
export { OpenAIUsageService } from './openai-usage.service';
export type { AIUsageData } from './openai-usage.service';
export type {
  Account,
  AccountInsert,
  AccountUpdate,
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  CreateAccountInput,
  UpdateAccountInput,
  CreateTransactionInput,
  UpdateTransactionInput,
  AccountFilters,
  TransactionFilters,
  MonthlySummary,
  SpendingTrends,
  CategorySpending,
  AccountBalance,
  DashboardMetrics,
  RecentTransaction,
  FinancialInsights,
  AIQuestionResponse,
  TransactionExport,
  AccountType,
  TransactionType,
  PaginatedResult,
} from '@/types/finance.types';
