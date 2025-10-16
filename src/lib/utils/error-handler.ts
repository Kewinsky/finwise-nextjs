/**
 * Simple, focused error handling utilities for consistent error processing.
 *
 * Only includes the functions that are actually used in the codebase.
 */

import { log } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants/errors';
import { LOG_MESSAGES } from '@/lib/constants/logs';

/**
 * Handle general action errors with consistent logging and user-friendly messages
 */
export function handleActionError(
  error: unknown,
  action: string,
): { success: false; error: string } {
  log.error({ error, action }, LOG_MESSAGES.PROCESSING_FAILED(action));

  return {
    success: false,
    error: ERROR_MESSAGES.UNEXPECTED,
  };
}

/**
 * Handle validation errors with consistent logging and user-friendly messages
 */
export function handleValidationError(
  validationError: unknown,
  action: string,
  context: Record<string, string | number | boolean> = {},
): { success: false; error: string } {
  log.warn({ validationError, action, ...context }, LOG_MESSAGES.VALIDATION_FAILED(action));

  return {
    success: false,
    error: ERROR_MESSAGES.VALIDATION,
  };
}
