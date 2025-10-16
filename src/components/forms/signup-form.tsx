'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GalleryVerticalEnd, Github, UserPlus, Mail } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notifyError } from '@/lib/notifications';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormError } from '@/components/ui/form-error';
import { signUpWithEmail, signInWithOAuth } from '@/lib/actions/auth-actions';
import { signUpSchema, type SignUpFormData } from '@/schemas/auth';

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setFormError(null); // Clear any previous form errors
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('fullName', data.fullName);

      const result = await signUpWithEmail(formData);

      if (result.success) {
        router.push('/email-sent');
      } else {
        // Check if it's an "already registered" error
        if (
          result.error?.includes('already registered') ||
          result.error?.includes('already exists')
        ) {
          setFormError('This email is already associated with an account.');
          notifyError('Email address already registered', {
            description:
              'This email is already associated with an account. Please sign in or use a different email address.',
            action: {
              label: 'Sign In',
              onClick: () => {
                router.push('/login');
              },
            },
            duration: 6000,
          });
        } else {
          setFormError(result.error || 'Please check your information and try again.');
          notifyError('Account creation failed', {
            description:
              result.error ||
              'We encountered an issue creating your account. Please check your information and try again.',
          });
        }
        setIsLoading(false);
      }
    } catch {
      setFormError('Please check your connection and try again.');
      notifyError('Account creation failed', {
        description: 'We encountered a network issue. Please check your connection and try again.',
      });
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      // Don't show error for redirects (successful OAuth)
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return; // Let the redirect happen
      }
      notifyError('Unable to sign up with OAuth', {
        description: 'Please try again or use email signup.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <span className="sr-only">Acme Inc.</span>
        </a>
        <h1 className="text-xl font-bold">Create your account</h1>
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>

      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid w-full grid-cols-2 my-6">
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="oauth" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                {...form.register('fullName')}
                disabled={isLoading}
              />
              <FormError message={form.formState.errors.fullName?.message} />
            </div>

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

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                disabled={isLoading}
              />
              <FormError message={form.formState.errors.password?.message} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
                disabled={isLoading}
              />
              <FormError message={form.formState.errors.confirmPassword?.message} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <LoadingSpinner message="Creating account..." inline />
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Form-level error display */}
            <FormError message={formError} />
          </form>
        </TabsContent>

        <TabsContent value="oauth" className="space-y-6">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Sign up quickly with your social account
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            We&apos;ll create your account automatically when you sign in.
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By creating an account, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
