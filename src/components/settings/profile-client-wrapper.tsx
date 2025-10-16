'use client';

import { useState } from 'react';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { updateProfile, getCurrentUser } from '@/lib/actions/auth-actions';
import { ProfileForm } from '@/components/settings/profile/profile-form';
import { ProfileFormData } from '@/schemas/profile';
import { User } from '@/types/user.types';

/**
 * Client wrapper for profile settings page
 * Handles form submissions and user interactions
 * This pattern separates server data fetching from client interactions
 */
interface ProfileClientWrapperProps {
  user: User;
  initialFormData: ProfileFormData;
}

export function ProfileClientWrapper({ user, initialFormData }: ProfileClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      let hasChanges = false;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value);
          hasChanges = true;
        }
      });

      // Check if there are any changes to save
      if (!hasChanges) {
        notifyError('No changes to save', {
          description: 'Please make changes to your profile before saving.',
        });
        setIsLoading(false);
        return;
      }

      const result = await updateProfile(formData);

      if (result.success) {
        notifySuccess('Profile updated successfully', {
          description: 'Your changes have been saved.',
        });
        // Reload user data
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          setCurrentUser(userResult.user);
        }
      } else {
        notifyError('Unable to update profile', {
          description: result.error || 'Please check your information and try again.',
        });
      }
    } catch {
      notifyError('Unable to update profile', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileForm
      initialData={initialFormData}
      isLoading={isLoading}
      onSubmit={onSubmit}
      user={currentUser}
    />
  );
}
