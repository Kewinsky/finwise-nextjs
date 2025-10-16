import { getPlanByPriceId } from '@/lib/subscription-utils';
import { createServiceClient } from '@/utils/supabase/server';
import { stripe } from './config';
import type Stripe from 'stripe';
import { SubscriptionService } from '@/services';
import type { PlanType, SubscriptionStatus, BillingStatus } from '@/types/subscription.types';

export async function syncSubscriptionToDatabase(subscription: Stripe.Subscription) {
  // Use service client for webhook/background operations (bypasses RLS)
  const supabase = await createServiceClient();

  const customerId = subscription.customer as string;
  const subscriptionItem = subscription.items.data[0];
  const priceId = subscriptionItem?.price.id;

  if (!priceId) {
    throw new Error('No price ID found in subscription');
  }

  const planType = getPlanByPriceId(priceId);
  if (!planType) {
    throw new Error(`Unknown price ID: ${priceId}`);
  }

  // Get user ID from customer metadata
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer || customer.deleted || !customer.metadata?.userId) {
    throw new Error(`No user ID found in customer metadata for customer: ${customerId}`);
  }

  const userId = customer.metadata.userId;

  // Delegate to service (business logic)
  const subscriptionService = new SubscriptionService(supabase);

  // Extract trial information
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  // Determine if user has used trial
  const hasUsedTrial: boolean =
    subscription.status === 'trialing' ||
    Boolean(subscription.trial_end && subscription.trial_end < Math.floor(Date.now() / 1000));

  // Map Stripe status to billing_status according to specification
  const mapStripeStatusToBillingStatus = (stripeStatus: string): BillingStatus => {
    switch (stripeStatus) {
      case 'past_due':
        return 'past_due';
      case 'unpaid':
        return 'unpaid';
      case 'canceled':
        return 'canceled';
      default:
        return null; // active, trialing, incomplete, paused, etc.
    }
  };

  const result = await subscriptionService.syncSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    planType: planType as PlanType,
    status: subscription.status as SubscriptionStatus,
    billingStatus: mapStripeStatusToBillingStatus(subscription.status),
    stripeCurrentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000).toISOString(),
    currentPeriodStart: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    trialEnd,
    hasUsedTrial,
  });

  if (!result.success) {
    throw new Error(`Failed to sync subscription: ${result.error}`);
  }

  return result.data;
}

export async function deleteSubscriptionFromDatabase(subscriptionId: string) {
  // Use service client for webhook/background operations (bypasses RLS)
  const supabase = await createServiceClient();
  const subscriptionService = new SubscriptionService(supabase);

  // First get the subscription to find the user_id
  const result = await subscriptionService.getSubscriptionByStripeId(subscriptionId);

  if (!result.success || !result.data) {
    return; // Subscription not found, nothing to delete
  }

  // Delete the subscription
  const deleteResult = await subscriptionService.deleteSubscription(result.data.user_id);

  if (!deleteResult.success) {
    throw new Error(`Failed to delete subscription: ${deleteResult.error}`);
  }
}
