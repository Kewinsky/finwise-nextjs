'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAIUsage } from '@/hooks/use-ai-usage';
import { PLAN_LIMITS, type PlanType } from '@/config/app';
import { Zap, Clock, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UsageClientWrapperProps {
  currentPlanType: PlanType;
}

export function UsageClientWrapper({ currentPlanType }: UsageClientWrapperProps) {
  const { usage } = useAIUsage();

  // Use default values if usage is not available yet (consistent with other wrappers)
  const usageData = usage || {
    queryCount: 0,
    tokensUsed: 0,
    limit: PLAN_LIMITS[currentPlanType].aiQueriesPerMonth,
    percentage: 0,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  };

  const percentage = Math.min(usageData.percentage, 100);
  const limit = PLAN_LIMITS[currentPlanType].aiQueriesPerMonth;
  const formatQueries = (queries: number) => {
    if (queries === Infinity) return 'Unlimited';
    return `${queries} queries`;
  };

  // Calculate reset date (first day of next month)
  const now = new Date();
  const resetDate = usageData.resetDate || new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const formatResetDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate days remaining in month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const daysElapsed = now.getDate();

  // Calculate average usage per day
  const avgQueriesPerDay = daysElapsed > 0 ? (usageData.queryCount / daysElapsed).toFixed(1) : '0';
  const projectedQueries =
    daysElapsed > 0 ? Math.round((usageData.queryCount / daysElapsed) * daysInMonth) : 0;

  // Calculate average tokens per query
  const avgTokensPerQuery =
    usageData.queryCount > 0 ? Math.round(usageData.tokensUsed / usageData.queryCount) : 0;

  // Status indicators
  const isHealthy = percentage < 80;
  const isWarning = percentage >= 80 && percentage < 100;
  const isLimitReached = percentage >= 100;

  const remainingQueries = limit === Infinity ? Infinity : limit - usageData.queryCount;

  return (
    <div className="space-y-4 @md:space-y-6">
      {/* Main Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Usage This Month
          </CardTitle>
          <CardDescription>Track your AI query usage and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 @md:space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {usageData.queryCount} / {formatQueries(limit)} queries used
              </span>
              <Badge variant={isHealthy ? 'default' : isWarning ? 'secondary' : 'destructive'}>
                {Math.round(percentage)}%
              </Badge>
            </div>
            <Progress
              value={percentage}
              className="h-3"
              indicatorClassName={cn({
                'bg-green-500': isHealthy,
                'bg-yellow-500': isWarning,
                'bg-red-500': isLimitReached,
              })}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Resets: {formatResetDate(resetDate)}
              </span>
              {remainingQueries !== Infinity && <span>{remainingQueries} queries remaining</span>}
            </div>
          </div>

          {/* Status Message */}
          {isLimitReached && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-1">Limit Reached</h4>
                  <p className="text-sm text-destructive/80 mb-3">
                    You&apos;ve used all {limit} queries this month. Upgrade your plan to continue
                    using AI features.
                  </p>
                  <Button asChild size="sm" variant="default">
                    <Link href="/settings/billing">Upgrade Plan</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isWarning && !isLimitReached && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                    Approaching Limit
                  </h4>
                  <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mb-3">
                    You&apos;ve used {Math.round(percentage)}% of your monthly quota. Consider
                    upgrading if you need more queries.
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/settings/billing">View Plans</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isHealthy && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">
                    Usage Healthy
                  </h4>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">
                    You&apos;re using your AI queries efficiently. {remainingQueries} queries
                    remaining this month.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Statistics
          </CardTitle>
          <CardDescription>Detailed breakdown of your AI usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-4">
            {/* Average Queries Per Day */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Average Per Day</div>
              <div className="text-lg font-semibold">{avgQueriesPerDay}</div>
              <div className="text-xs text-muted-foreground">queries per day</div>
            </div>

            {/* Projected Usage */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Projected This Month</div>
              <div className="text-lg font-semibold">
                {projectedQueries}
                {limit !== Infinity && (
                  <span className="text-sm font-normal text-muted-foreground"> / {limit}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">queries</div>
            </div>

            {/* Total Tokens */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Tokens</div>
              <div className="text-lg font-semibold">{usageData.tokensUsed.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {avgTokensPerQuery > 0 && `~${avgTokensPerQuery} per query`}
              </div>
            </div>

            {/* Days Remaining */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Days Remaining</div>
              <div className="text-lg font-semibold">{daysRemaining}</div>
              <div className="text-xs text-muted-foreground">until reset</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
