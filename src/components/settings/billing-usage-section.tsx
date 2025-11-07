'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAIUsage } from '@/hooks/use-ai-usage';
import { PLAN_LIMITS, type PlanType } from '@/config/app';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillingUsageSectionProps {
  currentPlanType: PlanType;
}

export function BillingUsageSection({ currentPlanType }: BillingUsageSectionProps) {
  const { usage, isLoading } = useAIUsage();

  if (isLoading || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Usage This Month
          </CardTitle>
          <CardDescription>Loading usage data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const percentage = Math.min(usage.percentage, 100);
  const limit = PLAN_LIMITS[currentPlanType].aiQueriesPerMonth;
  const formatQueries = (queries: number) => {
    if (queries === Infinity) return 'Unlimited';
    return `${queries} queries`;
  };

  // Calculate reset date (first day of next month)
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const formatResetDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Usage This Month
        </CardTitle>
        <CardDescription>Track your AI query usage and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {usage.queryCount} / {formatQueries(limit)} queries used
            </span>
            <Badge
              variant={percentage < 80 ? 'default' : percentage < 100 ? 'secondary' : 'destructive'}
            >
              {Math.round(percentage)}%
            </Badge>
          </div>
          <Progress
            value={percentage}
            className="h-3"
            indicatorClassName={cn({
              'bg-green-500': percentage < 80,
              'bg-yellow-500': percentage >= 80 && percentage < 100,
              'bg-red-500': percentage >= 100,
            })}
          />
        </div>

        {/* Reset Date */}
        <div className="text-sm text-muted-foreground">Resets: {formatResetDate(resetDate)}</div>

        {/* Usage History - Mock for now */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Usage History</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>
              • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Chat
              query ({usage.tokensUsed > 0 ? Math.floor(usage.tokensUsed / usage.queryCount) : 150}{' '}
              tokens)
            </div>
            {usage.queryCount > 1 && (
              <div>
                •{' '}
                {new Date(Date.now() - 86400000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                - Insights generation (
                {usage.tokensUsed > 0 ? Math.floor(usage.tokensUsed / usage.queryCount) : 320}{' '}
                tokens)
              </div>
            )}
            {usage.queryCount > 2 && (
              <div>
                •{' '}
                {new Date(Date.now() - 172800000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                - Chat query (
                {usage.tokensUsed > 0 ? Math.floor(usage.tokensUsed / usage.queryCount) : 180}{' '}
                tokens)
              </div>
            )}
          </div>
          {usage.tokensUsed > 0 && (
            <div className="text-sm font-medium mt-2">
              Total tokens: {usage.tokensUsed.toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
