'use client';

import { useState } from 'react';
import { notifyError, notifyInfo } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Calendar,
  Download,
  ExternalLink,
  CheckCircle,
  Crown,
  Zap,
  Star,
} from 'lucide-react';
import {
  createCustomerPortalAction,
  upgradeSubscriptionAction,
} from '@/lib/actions/billing-actions';
import { SUBSCRIPTION_PLANS, type PlanType } from '@/config/app';
import { type User } from '@supabase/supabase-js';
import { type Subscription, type SubscriptionStatusInfo } from '@/types/subscription.types';
import type { PaymentMethod, Invoice } from '@/types/billing.types';
import { SubscriptionBanner } from '@/components/subscription/subscription-banner';

/**
 * Client wrapper for billing page
 * Handles user interactions and form submissions
 * This pattern separates server data fetching from client interactions
 */
interface BillingClientWrapperProps {
  user: User;
  subscription: Subscription | null;
  subscriptionInfo: SubscriptionStatusInfo | null;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  currentPlan: (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];
}

export function BillingClientWrapper({
  user,
  subscription,
  paymentMethods,
  invoices,
  currentPlan,
  subscriptionInfo,
}: BillingClientWrapperProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleUpgrade = async (planName: string) => {
    if (!user) return;

    setIsLoading(planName);
    try {
      const planTypeMap: Record<string, PlanType> = {
        Free: 'free',
        Basic: 'basic',
        Pro: 'pro',
      };

      const planType = planTypeMap[planName];
      if (!planType) {
        notifyError('Invalid plan selected');
        return;
      }

      if (planType === 'free') {
        const result = await createCustomerPortalAction();
        if (result.success && result.data?.url) {
          window.location.href = result.data.url;
        } else {
          notifyError(result.error || 'Failed to access billing portal');
        }
        return;
      }

      // Use upgradeSubscriptionAction for full-price checkout (no trial)
      const result = await upgradeSubscriptionAction(planType);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        notifyError(result.error || 'Failed to create checkout session');
      }
    } catch {
      notifyError('Unable to start checkout');
    } finally {
      setIsLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const result = await createCustomerPortalAction();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        notifyInfo('No subscription yet', {
          description: "You don't have an active subscription. Choose a plan below to get started!",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('customer') || errorMessage.includes('subscription')) {
        notifyInfo('No subscription yet', {
          description: "You don't have an active subscription. Choose a plan below to get started!",
        });
      } else {
        notifyError('Unable to open billing portal');
      }
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'pro':
        return <Crown className="h-5 w-5" />;
      case 'basic':
        return <Zap className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <SubscriptionBanner subscriptionInfo={subscriptionInfo} />

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Manage your current plan and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getPlanIcon(subscription?.plan_type || 'free')}
                <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                <Badge
                  variant="secondary"
                  className={getStatusColor(subscription?.status || 'active')}
                >
                  {subscription?.status || 'Active'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPlan.description || 'Perfect for getting started'}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Next billing:{' '}
                  {subscription?.stripe_current_period_end
                    ? new Date(subscription.stripe_current_period_end).toLocaleDateString()
                    : 'Never'}
                </span>
                <span className="text-lg font-semibold text-foreground">
                  ${currentPlan.price}/{currentPlan.price === 0 ? 'forever' : 'month'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleManageBilling}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 flex-shrink-0" />
            Available Plans
          </CardTitle>
          <CardDescription>Choose the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
              const isCurrentPlan = subscription?.plan_type === key;
              const isPopular = key === 'pro';

              return (
                <div
                  key={key}
                  className={`relative flex flex-col rounded-lg border p-4 sm:p-6 transition-all hover:shadow-md ${
                    isCurrentPlan ? 'border-primary' : 'border-border'
                  }`}
                >
                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Current Plan
                    </Badge>
                  )}

                  <div className="space-y-3 sm:space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(key)}
                      <h3 className="text-lg font-semibold truncate">{plan.name}</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="text-3xl font-bold">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.price === 0 ? 'forever' : 'month'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {plan.description || 'Perfect for getting started'}
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="flex-1 min-w-0">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Only show button if not current plan */}
                  {!isCurrentPlan && (
                    <Button
                      className="w-full mt-4 sm:mt-6"
                      variant={isPopular ? 'default' : 'outline'}
                      disabled={isLoading === plan.name}
                      onClick={() => handleUpgrade(plan.name)}
                    >
                      {isLoading === plan.name ? 'Processing...' : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your payment methods and billing information</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {method.card?.brand?.toUpperCase()} •••• {method.card?.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.card?.exp_month}/{method.card?.exp_year}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment methods on file</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{invoice.description || 'Subscription'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.created * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      ${((invoice.amount_paid || 0) / 100).toFixed(2)}
                    </span>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                    {invoice.invoice_pdf && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No billing history available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
