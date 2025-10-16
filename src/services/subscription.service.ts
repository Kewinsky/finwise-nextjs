import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type {
  Subscription,
  SubscriptionWithStatus,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionSyncData,
  SubscriptionFilters,
  SubscriptionStatus,
  BillingStatus,
} from '@/types/subscription.types';
import { log } from '@/lib/logger';

/**
 * SubscriptionService handles subscription business logic
 *
 * Responsibilities:
 * - Subscription CRUD operations
 * - Subscription status calculations
 * - Syncing subscriptions from Stripe
 * - Subscription queries and filtering
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const subscriptionService = new SubscriptionService(supabase);
 *
 * const result = await subscriptionService.getUserSubscription(userId);
 * if (result.success && result.data) {
 *   console.log("Plan:", result.data.plan_type);
 * }
 * ```
 */
export class SubscriptionService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Get subscription by user ID
   */
  async getUserSubscription(userId: string): Promise<ServiceResult<Subscription | null>> {
    try {
      log.info({ userId }, 'Fetching user subscription');

      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      // PGRST116 = no rows returned (user has no subscription)
      if (error && error.code !== 'PGRST116') {
        log.error({ userId, error: error.message, code: error.code }, 'Failed to get subscription');
        return { success: false, error: error.message };
      }

      log.info(
        {
          userId,
          planType: subscription?.plan_type || 'none',
        },
        'User subscription retrieved',
      );

      return { success: true, data: subscription };
    } catch (error) {
      log.error(error, 'Error fetching subscription');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get subscription by Stripe subscription ID
   */
  async getSubscriptionByStripeId(
    stripeSubscriptionId: string,
  ): Promise<ServiceResult<Subscription | null>> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(input: CreateSubscriptionInput): Promise<ServiceResult<Subscription>> {
    try {
      log.info({ userId: input.userId, planType: input.planType }, 'Creating subscription');

      const subscriptionData = {
        user_id: input.userId,
        stripe_customer_id: input.stripeCustomerId,
        stripe_subscription_id: input.stripeSubscriptionId,
        stripe_price_id: input.stripePriceId,
        plan_type: input.planType,
        status: input.status,
        billing_status: input.billingStatus || null,
        stripe_current_period_end: input.currentPeriodEnd,
        current_period_start: input.currentPeriodStart,
        cancel_at_period_end: input.cancelAtPeriodEnd || false,
      };

      const { data, error } = await this.supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        log.error({ userId: input.userId, error: error.message }, 'Failed to create subscription');
        return { success: false, error: error.message };
      }

      log.info(
        { userId: input.userId, subscriptionId: data.id },
        'Subscription created successfully',
      );

      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error creating subscription');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    userId: string,
    input: UpdateSubscriptionInput,
  ): Promise<ServiceResult<Subscription>> {
    try {
      log.info({ userId }, 'Updating subscription');

      const updateData: Partial<Subscription> = {
        updated_at: new Date().toISOString(),
      };

      if (input.status !== undefined) {
        updateData.status = input.status;
      }

      if (input.billingStatus !== undefined) {
        updateData.billing_status = input.billingStatus;
      }

      if (input.planType !== undefined) {
        updateData.plan_type = input.planType;
      }

      if (input.stripePriceId !== undefined) {
        updateData.stripe_price_id = input.stripePriceId;
      }

      if (input.currentPeriodEnd !== undefined) {
        updateData.stripe_current_period_end = input.currentPeriodEnd;
      }

      if (input.currentPeriodStart !== undefined) {
        updateData.current_period_start = input.currentPeriodStart;
      }

      if (input.cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = input.cancelAtPeriodEnd;
      }

      const { data, error } = await this.supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to update subscription');
        return { success: false, error: error.message };
      }

      log.info({ userId }, 'Subscription updated successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error updating subscription');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(userId: string): Promise<ServiceResult<void>> {
    try {
      log.info({ userId }, 'Deleting subscription');

      const { error } = await this.supabase.from('subscriptions').delete().eq('user_id', userId);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to delete subscription');
        return { success: false, error: error.message };
      }

      log.info({ userId }, 'Subscription deleted successfully');
      return { success: true, data: undefined };
    } catch (error) {
      log.error(error, 'Error deleting subscription');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync subscription from Stripe webhook data
   * Creates or updates subscription based on existence
   */
  async syncSubscription(data: SubscriptionSyncData): Promise<ServiceResult<Subscription>> {
    try {
      log.info(
        {
          userId: data.userId,
          stripeSubscriptionId: data.stripeSubscriptionId,
        },
        'Syncing subscription from Stripe',
      );

      const subscriptionData = {
        user_id: data.userId,
        stripe_customer_id: data.stripeCustomerId,
        stripe_subscription_id: data.stripeSubscriptionId,
        stripe_price_id: data.stripePriceId,
        plan_type: data.planType,
        status: data.status,
        billing_status: data.billingStatus || null,
        stripe_current_period_end: data.stripeCurrentPeriodEnd,
        current_period_start: data.currentPeriodStart,
        cancel_at_period_end: data.cancelAtPeriodEnd,
        trial_end: data.trialEnd,
        has_used_trial: data.hasUsedTrial,
        updated_at: new Date().toISOString(),
      };

      // Check if subscription exists
      const existingResult = await this.getUserSubscription(data.userId);

      if (!existingResult.success) {
        return { success: false, error: existingResult.error };
      }

      let result;

      if (existingResult.data) {
        // Update existing subscription
        const { data: updated, error } = await this.supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', data.userId)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        result = updated;
      } else {
        // Insert new subscription
        const { data: created, error } = await this.supabase
          .from('subscriptions')
          .insert(subscriptionData)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        result = created;
      }

      log.info({ userId: data.userId }, 'Subscription synced successfully');
      return { success: true, data: result };
    } catch (error) {
      log.error(error, 'Error syncing subscription');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get subscription status details
   */
  async getSubscriptionStatus(userId: string): Promise<
    ServiceResult<{
      isActive: boolean;
      isTrialing: boolean;
      isCanceled: boolean;
      planType: string | null;
      currentPeriodEnd: string | null;
    }>
  > {
    const result = await this.getUserSubscription(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const subscription = result.data;

    if (!subscription) {
      return {
        success: true,
        data: {
          isActive: false,
          isTrialing: false,
          isCanceled: false,
          planType: 'free',
          currentPeriodEnd: null,
        },
      };
    }

    return {
      success: true,
      data: {
        isActive: subscription.status === 'active',
        isTrialing: subscription.status === 'trialing',
        isCanceled:
          subscription.status === 'canceled' || subscription.cancel_at_period_end === true,
        planType: subscription.plan_type,
        currentPeriodEnd: subscription.stripe_current_period_end,
      },
    };
  }

  /**
   * Get subscription with computed status
   */
  async getUserSubscriptionWithStatus(
    userId: string,
  ): Promise<ServiceResult<SubscriptionWithStatus | null>> {
    const result = await this.getUserSubscription(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (!result.data) {
      return { success: true, data: null };
    }

    const subscription = result.data;

    // Calculate days until renewal
    let daysUntilRenewal: number | undefined;
    if (subscription.stripe_current_period_end) {
      const endDate = new Date(subscription.stripe_current_period_end);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      daysUntilRenewal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const withStatus: SubscriptionWithStatus = {
      ...subscription,
      isActive: subscription.status === 'active',
      isTrialing: subscription.status === 'trialing',
      isCanceled: subscription.status === 'canceled' || subscription.cancel_at_period_end === true,
      daysUntilRenewal,
    };

    return { success: true, data: withStatus };
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const result = await this.getUserSubscription(userId);

    if (!result.success || !result.data) {
      return false;
    }

    const subscription = result.data;
    return subscription.status === 'active' || subscription.status === 'trialing';
  }

  /**
   * Search subscriptions by filters
   */
  async searchSubscriptions(
    filters: SubscriptionFilters,
    limit = 50,
  ): Promise<ServiceResult<Subscription[]>> {
    try {
      let query = this.supabase.from('subscriptions').select('*');

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.billingStatus !== undefined) {
        if (filters.billingStatus === null) {
          query = query.is('billing_status', null);
        } else {
          query = query.eq('billing_status', filters.billingStatus);
        }
      }

      if (filters.planType) {
        query = query.eq('plan_type', filters.planType);
      }

      if (filters.cancelAtPeriodEnd !== undefined) {
        query = query.eq('cancel_at_period_end', filters.cancelAtPeriodEnd);
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // =============================================================================
  // SUBSCRIPTION STATUS VALIDATION
  // =============================================================================

  /**
   * Validate subscription status
   * Covers all possible Stripe subscription statuses (in official order)
   */
  validateSubscriptionStatus(status: string): boolean {
    const validStatuses: SubscriptionStatus[] = [
      'incomplete',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'paused',
    ];
    return validStatuses.includes(status as SubscriptionStatus);
  }

  /**
   * Normalize subscription status for database storage
   */
  normalizeSubscriptionStatus(status: string): string {
    // Handle edge cases and normalize status
    switch (status) {
      case 'paused':
        return 'paused';
      case 'incomplete':
      case 'incomplete_expired':
        return status;
      default:
        return this.validateSubscriptionStatus(status) ? status : 'active';
    }
  }

  // =============================================================================
  // TRIAL & PAYMENT STATUS HELPERS
  // =============================================================================

  /**
   * Check if user is on trial
   */
  isTrialing(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'trialing';
  }

  /**
   * Check if user has an active trial (trialing status + trial_end in future)
   */
  isTrialActive(subscription: Subscription | null): boolean {
    if (!subscription || !this.isTrialing(subscription)) return false;
    if (!subscription.trial_end) return false;

    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    return trialEnd > now;
  }

  /**
   * Get days remaining in trial (returns 0 if not on trial or expired)
   */
  getTrialDaysLeft(subscription: Subscription | null): number {
    if (!subscription || !this.isTrialActive(subscription)) return 0;
    if (!subscription.trial_end) return 0;

    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return daysLeft > 0 ? daysLeft : 0;
  }

  /**
   * Check if trial is expiring soon (within threshold days)
   */
  isTrialExpiringSoon(subscription: Subscription | null, threshold = 3): boolean {
    if (!this.isTrialActive(subscription)) return false;
    const daysLeft = this.getTrialDaysLeft(subscription);
    return daysLeft > 0 && daysLeft <= threshold;
  }

  /**
   * Check if user has used their trial (has_used_trial flag)
   */
  hasUsedTrial(subscription: Subscription | null): boolean {
    return subscription?.has_used_trial === true;
  }

  /**
   * Check if subscription is past due (payment failed)
   */
  isPaymentPastDue(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.billing_status === 'past_due';
  }

  /**
   * Check if subscription is unpaid
   */
  isPaymentUnpaid(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.billing_status === 'unpaid';
  }

  /**
   * Check if subscription has payment issues (past_due or unpaid)
   */
  hasPaymentIssue(subscription: Subscription | null): boolean {
    return this.isPaymentPastDue(subscription) || this.isPaymentUnpaid(subscription);
  }

  /**
   * Check if user is on free plan (no subscription or explicitly free)
   */
  isFreePlan(subscription: Subscription | null): boolean {
    if (!subscription) return true;
    return subscription.plan_type === 'free' || subscription.status === 'canceled';
  }

  /**
   * Get current plan name
   */
  getCurrentPlanName(subscription: Subscription | null): string {
    if (!subscription || subscription.status === 'canceled') return 'Free';

    // Map plan_type to readable name
    const planMap: Record<string, string> = {
      free: 'Free',
      basic: 'Basic',
      pro: 'Pro',
    };

    return planMap[subscription.plan_type || 'free'] || 'Free';
  }

  /**
   * Check if subscription is active (active or trialing)
   */
  isSubscriptionActive(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trialing';
  }

  /**
   * Check if subscription is scheduled for cancellation
   */
  isScheduledForCancellation(subscription: Subscription | null): boolean {
    return subscription?.cancel_at_period_end === true;
  }

  /**
   * Check if subscription is paused
   */
  isPaused(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'paused';
  }

  /**
   * Check if subscription is incomplete
   */
  isIncomplete(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'incomplete';
  }

  /**
   * Check if subscription is incomplete and expired
   */
  isIncompleteExpired(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'incomplete_expired';
  }

  /**
   * Check if subscription requires payment action (incomplete status)
   */
  requiresPaymentAction(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'incomplete';
  }

  /**
   * Check if subscription is expired (canceled, unpaid, or incomplete_expired)
   */
  isExpired(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return (
      subscription.billing_status === 'canceled' ||
      subscription.billing_status === 'unpaid' ||
      subscription.status === 'incomplete_expired'
    );
  }

  /**
   * Check if subscription is in a problematic state (past_due, unpaid, incomplete_expired)
   */
  hasPaymentProblem(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return (
      subscription.billing_status === 'past_due' ||
      subscription.billing_status === 'unpaid' ||
      subscription.status === 'incomplete_expired'
    );
  }

  /**
   * Get comprehensive subscription status info
   */
  getSubscriptionStatusInfo(subscription: Subscription | null) {
    const bannerInfo = this.getBannerInfo(subscription);

    return {
      // Core status
      isActive: this.isSubscriptionActive(subscription),
      isCanceled: subscription?.billing_status === 'canceled',
      isScheduledForCancellation: this.isScheduledForCancellation(subscription),
      isPaused: this.isPaused(subscription),
      isIncomplete: this.isIncomplete(subscription),
      isIncompleteExpired: this.isIncompleteExpired(subscription),
      isExpired: this.isExpired(subscription),

      // Trial info
      isTrialing: this.isTrialing(subscription),
      isTrialActive: this.isTrialActive(subscription),
      trialDaysLeft: this.getTrialDaysLeft(subscription),
      isTrialExpiringSoon: this.isTrialExpiringSoon(subscription),
      hasUsedTrial: this.hasUsedTrial(subscription),

      // Payment info
      isPaymentPastDue: this.isPaymentPastDue(subscription),
      isPaymentUnpaid: this.isPaymentUnpaid(subscription),
      hasPaymentIssue: this.hasPaymentIssue(subscription),
      hasPaymentProblem: this.hasPaymentProblem(subscription),
      requiresPaymentAction: this.requiresPaymentAction(subscription),

      // Plan info
      isFreePlan: this.isFreePlan(subscription),
      currentPlanName: this.getCurrentPlanName(subscription),
      planType: subscription?.plan_type || 'free',

      // Period info
      currentPeriodEnd: subscription?.stripe_current_period_end || null,
      trialEnd: subscription?.trial_end || null,

      // Billing status
      billingStatus: (subscription?.billing_status as BillingStatus) || null,

      // Access control (MVP requirement)
      hasActiveAccess: this.hasActiveAccess(subscription),

      // UI Banner info
      bannerType: bannerInfo.type,
      bannerMessage: bannerInfo.message,
    };
  }

  /**
   * Get banner information based on subscription state
   * Banner logic depends exclusively on plan_type and billing_status
   */
  getBannerInfo(subscription: Subscription | null): {
    type: 'start_trial' | 'trial_countdown' | 'payment_issue' | 'canceled_ends_soon' | null;
    message: string | null;
  } {
    if (!subscription) {
      // No subscription - show start trial banner
      return {
        type: 'start_trial',
        message: 'Start your free trial to unlock premium features!',
      };
    }

    const { plan_type, billing_status, status } = subscription;

    // Free plan - show start trial banner
    if (plan_type === 'free') {
      return {
        type: 'start_trial',
        message: 'Start your free trial to unlock premium features!',
      };
    }

    // Payment issue banner - prioritize over trial countdown
    if (billing_status === 'past_due') {
      return {
        type: 'payment_issue',
        message: 'Payment issue – update your payment method to continue access.',
      };
    }

    // Trial countdown banner - only show when 3 days or less remaining
    if (status === 'trialing' && this.isTrialActive(subscription)) {
      const daysLeft = this.getTrialDaysLeft(subscription);
      if (daysLeft <= 3) {
        return {
          type: 'trial_countdown',
          message: `Trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Upgrade to continue access.`,
        };
      }
    }

    // Canceled subscription banner (until period ends)
    if (billing_status === 'canceled' && plan_type !== 'free') {
      return {
        type: 'canceled_ends_soon',
        message:
          'Subscription canceled. You still have access until the end of your billing period.',
      };
    }

    // No banner for other states
    return {
      type: null,
      message: null,
    };
  }

  /**
   * Check if user has active access (MVP requirement)
   * Users have access if: active, trialing, incomplete, paused, or scheduled for cancellation
   * No access for: canceled, unpaid, incomplete_expired, past_due
   */
  hasActiveAccess(subscription: Subscription | null): boolean {
    if (!subscription) return false;

    // Define access-granting statuses
    const accessGrantingStatuses: SubscriptionStatus[] = [
      'active',
      'trialing',
      'incomplete',
      'paused',
    ];

    // Grant access for these statuses
    if (accessGrantingStatuses.includes(subscription.status as SubscriptionStatus)) {
      return true;
    }

    // Grant access for subscriptions scheduled for cancellation (until period ends)
    if (this.isScheduledForCancellation(subscription)) return true;

    // No access for: canceled, unpaid, incomplete_expired, past_due
    return false;
  }

  /**
   * Handle subscription lifecycle transitions according to specification
   * This method should be called when processing Stripe webhooks or subscription updates
   */
  async handleSubscriptionLifecycleTransition(
    userId: string,
    transition:
      | 'trial_start'
      | 'trial_end_success'
      | 'trial_end_failed'
      | 'payment_failed'
      | 'payment_succeeded'
      | 'manual_cancel'
      | 'period_end'
      | 'stripe_deleted',
  ): Promise<ServiceResult<Subscription>> {
    try {
      const currentResult = await this.getUserSubscription(userId);
      if (!currentResult.success) {
        return { success: false, error: currentResult.error };
      }

      const current = currentResult.data;
      if (!current) {
        return { success: false, error: 'No subscription found' };
      }

      let updateData: UpdateSubscriptionInput = {};

      switch (transition) {
        case 'trial_start':
          updateData = {
            planType: 'basic',
            status: 'trialing',
            billingStatus: null,
          };
          break;

        case 'trial_end_success':
          updateData = {
            planType: 'basic',
            status: 'active',
            billingStatus: null,
          };
          break;

        case 'trial_end_failed':
          updateData = {
            planType: 'basic',
            status: 'trialing', // Keep trialing status during retry period
            billingStatus: 'past_due',
          };
          break;

        case 'payment_failed':
          updateData = {
            billingStatus: 'past_due',
          };
          break;

        case 'payment_succeeded':
          updateData = {
            billingStatus: null,
            status: 'active',
          };
          break;

        case 'manual_cancel':
          updateData = {
            billingStatus: 'canceled',
          };
          break;

        case 'period_end':
          // After 3 failed retries or when canceled period ends
          if (current.billing_status === 'past_due' || current.billing_status === 'canceled') {
            updateData = {
              planType: 'free',
              status: 'active',
              billingStatus: 'unpaid',
            };
          }
          break;

        case 'stripe_deleted':
          updateData = {
            planType: 'free',
            status: 'active',
            billingStatus: 'canceled',
          };
          break;
      }

      if (Object.keys(updateData).length === 0) {
        return { success: true, data: current };
      }

      return await this.updateSubscription(userId, updateData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
