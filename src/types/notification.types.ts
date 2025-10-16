import type { Tables } from '@/types/database.types';
import {
  NOTIFICATION_CATEGORIES,
  type NotificationEmailKey,
  type NotificationPushKey,
} from '@/config/app';

/**
 * Notification preferences row from database
 */
export type NotificationPreferencesRow = Tables<'notification_preferences'>;

/**
 * UI-friendly notification preferences structure
 */
export interface NotificationPreferences {
  email: {
    [K in NotificationEmailKey]: boolean;
  };
  push: {
    [K in NotificationPushKey]: boolean;
  };
}

/**
 * Database format for notification preferences (snake_case)
 */
export interface NotificationPreferencesData {
  email_marketing: boolean;
  email_security: boolean;
  email_updates: boolean;
  email_weekly_digest: boolean;
  email_billing: boolean;
  email_social: boolean;
  push_security: boolean;
  push_updates: boolean;
  push_mentions: boolean;
  push_comments: boolean;
  push_likes: boolean;
}

/**
 * Default notification preferences - generated from centralized config
 */
export const defaultNotificationPreferences: NotificationPreferences = {
  email: Object.fromEntries(
    NOTIFICATION_CATEGORIES.email.options.map((option) => [option.key, option.default]),
  ) as NotificationPreferences['email'],
  push: Object.fromEntries(
    NOTIFICATION_CATEGORIES.push.options.map((option) => [option.key, option.default]),
  ) as NotificationPreferences['push'],
};

/**
 * Transform database row to UI-friendly format
 */
export function transformNotificationPreferences(
  dbRow: NotificationPreferencesRow,
): NotificationPreferences {
  return {
    email: {
      marketing: dbRow.email_marketing,
      security: dbRow.email_security,
      updates: dbRow.email_updates,
      weeklyDigest: dbRow.email_weekly_digest,
      billing: dbRow.email_billing,
      social: dbRow.email_social,
    },
    push: {
      security: dbRow.push_security,
      updates: dbRow.push_updates,
      mentions: dbRow.push_mentions,
      comments: dbRow.push_comments,
      likes: dbRow.push_likes,
    },
  };
}

/**
 * Transform UI format to database format
 */
export function transformToDatabaseFormat(
  preferences: NotificationPreferences,
): NotificationPreferencesData {
  return {
    email_marketing: preferences.email.marketing,
    email_security: preferences.email.security,
    email_updates: preferences.email.updates,
    email_weekly_digest: preferences.email.weeklyDigest,
    email_billing: preferences.email.billing,
    email_social: preferences.email.social,
    push_security: preferences.push.security,
    push_updates: preferences.push.updates,
    push_mentions: preferences.push.mentions,
    push_comments: preferences.push.comments,
    push_likes: preferences.push.likes,
  };
}
