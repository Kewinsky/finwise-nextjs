import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user.types';

/**
 * Sign in input
 */
export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Magic link input
 */
export interface MagicLinkInput {
  email: string;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'github' | 'google' | 'facebook' | 'twitter';

/**
 * Password reset input
 */
export interface ResetPasswordInput {
  password: string;
}

/**
 * User with profile
 */
export interface UserWithProfile extends SupabaseUser {
  profile: UserProfile;
}

/**
 * Authentication result
 */
export interface AuthResult {
  user: SupabaseUser;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  } | null;
}

/**
 * Authentication method type
 */
export type AuthMethod = 'password' | 'magic_link' | 'social' | 'unknown';

/**
 * OAuth redirect options
 */
export interface OAuthRedirectOptions {
  redirectTo?: string;
}
