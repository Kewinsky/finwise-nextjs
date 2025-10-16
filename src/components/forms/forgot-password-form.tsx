'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GalleryVerticalEnd, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import Link from 'next/link';
import { notifyError } from '@/lib/notifications';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/form-error';
import { forgotPassword } from '@/lib/actions/auth-actions';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/auth';
import { MessageComponent } from '@/components/common/message-component';

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', data.email);

      const result = await forgotPassword(formData);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        notifyError('Unable to send reset link', {
          description: result.error || 'Please check your email address and try again.',
        });
      }
    } catch {
      notifyError('Unable to send reset link', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <MessageComponent
          type="email-sent"
          title="Check your email"
          description="We've sent you a password reset link"
          additionalActions={
            <>
              <div className="text-center text-sm text-muted-foreground -mt-4 mb-2">
                If you don&apos;t see the email, check your spam folder or try again.
              </div>
              <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
                Try again
              </Button>
              <Button variant="link" asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Link>
              </Button>
            </>
          }
        />
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
        <h1 className="text-xl font-bold">Forgot your password?</h1>
        <div className="text-center text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a reset link
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...form.register('email')}
            disabled={isLoading}
          />
          <FormError message={form.formState.errors.email?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <LoadingSpinner message="Sending..." inline /> : 'Send reset link'}
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
