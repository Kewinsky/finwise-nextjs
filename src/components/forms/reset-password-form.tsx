'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GalleryVerticalEnd, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notifySuccess, notifyError } from '@/lib/notifications';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/form-error';
import { resetPassword } from '@/lib/actions/auth-actions';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/validation/auth';
import { createClientForBrowser } from '@/utils/supabase/client';

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Check if we have a valid authenticated session
    // The user should be logged in after clicking the reset link and going through callback
    const checkSession = async () => {
      try {
        const supabase = createClientForBrowser();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsValidSession(true);
        } else {
          notifyError('Invalid or expired reset link', {
            description: 'Please request a new password reset link.',
          });
          router.push('/forgot-password');
        }
      } catch {
        notifyError('Unable to verify reset link', {
          description: 'Please try requesting a new password reset link.',
        });
        router.push('/forgot-password');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);

      const result = await resetPassword(formData);

      if (result.success) {
        notifySuccess('Password updated successfully', {
          description: 'Please sign in with your new password.',
        });

        // Sign out the user so they can log in with the new password
        const supabase = createClientForBrowser();
        await supabase.auth.signOut();

        router.push('/login');
      } else {
        notifyError('Unable to update password', {
          description: result.error || 'Please try again or request a new reset link.',
        });
      }
    } catch {
      notifyError('Unable to update password', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession || !isValidSession) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <div className="text-center">
          <p className="text-muted-foreground">
            {isCheckingSession ? 'Validating reset link...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <span className="sr-only">Acme Inc.</span>
        </a>
        <h1 className="text-xl font-bold">Reset your password</h1>
        <div className="text-center text-sm text-muted-foreground">
          Enter your new password below
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid gap-3">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            {...form.register('password')}
            disabled={isLoading}
          />
          <FormError message={form.formState.errors.password?.message} />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...form.register('confirmPassword')}
            disabled={isLoading}
          />
          <FormError message={form.formState.errors.confirmPassword?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <LoadingSpinner message="Updating..." inline /> : 'Update password'}
        </Button>
      </form>

      <div className="text-center">
        <Button variant="link" asChild className="p-0 h-auto">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    </div>
  );
}
