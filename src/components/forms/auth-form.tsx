'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Github } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { useRouter, useSearchParams } from 'next/navigation';
import { notifyError } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/form-error';
import { AuthCard } from '@/components/auth/auth-card';
import { signInWithMagicLink, signInWithOAuth } from '@/lib/actions/auth-actions';
import { appConfig } from '@/config/app';
import { magicLinkSchema, type MagicLinkFormData } from '@/validation/auth';

export function AuthForm({ className, ...props }: React.ComponentProps<'div'>) {
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

  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
  });

  const onMagicLinkSubmit = async (data: MagicLinkFormData) => {
    setIsMagicLinkLoading(true);
    setFormError(null);
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
      const result = await signInWithOAuth(
        provider,
        redirectUrl || appConfig.helpers.getAbsoluteUrl('/callback'),
      );

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
    <AuthCard className={className} {...props}>
      {/* Social Auth Section */}
      <div className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          Sign in quickly with your social account
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="w-full transition-all hover:scale-[1.02] hover:shadow-md"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="w-full transition-all hover:scale-[1.02] hover:shadow-md"
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
          We&apos;ll create your account automatically if you don&apos;t have one.
        </div>
      </div>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs text-muted-foreground">
          <span className="bg-background/80 backdrop-blur-sm px-3 text-muted-foreground font-medium">
            Or continue with
          </span>
        </div>
      </div>

      {/* Magic Link Section */}
      <div className="space-y-4">
        <form
          onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              data-testid="auth-email-input"
              {...magicLinkForm.register('email')}
              disabled={isMagicLinkLoading}
            />
            <FormError message={magicLinkForm.formState.errors.email?.message} />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            disabled={isMagicLinkLoading}
            data-testid="auth-magic-link-button"
          >
            {isMagicLinkLoading ? (
              <LoadingSpinner message="Sending magic link..." inline />
            ) : (
              'Send Magic Link'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            We&apos;ll send you a secure link to sign in. No password required.
          </div>

          {/* Form-level error display */}
          <FormError message={formError} />
        </form>
      </div>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 pt-2">
        By signing in, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </AuthCard>
  );
}
