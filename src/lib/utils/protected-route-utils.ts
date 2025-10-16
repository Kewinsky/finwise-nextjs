/**
 * Utilities for protected routes to reduce code duplication
 *
 * These utilities handle common patterns in protected route components
 * like user validation and error handling.
 */

import { getCurrentUser } from '@/lib/actions/auth-actions';
import { log } from '@/lib/logger';
import type { UserWithProfile } from '@/types/auth.types';

/**
 * Validates that a user is authenticated and returns the user data
 * This replaces the repeated pattern in protected route components
 *
 * @returns Promise<UserWithProfile> - The authenticated user
 * @throws Error if user is not found (should not happen in protected routes)
 */
export async function validateAuthenticatedUser(): Promise<UserWithProfile> {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    throw new Error('User not found - this should not happen in protected routes');
  }

  return userResult.user;
}

/**
 * Handles errors in protected route data fetching with consistent logging
 *
 * @param error - The error that occurred
 * @param context - Context about what was being fetched
 * @throws The original error (for error boundaries to handle)
 */
export function handleProtectedRouteError(error: unknown, context: string): never {
  log.error({ error }, `Error fetching ${context}`);
  throw error; // Re-throw to let error boundary handle it
}
