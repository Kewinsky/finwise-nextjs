import { LoadingSpinner } from '@/components/ui/custom-spinner';

/**
 * Loading UI for the auth route group
 * This automatically wraps all auth pages while they are loading
 * Uses a simple spinner for auth pages since they're typically fast
 */
export default function Loading() {
  return <LoadingSpinner message="Loading..." />;
}
