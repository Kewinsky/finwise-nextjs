'use client';

import { useState } from 'react';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { deleteAccount } from '@/lib/actions/auth-actions';
import { exportUserData } from '@/lib/actions/gdpr-actions';
import { GeneralSettingsForm } from '@/components/settings/general/general-settings-form';
import { AccountActionsCard } from '@/components/settings/general/account-actions-card';
import { ExportDataCard } from '@/components/settings/general/export-data-card';
import { SubscriptionBanner } from '@/components/subscription/subscription-banner';
import type { SubscriptionStatusInfo } from '@/types/subscription.types';

/**
 * Client wrapper for settings page
 * Handles user interactions and form submissions
 * This pattern separates server data fetching from client interactions
 */
interface SettingsClientWrapperProps {
  isPasswordAuthenticated: boolean;
  userEmail: string;
  subscriptionInfo: SubscriptionStatusInfo | null;
}

export function SettingsClientWrapper({
  isPasswordAuthenticated,
  userEmail,
  subscriptionInfo,
}: SettingsClientWrapperProps) {
  const [isLoading] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount();

      if (result.success) {
        notifySuccess(result.message || 'Account deletion initiated successfully');
        // The user will be automatically signed out by the deleteAccount action
      } else {
        notifyError(result.error || 'Failed to delete account');
      }
    } catch (error) {
      notifyError('An unexpected error occurred');
      console.error('Delete account error:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const result = await exportUserData();

      if (result.success && result.data && result.filename) {
        // Create a blob and trigger download
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        notifySuccess('Data export completed successfully', {
          description: `Your data has been downloaded as ${result.filename}`,
        });
      } else {
        notifyError(result.error || 'Failed to export data');
      }
    } catch (error) {
      notifyError('An unexpected error occurred during export');
      console.error('Export data error:', error);
    }
  };

  return (
    <>
      <SubscriptionBanner subscriptionInfo={subscriptionInfo} />
      <GeneralSettingsForm
        isLoading={isLoading}
        isPasswordAuthenticated={isPasswordAuthenticated}
      />
      <ExportDataCard onExportData={handleExportData} />
      <AccountActionsCard onDeleteAccount={handleDeleteAccount} userEmail={userEmail} />
    </>
  );
}
