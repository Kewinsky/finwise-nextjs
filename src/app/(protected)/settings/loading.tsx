import { LoadingSpinner } from '@/components/ui/custom-spinner';

/**
 * Loading UI for the settings route group
 * This automatically wraps all settings pages while they are loading
 * Provides a consistent loading experience across all settings pages
 *
 * Note: This loading state is necessary for fetching user preferences,
 * subscription data, and other settings-specific information.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <LoadingSpinner message="Loading settings..." />
    </div>
  );
}
