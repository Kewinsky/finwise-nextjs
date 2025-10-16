'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GalleryVerticalEnd, Github, Mail, KeyRound } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { notifyError } from '@/lib/notifications';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormError } from '@/components/ui/form-error';
import { signInWithEmail, signInWithMagicLink, signInWithOAuth } from '@/lib/actions/auth-actions';
import {
  signInSchema,
  magicLinkSchema,
  type SignInFormData,
  type MagicLinkFormData,
} from '@/schemas/auth';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  const loginForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
  });

  const onLoginSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setFormError(null); // Clear any previous form errors
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      // Add redirect URL if present
      if (redirectUrl) {
        formData.append('redirect', redirectUrl);
      }

      const result = await signInWithEmail(formData);

      if (!result.success) {
        // Set form-level error for inline display
        setFormError(result.error || 'Please check your email and password.');
        // Also show toast notification
        notifyError('Unable to sign in', {
          description: result.error || 'Please check your email and password.',
        });
      }
    } catch (error) {
      // Don't show error for redirects (successful login)
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return; // Let the redirect happen
      }
      setFormError('Please check your connection and try again.');
      notifyError('Unable to sign in', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onMagicLinkSubmit = async (data: MagicLinkFormData) => {
    setIsMagicLinkLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', data.email);

      // Add redirect URL if present
      if (redirectUrl) {
        formData.append('redirect', redirectUrl);
      }

      const result = await signInWithMagicLink(formData);

      if (result.success) {
        router.push('/email-sent');
      } else {
        notifyError('Unable to send magic link', {
          description: result.error || 'Please check your email address and try again.',
        });
        setIsMagicLinkLoading(false);
      }
    } catch {
      notifyError('Unable to send magic link', {
        description: 'Please check your connection and try again.',
      });
      setIsMagicLinkLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    try {
      const result = await signInWithOAuth(provider, redirectUrl || undefined);

      // Check if rate limited or other error
      if (result && !result.success) {
        notifyError('Unable to sign in with OAuth', {
          description: result.error || 'Please try again or use email login.',
        });
        setIsLoading(false);
        return;
      }

      // If successful, the function will redirect (throws NEXT_REDIRECT)
    } catch (error) {
      // Don't show error for redirects (successful OAuth)
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return; // Let the redirect happen
      }
      notifyError('Unable to sign in with OAuth', {
        description: 'Please try again or use email login.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Tabs defaultValue="credentials" className="w-full">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </a>
          <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-2 my-6">
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="magic-link" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Magic Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-6">
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...loginForm.register('email')}
                disabled={isLoading}
              />
              <FormError message={loginForm.formState.errors.email?.message} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...loginForm.register('password')}
                disabled={isLoading}
              />
              <FormError message={loginForm.formState.errors.password?.message} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner message="Signing in..." inline /> : 'Sign In'}
            </Button>

            {/* Form-level error display */}
            <FormError message={formError} />
          </form>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot your password?
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="magic-link" className="space-y-6">
          <form
            onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="grid gap-3">
              <Label htmlFor="magic-email">Email</Label>
              <Input
                id="magic-email"
                type="email"
                placeholder="m@example.com"
                {...magicLinkForm.register('email')}
                disabled={isMagicLinkLoading}
              />
              <FormError message={magicLinkForm.formState.errors.email?.message} />
            </div>

            <Button type="submit" className="w-full" disabled={isMagicLinkLoading}>
              {isMagicLinkLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            We&apos;ll send you a secure link to sign in without a password.
          </div>
        </TabsContent>
      </Tabs>

      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-background text-muted-foreground relative z-10 px-2">Or</span>
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

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
