'use server';

import { createClientForServer } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '@/validation/auth';
import { checkAuthRateLimit } from '@/lib/ratelimit/rate-limit-utils';
import { AuthService, UserService } from '@/services';
import { ERROR_MESSAGES } from '@/lib/constants/errors';
import { handleActionError, handleValidationError } from '@/lib/utils/error-handler';

const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/callback?next=/dashboard`;

// Rate limiting is now handled by the consolidated utility

/**
 * Sign in with email and password
 */
export async function signInWithEmail(formData: FormData) {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkAuthRateLimit('signin');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many login attempts. Please wait 15 minutes before trying again.',
      };
    }

    // Parse and validate input (server action responsibility)
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validatedData = signInSchema.parse(rawData);

    // Get redirect and plan parameters
    const redirectParam = formData.get('redirect') as string;
    const planParam = formData.get('plan') as string;

    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const authService = new AuthService(supabase);
    const userService = new UserService(supabase);

    const result = await authService.signIn({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Check if this is the user's first login (business logic in service)
    if (result.data.user?.id) {
      const isFirstLogin = await userService.checkAndUpdateFirstLogin(result.data.user.id);

      // Determine redirect URL based on parameters
      let redirectUrl = '/dashboard';

      if (redirectParam) {
        redirectUrl = redirectParam;
      } else if (planParam) {
        // If plan is specified, redirect to pricing page to handle the plan selection
        redirectUrl = `/pricing?plan=${planParam}`;
      }

      if (isFirstLogin) {
        redirect(`${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}welcome=true`);
      } else {
        redirect(redirectUrl);
      }
    }

    // Fallback redirect
    redirect('/dashboard');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, 'signin', {
        validationErrors: JSON.stringify(error.issues),
      });
    }
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    return handleActionError(error, 'signin');
  }
}

/**
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(formData: FormData) {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkAuthRateLimit('magic');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many magic link requests. Please wait 15 minutes before trying again.',
      };
    }

    // Parse and validate input (server action responsibility)
    const email = formData.get('email') as string;

    if (!email || !z.string().email().safeParse(email).success) {
      return { success: false, error: ERROR_MESSAGES.VALIDATION };
    }

    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const authService = new AuthService(supabase);

    const result = await authService.sendMagicLink({ email }, redirectUrl);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      message: 'Check your email for the magic link!',
    };
  } catch (error) {
    return handleActionError(error, 'magic-link');
  }
}

/**
 * Sign in with OAuth provider (GitHub, Google)
 */
export async function signInWithOAuth(provider: 'github' | 'google', redirectUrl?: string) {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkAuthRateLimit('oauth');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many OAuth signin attempts. Please wait 15 minutes before trying again.',
      };
    }

    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const authService = new AuthService(supabase);

    const result = await authService.signInWithOAuth(provider, {
      redirectTo: redirectUrl,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      redirect(result.data);
    }

    return { success: false, error: ERROR_MESSAGES.UNEXPECTED };
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    return handleActionError(error, 'oauth');
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const authService = new AuthService(supabase);

    const result = await authService.signOut();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    redirect('/login');
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    return handleActionError(error, 'signout');
  }
}

/**
 * Send password reset email
 */
export async function forgotPassword(formData: FormData) {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkAuthRateLimit('reset');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many password reset requests. Please wait 15 minutes before trying again.',
      };
    }

    // Parse and validate input (server action responsibility)
    const rawData = {
      email: formData.get('email') as string,
    };

    const validatedData = forgotPasswordSchema.parse(rawData);

    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const authService = new AuthService(supabase);

    const result = await authService.sendPasswordResetEmail(
      validatedData.email,
      `${process.env.NEXT_PUBLIC_APP_URL}/callback?next=/reset-password`,
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, 'forgot-password', {
        validationErrors: JSON.stringify(error.issues),
      });
    }
    return handleActionError(error, 'forgot-password');
  }
}

/**
 * Reset password with new password
 */
export async function resetPassword(formData: FormData) {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkAuthRateLimit('reset');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many password reset attempts. Please wait 15 minutes before trying again.',
      };
    }

    // Parse and validate input (server action responsibility)
    const rawData = {
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const validatedData = resetPasswordSchema.parse(rawData);

    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const authService = new AuthService(supabase);

    const result = await authService.resetPassword({
      password: validatedData.password,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      message: 'Password updated successfully!',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, 'reset-password', {
        validationErrors: JSON.stringify(error.issues),
      });
    }
    return handleActionError(error, 'reset-password');
  }
}

/**
 * Update user profile information
 */
export async function updateProfile(formData: FormData) {
  try {
    // Parse and validate input (server action responsibility)
    const rawData = {
      fullName: formData.get('fullName') as string,
    };

    const validatedData = updateProfileSchema.parse(rawData);

    // Get current user
    const supabase = await createClientForServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const userService = new UserService(supabase);

    const result = await userService.updateProfile(user.id, {
      fullName: validatedData.fullName,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      message: 'Profile updated successfully!',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, 'update-profile', {
        validationErrors: JSON.stringify(error.issues),
      });
    }
    return handleActionError(error, 'update-profile');
  }
}

/**
 * Get current authenticated user with profile
 */
export async function getCurrentUser() {
  try {
    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const authService = new AuthService(supabase);

    const result = await authService.getCurrentUserWithProfile();

    if (!result.success) {
      return { success: false, user: null };
    }

    return {
      success: true,
      user: result.data,
    };
  } catch (error) {
    return handleActionError(error, 'get-current-user');
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const result = await getCurrentUser();

  if (!result.success || !result.user) {
    redirect('/login');
  }

  return result.user;
}

/**
 * Get authentication method for current user
 */
export async function getAuthenticationMethod() {
  try {
    // Delegate to service (business logic)
    const supabase = await createClientForServer();
    const authService = new AuthService(supabase);

    const result = await authService.getAuthenticationMethod();

    if (!result.success) {
      return { success: false, method: 'unknown' };
    }

    return { success: true, method: result.data };
  } catch (error) {
    return handleActionError(error, 'get-auth-method');
  }
}

/**
 * Delete user account (soft delete)
 */
export async function deleteAccount() {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkAuthRateLimit('signin'); // Use signin rate limit for account deletion
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many deletion attempts. Please wait 15 minutes before trying again.',
      };
    }

    // Get current user
    const supabase = await createClientForServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const userService = new UserService(supabase);

    const result = await userService.deleteUser(user.id);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Sign out the user after successful deletion
    const authService = new AuthService(supabase);
    await authService.signOut();

    return {
      success: true,
      message: 'Account deletion initiated successfully. You will be signed out.',
    };
  } catch (error) {
    return handleActionError(error, 'delete-account');
  }
}
