import { Suspense } from 'react';
import {
  getUserSubscription,
  getUserSubscriptionStatusInfo,
  getPaymentMethods,
  getInvoices,
} from '@/lib/actions/billing-actions';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { BillingClientWrapper } from '@/components/settings/billing-client-wrapper';
import { SUBSCRIPTION_PLANS, type PlanType } from '@/config/app';
import type { Invoice } from '@/types/billing.types';
import {
  validateAuthenticatedUser,
  handleProtectedRouteError,
} from '@/lib/utils/protected-route-utils';

/**
 * Server component that fetches billing data
 */
async function BillingData() {
  try {
    const user = await validateAuthenticatedUser();

    // Fetch billing data in parallel for better performance
    const [subResult, statusResult, pmResult, invResult] = await Promise.all([
      getUserSubscription(user.id),
      getUserSubscriptionStatusInfo(user.id),
      getPaymentMethods(user.id),
      getInvoices(user.id),
    ]);

    const subscription = subResult.success ? subResult.data : null;
    const subscriptionInfo = statusResult.success ? statusResult.data : null;
    const paymentMethods = pmResult.success ? pmResult.data || [] : [];
    const invoices: Invoice[] = invResult.success ? invResult.data || [] : [];

    return {
      user,
      subscription,
      subscriptionInfo,
      paymentMethods,
      invoices,
    };
  } catch (error) {
    handleProtectedRouteError(error, 'billing data');
  }
}

/**
 * Main billing page component
 * Uses Suspense for better perceived performance
 */
export default function BillingPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BillingContent />
    </Suspense>
  );
}

async function BillingContent() {
  const { user, subscription, subscriptionInfo, paymentMethods, invoices } = await BillingData();

  const currentPlan = subscription
    ? SUBSCRIPTION_PLANS[(subscription.plan_type || 'free') as PlanType]
    : SUBSCRIPTION_PLANS.free;

  return (
    <BillingClientWrapper
      user={user}
      subscription={subscription || null}
      subscriptionInfo={subscriptionInfo || null}
      paymentMethods={paymentMethods}
      invoices={invoices}
      currentPlan={currentPlan}
    />
  );
}
