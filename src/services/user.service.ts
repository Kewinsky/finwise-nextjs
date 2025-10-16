import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type {
  UserProfile,
  UpdateProfileInput,
  CreateUserProfileInput,
  UserSearchFilters,
} from '@/types/user.types';
import { log } from '@/lib/logger';

/**
 * UserService handles all user-related business logic
 *
 * Responsibilities:
 * - User profile CRUD operations
 * - User search and filtering
 * - First login tracking
 * - User metadata management
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const userService = new UserService(supabase);
 *
 * const result = await userService.getUserById("user-id");
 * if (result.success) {
 *   console.log(result.data.full_name);
 * }
 * ```
 */
export class UserService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Get user profile by ID (excludes deleted users)
   */
  async getUserById(userId: string): Promise<ServiceResult<UserProfile>> {
    try {
      log.info({ userId }, 'Fetching user profile');

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        log.warn({ userId, error: error.message }, 'User not found');
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'User not found' };
      }

      log.info({ userId }, 'User profile retrieved');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error fetching user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user profile by email (excludes deleted users)
   */
  async getUserByEmail(email: string): Promise<ServiceResult<UserProfile>> {
    try {
      log.info({ email }, 'Fetching user by email');

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

      if (error) {
        log.warn({ email, error: error.message }, 'User not found');
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error fetching user by email');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new user profile
   * Usually called after successful authentication
   */
  async createProfile(input: CreateUserProfileInput): Promise<ServiceResult<UserProfile>> {
    try {
      log.info({ userId: input.id, email: input.email }, 'Creating user profile');

      const profileData = {
        id: input.id,
        email: input.email,
        full_name: input.fullName || null,
        avatar_url: input.avatarUrl || null,
        role: input.role || 'user',
        is_first_login: true,
      };

      const { data, error } = await this.supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        log.error({ userId: input.id, error: error.message }, 'Failed to create profile');
        return { success: false, error: error.message };
      }

      log.info({ userId: input.id }, 'User profile created successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error creating user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<ServiceResult<UserProfile>> {
    try {
      log.info({ userId }, 'Updating user profile');

      // Build update object dynamically to avoid overwriting with undefined
      const updateData: Partial<UserProfile> = {};

      if (input.fullName !== undefined) {
        updateData.full_name = input.fullName;
      }

      if (input.avatarUrl !== undefined) {
        updateData.avatar_url = input.avatarUrl;
      }

      if (input.role !== undefined) {
        updateData.role = input.role;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to update profile');
        return { success: false, error: error.message };
      }

      log.info({ userId }, 'User profile updated successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error updating user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Soft delete user profile (GDPR-compliant)
   * Marks the user as deleted but preserves data for 30 days
   */
  async deleteUser(userId: string): Promise<ServiceResult<void>> {
    try {
      log.info({ userId }, 'Soft deleting user profile');

      const { error } = await this.supabase
        .from('profiles')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to soft delete profile');
        return { success: false, error: error.message };
      }

      log.info({ userId }, 'User profile soft deleted successfully');
      return { success: true, data: undefined };
    } catch (error) {
      log.error(error, 'Error soft deleting user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Hard delete user profile (permanent deletion)
   * Note: This only deletes the profile, not the auth user
   * Should only be used by background cleanup jobs
   */
  async deleteProfile(userId: string): Promise<ServiceResult<void>> {
    try {
      log.info({ userId }, 'Hard deleting user profile');

      const { error } = await this.supabase.from('profiles').delete().eq('id', userId);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to hard delete profile');
        return { success: false, error: error.message };
      }

      log.info({ userId }, 'User profile hard deleted successfully');
      return { success: true, data: undefined };
    } catch (error) {
      log.error(error, 'Error hard deleting user profile');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if this is user's first login and update the flag
   * Returns true if it was the first login
   */
  async checkAndUpdateFirstLogin(userId: string): Promise<boolean> {
    try {
      log.info({ userId }, 'Checking first login status');

      const { data: profile, error: fetchError } = await this.supabase
        .from('profiles')
        .select('is_first_login')
        .eq('id', userId)
        .single();

      if (fetchError || !profile) {
        log.warn({ userId }, 'Could not check first login status');
        return false;
      }

      const isFirstLogin = profile.is_first_login === true;

      // If this is the first login, update the flag
      if (isFirstLogin) {
        const { error: updateError } = await this.supabase
          .from('profiles')
          .update({ is_first_login: false })
          .eq('id', userId);

        if (updateError) {
          log.error({ userId, error: updateError.message }, 'Failed to update first login flag');
        } else {
          log.info({ userId }, 'First login flag updated');
        }
      }

      return isFirstLogin;
    } catch (error) {
      log.error(error, 'Error checking first login');
      return false;
    }
  }

  /**
   * Check if user profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Search users by filters (excludes deleted users)
   */
  async searchUsers(filters: UserSearchFilters, limit = 50): Promise<ServiceResult<UserProfile[]>> {
    try {
      log.info({ filters }, 'Searching users');

      let query = this.supabase.from('profiles').select('*').is('deleted_at', null);

      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.createdAfter) {
        query = query.gte('created_at', filters.createdAfter.toISOString());
      }

      if (filters.createdBefore) {
        query = query.lte('created_at', filters.createdBefore.toISOString());
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        log.error({ error: error.message }, 'Failed to search users');
        return { success: false, error: error.message };
      }

      log.info({ count: data.length }, 'Users search completed');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error searching users');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get multiple users by IDs (excludes deleted users)
   */
  async getUsersByIds(userIds: string[]): Promise<ServiceResult<UserProfile[]>> {
    try {
      if (userIds.length === 0) {
        return { success: true, data: [] };
      }

      log.info({ count: userIds.length }, 'Fetching multiple users');

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
        .is('deleted_at', null);

      if (error) {
        log.error({ error: error.message }, 'Failed to fetch users');
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error fetching multiple users');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update user's last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Count users matching filters (excludes deleted users)
   */
  async countUsers(filters?: UserSearchFilters): Promise<ServiceResult<number>> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (filters?.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.createdAfter) {
        query = query.gte('created_at', filters.createdAfter.toISOString());
      }

      if (filters?.createdBefore) {
        query = query.lte('created_at', filters.createdBefore.toISOString());
      }

      const { count, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: count || 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get users marked for deletion (older than specified days)
   * Used by background cleanup jobs
   */
  async getUsersMarkedForDeletion(daysOld: number = 30): Promise<ServiceResult<UserProfile[]>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      log.info({ cutoffDate, daysOld }, 'Fetching users marked for deletion');

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .not('deleted_at', 'is', null)
        .lt('deleted_at', cutoffDate.toISOString());

      if (error) {
        log.error({ error: error.message }, 'Failed to fetch users marked for deletion');
        return { success: false, error: error.message };
      }

      log.info({ count: data.length }, 'Users marked for deletion retrieved');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error fetching users marked for deletion');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user is deleted
   */
  async isUserDeleted(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('deleted_at')
        .eq('id', userId)
        .single();

      return !error && !!data && data.deleted_at !== null;
    } catch {
      return false;
    }
  }
}
