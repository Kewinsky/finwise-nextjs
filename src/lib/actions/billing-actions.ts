'use server';

import { createClientForServer } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe/config';
import { log } from '@/lib/logger';
import { SubscriptionService, BillingService } from '@/services';
import type { PlanType, Subscription, SubscriptionStatusInfo } from '@/types/subscription.types';
import type {
  PaymentMethod,
  Invoice,
  CheckoutSession,
  CustomerPortalSession,
} from '@/types/billing.types';
import { checkBillingRateLimit } from '@/lib/ratelimit/rate-limit-utils';
import { getTrialDaysByPlan } from '@/lib/subscription-utils';
import { LOG_MESSAGES } from '@/lib/constants/logs';
import { handleActionError } from '@/lib/utils/error-handler';

/**
 * Get user subscription information
 */
export async function getUserSubscription(userId: string): Promise<{
  success: boolean;
  data?: Subscription | null;
  error?: string;
}> {
  try {
    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const subscriptionService = new SubscriptionService(supabase);

    const result = await subscriptionService.getUserSubscription(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error, 'get-user-subscription');
  }
}

/**
 * Get user subscription status info
 */
export async function getUserSubscriptionStatusInfo(userId: string): Promise<{
  success: boolean;
  data?: SubscriptionStatusInfo | null;
  error?: string;
}> {
  try {
    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const subscriptionService = new SubscriptionService(supabase);

    const subscriptionResult = await subscriptionService.getUserSubscription(userId);

    if (!subscriptionResult.success) {
      return { success: false, error: subscriptionResult.error };
    }

    const subscription = subscriptionResult.data;
    const statusInfo = subscriptionService.getSubscriptionStatusInfo(subscription);

    return { success: true, data: statusInfo };
  } catch (error) {
    return handleActionError(error, 'get-subscription-status');
  }
}

/**
 * Get user payment methods
 */
export async function getPaymentMethods(userId: string): Promise<{
  success: boolean;
  data?: PaymentMethod[];
  error?: string;
}> {
  try {
    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const billingService = new BillingService(supabase, stripe);

    const result = await billingService.getPaymentMethods(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error, 'get-payment-methods');
  }
}

/**
 * Get user invoices
 */
export async function getInvoices(
  userId: string,
  limit = 10,
): Promise<{
  success: boolean;
  data?: Invoice[];
  error?: string;
}> {
  try {
    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const billingService = new BillingService(supabase, stripe);

    const result = await billingService.getInvoices(userId, { limit });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error, 'get-invoices');
  }
}

/**
 * Create Stripe checkout session for subscription
 */
export async function createCheckoutSessionAction(
  planType: PlanType,
  successUrl?: string,
  cancelUrl?: string,
): Promise<{
  success: boolean;
  data?: CheckoutSession;
  error?: string;
}> {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkBillingRateLimit('checkout');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many checkout attempts. Please wait 15 minutes before trying again.',
      };
    }

    const supabase = await createClientForServer();

    // Get authenticated user (server action responsibility)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      log.warn(LOG_MESSAGES.AUTH_ATTEMPT('checkout-session'));
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const billingService = new BillingService(supabase, stripe);

    // Get trial days for the plan
    const trialDays = getTrialDaysByPlan(planType as PlanType);

    const result = await billingService.createCheckoutSession({
      userId: user.id,
      planType: planType as PlanType,
      successUrl,
      cancelUrl,
      trialDays: trialDays > 0 ? trialDays : undefined,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error, 'create-checkout-session');
  }
}

/**
 * Create Stripe customer portal session
 */
export async function createCustomerPortalAction(returnUrl?: string): Promise<{
  success: boolean;
  data?: CustomerPortalSession;
  error?: string;
}> {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkBillingRateLimit('portal');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many portal access attempts. Please wait 15 minutes before trying again.',
      };
    }

    const supabase = await createClientForServer();

    // Get authenticated user (server action responsibility)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const billingService = new BillingService(supabase, stripe);

    const result = await billingService.createCustomerPortalSession({
      userId: user.id,
      returnUrl,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error, 'create-customer-portal');
  }
}

/**
 * Start trial for a specific plan
 */
export async function startTrialAction(planType: PlanType): Promise<{
  success: boolean;
  data?: CheckoutSession;
  error?: string;
}> {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkBillingRateLimit('trial');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many trial attempts. Please wait 15 minutes before trying again.',
      };
    }

    const supabase = await createClientForServer();

    // Get authenticated user (server action responsibility)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if user has already used trial
    const subscriptionService = new SubscriptionService(supabase);
    const subscriptionResult = await subscriptionService.getUserSubscription(user.id);

    if (subscriptionResult.success && subscriptionResult.data?.has_used_trial) {
      return {
        success: false,
        error: 'You have already used your trial period.',
      };
    }

    // Delegate to service (business logic)
    const billingService = new BillingService(supabase, stripe);

    // Get trial days for the plan
    const trialDays = getTrialDaysByPlan(planType);

    if (trialDays === 0) {
      return {
        success: false,
        error: 'This plan does not offer a trial period.',
      };
    }

    const result = await billingService.createCheckoutSession({
      userId: user.id,
      planType,
      trialDays,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error, 'start-trial');
  }
}

/**
 * Upgrade subscription to a different plan
 */
export async function upgradeSubscriptionAction(planType: PlanType): Promise<{
  success: boolean;
  data?: CheckoutSession;
  error?: string;
}> {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkBillingRateLimit('upgrade');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many upgrade attempts. Please wait 15 minutes before trying again.',
      };
    }

    const supabase = await createClientForServer();

    // Get authenticated user (server action responsibility)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const billingService = new BillingService(supabase, stripe);

    const result = await billingService.createCheckoutSession({
      userId: user.id,
      planType,
      trialDays: 0, // No trial for upgrades
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error, 'upgrade-subscription');
  }
}
