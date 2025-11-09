'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { Clock, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  createCustomerPortalAction,
  upgradeSubscriptionAction,
  startTrialAction,
} from '@/lib/actions/billing-actions';
import type { SubscriptionStatusInfo } from '@/types/subscription.types';

interface SubscriptionBannerProps {
  subscriptionInfo: SubscriptionStatusInfo | null;
  onStartTrial?: () => void;
  onManageBilling?: () => void;
}

export function SubscriptionBanner({
  subscriptionInfo,
  onStartTrial,
  onManageBilling,
}: SubscriptionBannerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<'basic' | 'pro' | null>(null);

  // Don't render if no subscription info provided
  if (!subscriptionInfo) {
    return null;
  }

  // Don't render if no banner should be shown
  if (!subscriptionInfo.bannerType || !subscriptionInfo.bannerMessage) {
    return null;
  }

  const handleStartTrial = async () => {
    if (onStartTrial) {
      onStartTrial();
      return;
    }

    setIsLoading(true);
    try {
      // Use startTrialAction which properly checks if user has already used trial
      const result = await startTrialAction('basic');

      if (result.success && result.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = result.data.url;
      } else {
        console.error('Failed to start trial:', result.error);
        // If trial already used, redirect to pricing page for full subscription
        router.push('/pricing');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      router.push('/pricing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (onManageBilling) {
      onManageBilling();
      return;
    }

    setIsLoading(true);
    try {
      // Create customer portal session
      const result = await createCustomerPortalAction();

      if (result.success && result.data?.url) {
        // Redirect to Stripe customer portal
        window.location.href = result.data.url;
      } else {
        console.error('Failed to create customer portal session:', result.error);
        router.push('/settings/billing');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      router.push('/settings/billing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeToPlan = async (planType: 'basic' | 'pro') => {
    setUpgradeLoading(planType);
    try {
      // Use upgrade action for full price checkout (no trial)
      const result = await upgradeSubscriptionAction(planType);

      if (result.success && result.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = result.data.url;
      } else {
        console.error('Failed to create upgrade checkout session:', result.error);
        router.push('/pricing');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      router.push('/pricing');
    } finally {
      setUpgradeLoading(null);
    }
  };

  const getBannerStyles = () => {
    switch (subscriptionInfo.bannerType) {
      case 'start_trial':
        return {
          className: 'border-blue-600 dark:border-purple-500 bg-blue-50 dark:bg-blue-950/20',
          titleColor: '',
          iconColor: '',
        };
      case 'trial_countdown':
        // Use destructive styling for last day of trial
        const isLastDay = subscriptionInfo.trialDaysLeft === 1;
        return {
          className: isLastDay
            ? 'border-destructive bg-destructive/5'
            : 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
          titleColor: '',
          iconColor: isLastDay ? 'text-destructive' : 'text-orange-600 dark:text-orange-400',
        };
      case 'payment_issue':
        return {
          className: 'border-destructive bg-destructive/5',
          titleColor: '',
          iconColor: 'text-destructive',
        };
      case 'canceled_ends_soon':
        return {
          className: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
          titleColor: '',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
        };
      default:
        return {
          className: '',
          titleColor: '',
          iconColor: '',
        };
    }
  };

  const getBannerIcon = () => {
    const styles = getBannerStyles();
    switch (subscriptionInfo.bannerType) {
      case 'start_trial':
        return <Sparkles className="h-5 w-5 text-blue-600 dark:text-purple-500 mt-0.5" />;
      case 'trial_countdown':
        // Use AlertTriangle for last day, Clock for other days
        const isLastDay = subscriptionInfo.trialDaysLeft === 1;
        return isLastDay ? (
          <AlertTriangle className={`h-5 w-5 ${styles.iconColor} mt-0.5`} />
        ) : (
          <Clock className={`h-5 w-5 ${styles.iconColor} mt-0.5`} />
        );
      case 'payment_issue':
        return <AlertTriangle className={`h-5 w-5 ${styles.iconColor} mt-0.5`} />;
      case 'canceled_ends_soon':
        return <AlertCircle className={`h-5 w-5 ${styles.iconColor} mt-0.5`} />;
      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (subscriptionInfo.bannerType) {
      case 'start_trial':
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleStartTrial}
              size="sm"
              variant="default"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <LoadingSpinner message="Starting Trial..." inline />
              ) : (
                'Start Free Trial'
              )}
            </Button>
            <Button onClick={() => router.push('/settings/billing')} size="sm" variant="outline">
              Available Plans
            </Button>
          </div>
        );
      case 'trial_countdown':
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => handleUpgradeToPlan('basic')}
              size="sm"
              variant="outline"
              disabled={upgradeLoading !== null}
            >
              {upgradeLoading === 'basic' ? (
                <LoadingSpinner message="Upgrading..." inline />
              ) : (
                'Upgrade to Basic'
              )}
            </Button>
            <Button
              onClick={() => handleUpgradeToPlan('pro')}
              size="sm"
              variant="default"
              disabled={upgradeLoading !== null}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {upgradeLoading === 'pro' ? (
                <LoadingSpinner message="Upgrading..." inline />
              ) : (
                'Upgrade to Pro'
              )}
            </Button>
          </div>
        );
      case 'payment_issue':
        return (
          <Button
            onClick={handleManageBilling}
            size="sm"
            variant="destructive"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner message="Opening Portal..." inline />
            ) : (
              'Update Payment Method'
            )}
          </Button>
        );
      case 'canceled_ends_soon':
        return (
          <Button
            onClick={handleStartTrial}
            size="sm"
            variant="default"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isLoading ? (
              <LoadingSpinner message="Reactivating..." inline />
            ) : (
              'Reactivate Subscription'
            )}
          </Button>
        );
      default:
        return null;
    }
  };

  const styles = getBannerStyles();
  const getBannerTitle = () => {
    switch (subscriptionInfo.bannerType) {
      case 'start_trial':
        return 'You are currently on the free plan';
      case 'trial_countdown':
        const isLastDay = subscriptionInfo.trialDaysLeft === 1;
        return isLastDay
          ? 'Trial ends today!'
          : `Your trial ends in ${subscriptionInfo.trialDaysLeft} ${subscriptionInfo.trialDaysLeft === 1 ? 'day' : 'days'}`;
      case 'payment_issue':
        return 'Payment Failed';
      case 'canceled_ends_soon':
        return 'Subscription scheduled for cancellation';
      default:
        return 'Subscription Status';
    }
  };

  const getBannerDescription = () => {
    switch (subscriptionInfo.bannerType) {
      case 'start_trial':
        return (
          <>
            Start your free trial or upgrade to unlock advanced financial insights and higher
            transaction limits. Learn more{' '}
            <a className="underline" href="/pricing">
              here
            </a>
            .
          </>
        );
      case 'trial_countdown':
        const isLastDay = subscriptionInfo.trialDaysLeft === 1;
        return isLastDay
          ? 'Your trial ends today! Upgrade immediately to avoid losing access to premium features.'
          : 'Upgrade now to continue enjoying all features after your trial ends. No interruption to your service.';
      case 'payment_issue':
        return "We couldn't process your payment. Please update your payment method to avoid service interruption. An email has been sent with further instructions.";
      case 'canceled_ends_soon':
        return `Your subscription will end on ${
          subscriptionInfo.currentPeriodEnd
            ? new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()
            : 'the end of your billing period'
        }. You can reactivate anytime before then.`;
      default:
        return subscriptionInfo.bannerMessage;
    }
  };

  return (
    <Card className={styles.className}>
      <CardHeader>
        <div className="flex items-start gap-3">
          {getBannerIcon()}
          <div className="flex-1">
            <CardTitle className="text-base">{getBannerTitle()}</CardTitle>
            <CardDescription>{getBannerDescription()}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-end gap-2">
        {getActionButton()}
      </CardContent>
    </Card>
  );
}
