import { LoadingSpinner } from '@/components/ui/custom-spinner';

/**
 * Loading UI for the public route group
 * This automatically wraps all public pages while they are loading
 * Uses a simple spinner for public pages since they're typically faster
 */
export default function Loading() {
  return <LoadingSpinner message="Loading page..." />;
}
