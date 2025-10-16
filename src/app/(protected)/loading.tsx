import { LoadingSpinner } from '@/components/ui/custom-spinner';

/**
 * Loading UI for the protected route group
 * This automatically wraps all pages in the (protected) group
 * while they are loading, providing a consistent loading experience
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <LoadingSpinner message="Loading..." />
    </div>
  );
}
