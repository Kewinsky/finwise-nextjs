import type { Tables } from '@/types/database.types';

/**
 * User profile from database
 */
export type UserProfile = Tables<'profiles'>;

/**
 * Custom User type for application use (unified view)
 */
export type User = {
  id: string;
  email?: string;
  created_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

/**
 * User profile update input
 */
export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  role?: string;
}

/**
 * User profile with computed fields
 */
export interface UserProfileWithMetadata extends UserProfile {
  isNew?: boolean;
  hasCompletedOnboarding?: boolean;
}

/**
 * Create user profile input
 */
export interface CreateUserProfileInput {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
}

/**
 * User search filters
 */
export interface UserSearchFilters {
  email?: string;
  role?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}
