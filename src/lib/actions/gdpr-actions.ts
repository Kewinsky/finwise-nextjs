'use server';

import { createClientForServer } from '@/utils/supabase/server';
import { GDPRExportService } from '@/lib/gdpr/export-user-data';
import { log } from '@/lib/logger';
import { userRateLimit, getClientIdentifier } from '@/lib/ratelimit';
import { headers } from 'next/headers';
import { ERROR_MESSAGES } from '@/lib/constants/errors';
import { LOG_MESSAGES } from '@/lib/constants/logs';

/**
 * Export user data for GDPR compliance
 * Returns a JSON string of all user data that can be downloaded
 */
export async function exportUserData(): Promise<{
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}> {
  try {
    // Apply rate limiting to prevent abuse
    const rateLimitResult = await checkGDPRActionRateLimit('export');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: ERROR_MESSAGES.RATE_LIMITED,
      };
    }

    // Get current authenticated user
    const supabase = await createClientForServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      log.warn(LOG_MESSAGES.AUTH_ATTEMPT('export'));
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    // Initialize GDPR export service
    const gdprService = new GDPRExportService(supabase);

    // Export user data
    const exportResult = await gdprService.exportUserData(user.id);

    if (!exportResult.success) {
      log.error(
        { userId: user.id, error: exportResult.error },
        LOG_MESSAGES.PROCESSING_FAILED('export-user-data'),
      );
      return { success: false, error: exportResult.error };
    }

    // Validate the export data
    if (!GDPRExportService.validateExportData(exportResult.data)) {
      log.error({ userId: user.id }, LOG_MESSAGES.PROCESSING_FAILED('validate-export-data'));
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_DATA,
      };
    }

    // Generate filename
    const filename = GDPRExportService.generateExportFilename();

    // Convert to JSON string
    const jsonData = JSON.stringify(exportResult.data, null, 2);

    log.info(
      { userId: user.id, filename, dataSize: jsonData.length },
      'User data export completed successfully',
    );

    return {
      success: true,
      data: jsonData,
      filename,
    };
  } catch (error) {
    log.error(error, 'Error in exportUserData server action');
    return {
      success: false,
      error: 'An unexpected error occurred during export',
    };
  }
}

/**
 * Helper to apply rate limiting for GDPR actions
 */
async function checkGDPRActionRateLimit(actionType: string): Promise<{
  success: boolean;
  isRateLimited?: boolean;
}> {
  try {
    // Get headers from server action context
    const headersList = await headers();

    // Use shared client identifier function
    const baseId = getClientIdentifier(headersList);
    const clientId = `gdpr-${actionType}:${baseId}`;

    const { success } = await userRateLimit.limit(clientId);

    if (!success) {
      log.warn({ clientId }, 'GDPR action rate limited');
      return { success: false, isRateLimited: true };
    }

    return { success: true };
  } catch (error) {
    log.error(error, 'Rate limiting error in GDPR action');
    // If rate limiting fails, allow the action to proceed
    return { success: true };
  }
}
