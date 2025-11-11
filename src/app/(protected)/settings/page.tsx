import { Suspense } from 'react';
import { getAuthenticationMethod } from '@/lib/actions/auth-actions';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { SettingsClientWrapper } from '@/components/settings/settings-client-wrapper';
import { SubscriptionService } from '@/services/subscription.service';
import { createClientForServer } from '@/utils/supabase/server';
import {
  validateAuthenticatedUser,
  handleProtectedRouteError,
} from '@/lib/utils/protected-route-utils';

/**
 * Server component that fetches settings-specific data
 * User auth is already handled by the parent layout
 */
async function SettingsData() {
  try {
    const user = await validateAuthenticatedUser();

    // Create Supabase client once and reuse it
    const supabase = await createClientForServer();
    const subscriptionService = new SubscriptionService(supabase);

    // Fetch settings-specific data in parallel for better performance
    const [authResult, subscriptionResult] = await Promise.all([
      getAuthenticationMethod(),
      subscriptionService.getUserSubscription(user.id),
    ]);

    const isPasswordAuthenticated = authResult.success && authResult.method === 'password';
    const userEmail = user.profile?.email || '';

    // Process subscription info
    const subscriptionInfo = subscriptionResult.success
      ? subscriptionService.getSubscriptionStatusInfo(subscriptionResult.data)
      : null;

    return {
      user,
      isPasswordAuthenticated,
      userEmail,
      subscriptionInfo,
    };
  } catch (error) {
    handleProtectedRouteError(error, 'settings data');
  }
}

/**
 * Main settings page component
 * Uses Suspense for better perceived performance
 */
export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const { user, isPasswordAuthenticated, userEmail, subscriptionInfo } = await SettingsData();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Unable to load settings. Please refresh the page or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 @md:space-y-6">
      <SettingsClientWrapper
        isPasswordAuthenticated={isPasswordAuthenticated}
        userEmail={userEmail}
        subscriptionInfo={subscriptionInfo}
      />
    </div>
  );
}
