import { Suspense } from 'react';
import { getNotificationPreferences } from '@/lib/actions/notification-actions';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { NotificationsClientWrapper } from '@/components/settings/notifications-client-wrapper';
import { defaultNotificationPreferences } from '@/types/notification.types';

/**
 * Server component that fetches notification preferences data
 * This replaces the useEffect + useState pattern with server-side data fetching
 */
async function NotificationsData() {
  try {
    const result = await getNotificationPreferences();
    if (result.success && result.preferences) {
      return result.preferences;
    } else {
      // Use defaults if there's an error
      return defaultNotificationPreferences;
    }
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return defaultNotificationPreferences;
  }
}

/**
 * Main notifications page component
 * Uses Suspense for better perceived performance
 */
export default function NotificationsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NotificationsContent />
    </Suspense>
  );
}

async function NotificationsContent() {
  const preferences = await NotificationsData();

  return (
    <div className="space-y-6">
      <NotificationsClientWrapper preferences={preferences} />
    </div>
  );
}
