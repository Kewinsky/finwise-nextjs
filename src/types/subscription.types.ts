import type { Tables } from '@/types/database.types';

/**
 * Subscription from database
 */
export type Subscription = Tables<'subscriptions'>;

/**
 * Subscription status type - matches Stripe's official status enum
 * From Stripe docs: incomplete, incomplete_expired, trialing, active, past_due, canceled, unpaid, or paused
 */
export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

/**
 * Plan type - matches SUBSCRIPTION_PLANS from @/config/app
 */
export type PlanType = 'free' | 'basic' | 'pro';

/**
 * Billing status type - mirrors Stripe's remote billing state
 * Used to track payment issues and billing problems
 */
export type BillingStatus = 'past_due' | 'unpaid' | 'canceled' | null;

/**
 * Subscription with computed status
 */
export interface SubscriptionWithStatus extends Subscription {
  isActive: boolean;
  isTrialing: boolean;
  isCanceled: boolean;
  daysUntilRenewal?: number;
}

/**
 * Create subscription input
 */
export interface CreateSubscriptionInput {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  billingStatus?: BillingStatus;
  currentPeriodEnd: string;
  currentPeriodStart: string;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Update subscription input
 */
export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus;
  billingStatus?: BillingStatus;
  planType?: PlanType;
  stripePriceId?: string;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Subscription sync data from Stripe
 */
export interface SubscriptionSyncData {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  billingStatus?: BillingStatus;
  stripeCurrentPeriodEnd: string;
  currentPeriodStart: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string | null;
  hasUsedTrial?: boolean;
}

/**
 * Subscription filters
 */
export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  billingStatus?: BillingStatus;
  planType?: PlanType;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Comprehensive subscription status information
 * Returned by SubscriptionService.getSubscriptionStatusInfo()
 */
export interface SubscriptionStatusInfo {
  // Core status
  isActive: boolean;
  isCanceled: boolean;
  isScheduledForCancellation: boolean;
  isPaused: boolean;
  isIncomplete: boolean;
  isIncompleteExpired: boolean;
  isExpired: boolean;

  // Trial info
  isTrialing: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
  isTrialExpiringSoon: boolean;
  hasUsedTrial: boolean;

  // Payment info
  isPaymentPastDue: boolean;
  isPaymentUnpaid: boolean;
  hasPaymentIssue: boolean;
  hasPaymentProblem: boolean;
  requiresPaymentAction: boolean;

  // Plan info
  isFreePlan: boolean;
  currentPlanName: string;
  planType: string;

  // Period info
  currentPeriodEnd: string | null;
  trialEnd: string | null;

  // Billing status
  billingStatus: BillingStatus;

  // Access control (MVP requirement)
  hasActiveAccess: boolean;

  // UI Banner info
  bannerType: 'start_trial' | 'trial_countdown' | 'payment_issue' | 'canceled_ends_soon' | null;
  bannerMessage: string | null;
}
