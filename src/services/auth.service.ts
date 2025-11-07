import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type {
  SignInInput,
  MagicLinkInput,
  OAuthProvider,
  ResetPasswordInput,
  UserWithProfile,
  AuthResult,
  AuthMethod,
  OAuthRedirectOptions,
} from '@/types/auth.types';
import { log } from '@/lib/logger';

/**
 * AuthService handles authentication business logic
 *
 * Responsibilities:
 * - User signin
 * - OAuth authentication
 * - Magic link authentication
 * - Password reset
 * - Session management
 * - Authentication method detection
 *
 * Note: This service does NOT handle:
 * - Rate limiting (should be done in server actions)
 * - Redirects (should be done in server actions)
 * - Form data parsing (should be done in server actions)
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const authService = new AuthService(supabase);
 *
 * const result = await authService.signIn({
 *   email: "user@example.com",
 *   password: "password123"
 * });
 *
 * if (result.success) {
 *   console.log("User signed in:", result.data.user.id);
 * }
 * ```
 */
export class AuthService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Sign in user with email and password
   */
  async signIn(input: SignInInput): Promise<ServiceResult<AuthResult>> {
    try {
      log.info({ email: input.email }, 'User signin attempt');

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        log.warn({ email: input.email, error: error.message }, 'Signin failed');
        return { success: false, error: error.message };
      }

      log.info({ userId: data.user?.id }, 'User signin successful');

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      };
    } catch (error) {
      log.error(error, 'Signin error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send magic link for passwordless authentication
   */
  async sendMagicLink(input: MagicLinkInput, redirectUrl?: string): Promise<ServiceResult<void>> {
    try {
      log.info({ email: input.email }, 'Sending magic link');

      // Create a default name from email
      const defaultName = input.email.split('@')[0];

      const { error } = await this.supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: defaultName,
          },
        },
      });

      if (error) {
        log.warn({ email: input.email, error: error.message }, 'Failed to send magic link');
        return { success: false, error: error.message };
      }

      log.info({ email: input.email }, 'Magic link sent successfully');
      return { success: true };
    } catch (error) {
      log.error(error, 'Magic link error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Initiate OAuth authentication
   * Returns the OAuth redirect URL
   */
  async signInWithOAuth(
    provider: OAuthProvider,
    options?: OAuthRedirectOptions,
  ): Promise<ServiceResult<string>> {
    try {
      log.info({ provider }, 'Initiating OAuth signin');

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: options?.redirectTo,
        },
      });

      if (error) {
        log.warn({ provider, error: error.message }, 'OAuth signin failed');
        return { success: false, error: error.message };
      }

      if (!data.url) {
        return { success: false, error: 'Failed to get OAuth URL' };
      }

      log.info({ provider }, 'OAuth URL generated');
      return { success: true, data: data.url };
    } catch (error) {
      log.error(error, 'OAuth error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<ServiceResult<void>> {
    try {
      log.info('User signout attempt');

      const { error } = await this.supabase.auth.signOut();

      if (error) {
        log.warn({ error: error.message }, 'Signout failed');
        return { success: false, error: error.message };
      }

      log.info('User signout successful');
      return { success: true };
    } catch (error) {
      log.error(error, 'Signout error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, redirectUrl?: string): Promise<ServiceResult<void>> {
    try {
      log.info({ email }, 'Sending password reset email');

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        log.warn({ email, error: error.message }, 'Failed to send password reset email');
        return { success: false, error: error.message };
      }

      log.info({ email }, 'Password reset email sent');
      return { success: true };
    } catch (error) {
      log.error(error, 'Password reset error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reset password (must be called with valid session)
   */
  async resetPassword(input: ResetPasswordInput): Promise<ServiceResult<void>> {
    try {
      log.info('Resetting password');

      const { error } = await this.supabase.auth.updateUser({
        password: input.password,
      });

      if (error) {
        log.warn({ error: error.message }, 'Failed to reset password');
        return { success: false, error: error.message };
      }

      log.info('Password reset successful');
      return { success: true };
    } catch (error) {
      log.error(error, 'Password reset error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ServiceResult<AuthResult>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error || !user) {
        return { success: false, error: error?.message || 'User not found' };
      }

      return {
        success: true,
        data: {
          user,
          session: null,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get current user with profile
   */
  async getCurrentUserWithProfile(): Promise<ServiceResult<UserWithProfile>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error || !user) {
        return { success: false, error: error?.message || 'User not found' };
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: profileError?.message || 'Profile not found',
        };
      }

      return {
        success: true,
        data: {
          ...user,
          profile,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get authentication method for current user
   */
  async getAuthenticationMethod(): Promise<ServiceResult<AuthMethod>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const providers = user.app_metadata?.providers || [];
      const lastSignInMethod = user.app_metadata?.last_sign_in_provider;

      // Check for OAuth providers
      const oauthProviders = ['github', 'google', 'facebook', 'twitter', 'discord'];
      const hasOAuthProvider = providers.some((provider: string) =>
        oauthProviders.includes(provider),
      );

      if (hasOAuthProvider && lastSignInMethod && oauthProviders.includes(lastSignInMethod)) {
        return { success: true, data: 'social' };
      }

      // Check for email authentication
      if (lastSignInMethod === 'email') {
        return { success: true, data: 'password' };
      }

      return { success: true, data: 'unknown' };
    } catch (error) {
      log.error(error, 'Error getting authentication method');
      return { success: false, error: 'Failed to get authentication method' };
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<ServiceResult<AuthResult>> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error || !data.user) {
        return {
          success: false,
          error: error?.message || 'Session refresh failed',
        };
      }

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session
            ? {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
              }
            : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify if user's email is confirmed
   */
  async isEmailConfirmed(userId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user || user.id !== userId) {
        return false;
      }

      return !!user.email_confirmed_at;
    } catch {
      return false;
    }
  }
}
