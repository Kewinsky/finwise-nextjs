import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { UsageClientWrapper } from '@/components/settings/usage-client-wrapper';
import {
  validateAuthenticatedUser,
  handleProtectedRouteError,
} from '@/lib/utils/protected-route-utils';
import { getUserSubscription } from '@/lib/actions/billing-actions';
import type { PlanType } from '@/config/app';

/**
 * Server component that fetches subscription data for usage page
 */
async function UsageData() {
  try {
    const user = await validateAuthenticatedUser();
    const subResult = await getUserSubscription(user.id);
    const subscription = subResult.success ? subResult.data : null;
    const currentPlanType = (subscription?.plan_type || 'free') as PlanType;

    return {
      currentPlanType,
    };
  } catch (error) {
    handleProtectedRouteError(error, 'usage data');
  }
}

/**
 * Main usage page component
 * Uses Suspense for better perceived performance
 */
export default function UsagePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UsageContent />
    </Suspense>
  );
}

async function UsageContent() {
  const { currentPlanType } = await UsageData();

  return <UsageClientWrapper currentPlanType={currentPlanType} />;
}
