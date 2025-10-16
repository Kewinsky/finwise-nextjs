import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { ProfileClientWrapper } from '@/components/settings/profile-client-wrapper';
import {
  validateAuthenticatedUser,
  handleProtectedRouteError,
} from '@/lib/utils/protected-route-utils';

/**
 * Server component that fetches user profile data
 */
async function ProfileData() {
  try {
    return await validateAuthenticatedUser();
  } catch (error) {
    handleProtectedRouteError(error, 'profile data');
  }
}

/**
 * Main profile settings page component
 * Uses Suspense for better perceived performance
 */
export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const user = await ProfileData();

  const initialFormData = {
    fullName: user.profile?.full_name || '',
  };

  return (
    <div className="space-y-6">
      <ProfileClientWrapper user={user} initialFormData={initialFormData} />
    </div>
  );
}
