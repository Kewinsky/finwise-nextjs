'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { SUBSCRIPTION_PLANS, PLAN_LIMITS, type PlanType } from '@/config/app';
import { useState } from 'react';
import { upgradeSubscriptionAction } from '@/lib/actions/billing-actions';
import { notifyError } from '@/lib/notifications';

interface UsageLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryCount: number;
  limit: number;
  currentPlan?: PlanType;
}

export function UsageLimitModal({
  open,
  onOpenChange,
  limit,
  currentPlan = 'free',
}: UsageLimitModalProps) {
  const [isUpgrading, setIsUpgrading] = useState<PlanType | null>(null);

  const handleUpgrade = async (planType: PlanType) => {
    if (planType === 'free') return;

    setIsUpgrading(planType);
    try {
      const result = await upgradeSubscriptionAction(planType);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        notifyError(result.error || 'Failed to create checkout session');
        setIsUpgrading(null);
      }
    } catch {
      notifyError('Unable to start checkout');
      setIsUpgrading(null);
    }
  };

  const getInsightsLevel = (planType: PlanType) => {
    switch (planType) {
      case 'free':
        return 'Basic insights';
      case 'basic':
        return 'Advanced insights';
      case 'pro':
        return 'Premium insights';
    }
  };

  const formatQueries = (queries: number) => {
    if (queries === Infinity) return 'Unlimited';
    return `${queries} queries`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            AI Query Limit Reached
          </DialogTitle>
          <DialogDescription>
            You&apos;ve used all {limit} of your monthly AI queries. Upgrade to continue using AI
            features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Plan */}
          <Card className={currentPlan === 'free' ? 'border-primary' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">
                    Current Plan: {SUBSCRIPTION_PLANS[currentPlan].name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    • {formatQueries(PLAN_LIMITS[currentPlan].aiQueriesPerMonth)}/month
                  </p>
                  <p className="text-sm text-muted-foreground">• {getInsightsLevel(currentPlan)}</p>
                </div>
                {currentPlan === 'free' && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </CardContent>
          </Card>

          {/* Basic Plan */}
          <Card className={currentPlan === 'basic' ? 'border-primary' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">
                    Basic Plan - ${SUBSCRIPTION_PLANS.basic.price}/month
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    • {formatQueries(PLAN_LIMITS.basic.aiQueriesPerMonth)}/month
                  </p>
                  <p className="text-sm text-muted-foreground">• {getInsightsLevel('basic')}</p>
                </div>
                {currentPlan === 'basic' ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade('basic')}
                    disabled={isUpgrading !== null}
                  >
                    {isUpgrading === 'basic' ? 'Upgrading...' : 'Upgrade to Basic'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={currentPlan === 'pro' ? 'border-primary' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">
                    Pro Plan - ${SUBSCRIPTION_PLANS.pro.price}/month
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    • {formatQueries(PLAN_LIMITS.pro.aiQueriesPerMonth)}/month
                  </p>
                  <p className="text-sm text-muted-foreground">• {getInsightsLevel('pro')}</p>
                </div>
                {currentPlan === 'pro' ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade('pro')}
                    disabled={isUpgrading !== null}
                  >
                    {isUpgrading === 'pro' ? 'Upgrading...' : 'Upgrade to Pro'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
