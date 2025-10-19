// Re-export all types for easy importing
export * from './database.types';
export * from './user.types';
export * from './subscription.types';
export * from './notification.types';
export * from './cookies.types';
export * from './billing.types';
export * from './service.types';
export * from './auth.types';
export * from './finance.types';

// Common type aliases for convenience
export type { Tables, Database } from './database.types';
export type {
  User,
  UserProfile,
  UpdateProfileInput,
  UserProfileWithMetadata,
  CreateUserProfileInput,
  UserSearchFilters,
} from './user.types';
export type {
  Subscription,
  SubscriptionStatus,
  PlanType,
  SubscriptionWithStatus,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionSyncData,
  SubscriptionFilters,
} from './subscription.types';
export type {
  NotificationPreferences,
  NotificationPreferencesRow,
  NotificationPreferencesData,
} from './notification.types';
export type { CookiePreferences, COOKIE_CATEGORIES } from './cookies.types';
export type {
  BillingPlanType,
  CheckoutSessionOptions,
  CheckoutSession,
  CustomerPortalOptions,
  CustomerPortalSession,
  PaymentMethod,
  Invoice,
  BillingInfo,
  InvoiceFilters,
  UsageRecord,
} from './billing.types';
export type {
  ServiceResult,
  PaginationOptions,
  SortOptions,
  FilterOperator,
  Filter,
  ListResult,
  ServiceConfig,
} from './service.types';
export type {
  SignInInput,
  MagicLinkInput,
  OAuthProvider,
  ResetPasswordInput,
  UserWithProfile,
  AuthResult,
  AuthMethod,
  OAuthRedirectOptions,
} from './auth.types';
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
} from './finance.types';
