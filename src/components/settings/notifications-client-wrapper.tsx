'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Smartphone } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { notifySuccess, notifyError } from '@/lib/notifications';
import {
  saveNotificationPreferences,
  resetNotificationPreferencesToDefaults,
} from '@/lib/actions/notification-actions';
import {
  NotificationPreferences,
  defaultNotificationPreferences,
} from '@/types/notification.types';
import { NOTIFICATION_CATEGORIES } from '@/config/app';

/**
 * Client wrapper for notifications page
 * Handles user interactions and form submissions
 * This pattern separates server data fetching from client interactions
 */
interface NotificationsClientWrapperProps {
  preferences: NotificationPreferences;
}

export function NotificationsClientWrapper({
  preferences: initialPreferences,
}: NotificationsClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);

  const handleEmailPreferenceChange = (
    key: keyof NotificationPreferences['email'],
    value: boolean,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value,
      },
    }));
  };

  const handlePushPreferenceChange = (
    key: keyof NotificationPreferences['push'],
    value: boolean,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: value,
      },
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const result = await saveNotificationPreferences(preferences);

      if (result.success) {
        notifySuccess('Notification preferences saved successfully', {
          description: 'Your notification settings have been updated.',
        });
      } else {
        notifyError('Unable to save preferences', {
          description: result.error || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      notifyError('Unable to save preferences', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = async () => {
    try {
      const result = await resetNotificationPreferencesToDefaults();

      if (result.success) {
        setPreferences(defaultNotificationPreferences);
        notifySuccess('Preferences reset to defaults', {
          description: 'Your notification settings have been restored to default values.',
        });
      } else {
        notifyError('Unable to reset preferences', {
          description: result.error || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error resetting notification preferences:', error);
      notifyError('Unable to reset preferences', {
        description: 'Please check your connection and try again.',
      });
    }
  };

  return (
    <div className="space-y-4 @md:space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which email notifications you&apos;d like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 @md:space-y-4">
          {NOTIFICATION_CATEGORIES.email.options.map((option, index) => (
            <div key={option.key}>
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">{option.label}</Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Switch
                  checked={preferences.email[option.key]}
                  onCheckedChange={(checked) => handleEmailPreferenceChange(option.key, checked)}
                />
              </div>
              {index < NOTIFICATION_CATEGORIES.email.options.length - 1 && (
                <Separator className="mt-2 @md:mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Configure mobile and desktop push notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 @md:space-y-4">
          {NOTIFICATION_CATEGORIES.push.options.map((option, index) => (
            <div key={option.key}>
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">{option.label}</Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Switch
                  checked={preferences.push[option.key]}
                  onCheckedChange={(checked) => handlePushPreferenceChange(option.key, checked)}
                />
              </div>
              {index < NOTIFICATION_CATEGORIES.push.options.length - 1 && (
                <Separator className="mt-2 @md:mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col @md:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={handleResetToDefaults}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSavePreferences} disabled={isLoading}>
          {isLoading ? <LoadingSpinner message="Saving..." inline /> : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
