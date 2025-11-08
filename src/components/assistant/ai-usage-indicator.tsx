'use client';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import Link from 'next/link';

interface AIUsageIndicatorProps {
  queryCount?: number;
  limit?: number;
  isLoading?: boolean;
  className?: string;
  tokensUsed?: number;
  resetDate?: Date;
}

export function AIUsageIndicator({
  queryCount = 0,
  limit = 5,
  isLoading = false,
  className,
  tokensUsed = 0,
  resetDate,
}: AIUsageIndicatorProps) {
  const percentage = limit > 0 ? (queryCount / limit) * 100 : 0;
  const isWarning = percentage >= 80 && percentage < 100;
  const isLimitReached = queryCount >= limit;

  const formatResetDate = (date?: Date) => {
    if (!date) return 'Next month';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        size="sm"
        variant="ellipsis"
        message=""
        className={cn('text-xs', className)}
        inline
      />
    );
  }

  const indicatorContent = (
    <span
      className={cn(
        'text-xs font-medium cursor-pointer',
        {
          'text-green-600 dark:text-green-400': percentage < 80,
          'text-yellow-600 dark:text-yellow-400': isWarning,
          'text-red-600 dark:text-red-400': isLimitReached,
        },
        className,
      )}
    >
      [AI: {queryCount}/{limit} queries
      {isWarning && ' ⚠️'}
      {isLimitReached && ' ❌'}]
    </span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{indicatorContent}</TooltipTrigger>
      <TooltipContent className="w-64 p-4" side="bottom">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-2">AI Usage This Month</h4>
            <div className="text-xs mb-2">
              {queryCount} / {limit === Infinity ? 'Unlimited' : limit} queries used
            </div>
            <Progress
              value={Math.min(percentage, 100)}
              indicatorClassName={cn({
                'bg-green-500': percentage < 80,
                'bg-yellow-500': isWarning,
                'bg-red-500': isLimitReached,
              })}
            />
            <div className="text-xs mt-1">{Math.round(percentage)}% used</div>
          </div>
          {tokensUsed > 0 && (
            <div className="text-xs">Total tokens: {tokensUsed.toLocaleString()}</div>
          )}
          <div className="text-xs">Resets: {formatResetDate(resetDate)}</div>
          {isLimitReached && (
            <Button asChild size="sm" variant="secondary" className="w-full mt-2">
              <Link href="/settings/usage">View Details</Link>
            </Button>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
