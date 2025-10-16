import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import { UserService } from '@/services/user.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { SubscriptionService } from '@/services/subscription.service';
import { log } from '@/lib/logger';

/**
 * GDPR-compliant user data export interface
 * Contains all user-related data that should be exported
 */
export interface UserDataExport {
  /** Export metadata */
  exportInfo: {
    /** When the export was generated */
    exportedAt: string;
    /** User ID for verification */
    userId: string;
    /** Export format version for future compatibility */
    formatVersion: string;
  };
  /** User profile information */
  profile: {
    /** User ID */
    id: string;
    /** Email address */
    email: string;
    /** Full name */
    fullName: string | null;
    /** Avatar URL */
    avatarUrl: string | null;
    /** User role */
    role: string | null;
    /** Account creation date */
    createdAt: string | null;
    /** Last update date */
    updatedAt: string | null;
    /** Whether this was the user's first login */
    isFirstLogin: boolean | null;
  };
  /** User preferences */
  preferences: {
    /** Language preference */
    language: string;
    /** Font size preference */
    fontSize: string;
    /** System font preference */
    systemFont: string;
  };
  /** Notification preferences */
  notificationPreferences: {
    /** Email preferences */
    email: {
      /** Billing notifications */
      billing: boolean;
      /** Marketing emails */
      marketing: boolean;
      /** Security notifications */
      security: boolean;
      /** Social notifications */
      social: boolean;
      /** General updates */
      updates: boolean;
      /** Weekly digest */
      weeklyDigest: boolean;
    };
    /** Push notification preferences */
    push: {
      /** Comment notifications */
      comments: boolean;
      /** Like notifications */
      likes: boolean;
      /** Mention notifications */
      mentions: boolean;
      /** Security notifications */
      security: boolean;
      /** General updates */
      updates: boolean;
    };
    /** When notification preferences were created */
    createdAt: string | null;
    /** When notification preferences were last updated */
    updatedAt: string | null;
  };
  /** Subscription information */
  subscription: {
    /** Subscription ID */
    id: string | null;
    /** Plan type */
    planType: string | null;
    /** Subscription status */
    status: string | null;
    /** Stripe customer ID */
    stripeCustomerId: string | null;
    /** Stripe subscription ID */
    stripeSubscriptionId: string | null;
    /** Stripe price ID */
    stripePriceId: string | null;
    /** Current period start */
    currentPeriodStart: string | null;
    /** Current period end */
    currentPeriodEnd: string | null;
    /** Whether subscription cancels at period end */
    cancelAtPeriodEnd: boolean | null;
    /** When subscription was created */
    createdAt: string | null;
    /** When subscription was last updated */
    updatedAt: string | null;
  };
}

/**
 * GDPR Export Service
 * Handles the complete export of user data for GDPR compliance
 */
export class GDPRExportService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Export all user data for GDPR compliance
   * Fetches and sanitizes all user-related data from the database
   */
  async exportUserData(userId: string): Promise<ServiceResult<UserDataExport>> {
    try {
      log.info({ userId }, 'Starting GDPR data export');

      // Initialize services
      const userService = new UserService(this.supabase);
      const preferencesService = new UserPreferencesService(this.supabase);
      const subscriptionService = new SubscriptionService(this.supabase);

      // Fetch all user data in parallel for better performance
      const [profileResult, preferencesResult, notificationPreferencesResult, subscriptionResult] =
        await Promise.all([
          userService.getUserById(userId),
          preferencesService.getPreferences(userId),
          this.getNotificationPreferences(userId),
          subscriptionService.getUserSubscription(userId),
        ]);

      // Check if profile exists (required)
      if (!profileResult.success || !profileResult.data) {
        log.error({ userId }, 'User profile not found for export');
        return { success: false, error: 'User profile not found' };
      }

      const profile = profileResult.data;

      // Build the export data
      const exportData: UserDataExport = {
        exportInfo: {
          exportedAt: new Date().toISOString(),
          userId,
          formatVersion: '1.0',
        },
        profile: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          role: profile.role,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          isFirstLogin: profile.is_first_login,
        },
        preferences: preferencesResult.success
          ? {
              language: preferencesResult.data.language,
              fontSize: preferencesResult.data.fontSize,
              systemFont: preferencesResult.data.systemFont,
            }
          : {
              language: 'en',
              fontSize: 'medium',
              systemFont: 'system',
            },
        notificationPreferences: notificationPreferencesResult.success
          ? {
              email: {
                billing: notificationPreferencesResult.data.email_billing,
                marketing: notificationPreferencesResult.data.email_marketing,
                security: notificationPreferencesResult.data.email_security,
                social: notificationPreferencesResult.data.email_social,
                updates: notificationPreferencesResult.data.email_updates,
                weeklyDigest: notificationPreferencesResult.data.email_weekly_digest,
              },
              push: {
                comments: notificationPreferencesResult.data.push_comments,
                likes: notificationPreferencesResult.data.push_likes,
                mentions: notificationPreferencesResult.data.push_mentions,
                security: notificationPreferencesResult.data.push_security,
                updates: notificationPreferencesResult.data.push_updates,
              },
              createdAt: notificationPreferencesResult.data.created_at,
              updatedAt: notificationPreferencesResult.data.updated_at,
            }
          : {
              email: {
                billing: true,
                marketing: false,
                security: true,
                social: true,
                updates: true,
                weeklyDigest: false,
              },
              push: {
                comments: true,
                likes: true,
                mentions: true,
                security: true,
                updates: true,
              },
              createdAt: null,
              updatedAt: null,
            },
        subscription:
          subscriptionResult.success && subscriptionResult.data
            ? {
                id: subscriptionResult.data.id,
                planType: subscriptionResult.data.plan_type,
                status: subscriptionResult.data.status,
                stripeCustomerId: subscriptionResult.data.stripe_customer_id,
                stripeSubscriptionId: subscriptionResult.data.stripe_subscription_id,
                stripePriceId: subscriptionResult.data.stripe_price_id,
                currentPeriodStart: subscriptionResult.data.current_period_start,
                currentPeriodEnd: subscriptionResult.data.stripe_current_period_end,
                cancelAtPeriodEnd: subscriptionResult.data.cancel_at_period_end,
                createdAt: subscriptionResult.data.created_at,
                updatedAt: subscriptionResult.data.updated_at,
              }
            : {
                id: null,
                planType: null,
                status: null,
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                stripePriceId: null,
                currentPeriodStart: null,
                currentPeriodEnd: null,
                cancelAtPeriodEnd: null,
                createdAt: null,
                updatedAt: null,
              },
      };

      log.info({ userId }, 'GDPR data export completed successfully');
      return { success: true, data: exportData };
    } catch (error) {
      log.error(error, 'Error during GDPR data export');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get notification preferences for a user
   * Returns default preferences if none exist
   */
  private async getNotificationPreferences(
    userId: string,
  ): Promise<ServiceResult<Database['public']['Tables']['notification_preferences']['Row']>> {
    try {
      const { data, error } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no preferences exist, return default structure
        if (error.code === 'PGRST116') {
          return {
            success: true,
            data: {
              id: '',
              user_id: userId,
              email_billing: true,
              email_marketing: false,
              email_security: true,
              email_social: true,
              email_updates: true,
              email_weekly_digest: false,
              push_comments: true,
              push_likes: true,
              push_mentions: true,
              push_security: true,
              push_updates: true,
              created_at: null,
              updated_at: null,
            },
          };
        }

        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate a filename for the export with timestamp
   */
  static generateExportFilename(): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return `my-data-${timestamp}.json`;
  }

  /**
   * Validate that the export data is complete and properly formatted
   */
  static validateExportData(data: UserDataExport): boolean {
    try {
      // Check required fields
      if (!data.exportInfo?.userId || !data.exportInfo?.exportedAt) {
        return false;
      }

      if (!data.profile?.id || !data.profile?.email) {
        return false;
      }

      // Check that all required sections exist
      if (!data.preferences || !data.notificationPreferences || !data.subscription) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
