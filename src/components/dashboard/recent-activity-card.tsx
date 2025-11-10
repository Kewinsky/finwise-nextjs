'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '@/lib/utils';
import { useBaseCurrency } from '@/hooks/use-base-currency';
import { ErrorState } from '@/components/common/error-state';
import { NoDataState } from '@/components/common/no-data-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardMetrics } from '@/types/finance.types';

interface RecentActivityCardProps {
  recentTransactions: DashboardMetrics['recentTransactions'];
  isLoading?: boolean;
  error?: string | null;
}

export const RecentActivityCard = React.memo(function RecentActivityCard({
  recentTransactions,
  isLoading = false,
  error = null,
}: RecentActivityCardProps) {
  const router = useRouter();
  const baseCurrency = useBaseCurrency();

  const getTransactionIcon = useMemo(
    () => (type: string) => {
      switch (type) {
        case 'income':
          return TrendingUp;
        case 'expense':
          return TrendingDown;
        default:
          return ArrowRightLeft;
      }
    },
    [],
  );

  const getTransactionStyles = useMemo(
    () => (type: string) => {
      switch (type) {
        case 'income':
          return {
            bg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            text: 'text-green-600 dark:text-green-400',
            prefix: '+',
          };
        case 'expense':
          return {
            bg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
            text: 'text-red-600 dark:text-red-400',
            prefix: '-',
          };
        default:
          return {
            bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            text: 'text-blue-600 dark:text-blue-400',
            prefix: '',
          };
      }
    },
    [],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/transactions')}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load recent activity"
            description={error}
            variant="inline"
            className="h-[250px] @sm:h-[300px]"
          />
        ) : recentTransactions.length === 0 ? (
          <NoDataState
            icon={ArrowRightLeft}
            title="No recent transactions"
            description="Start tracking your finances by adding your first transaction"
            variant="inline"
            height="h-[250px] @sm:h-[300px]"
          />
        ) : (
          <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto">
            {recentTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);
              const styles = getTransactionStyles(transaction.type);

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-2 sm:gap-3"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className={`rounded-full p-2 ${styles.bg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {transaction.category} • {formatDisplayDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm font-medium shrink-0 ${styles.text}`}>
                    {styles.prefix}
                    {formatCurrency(transaction.amount, baseCurrency)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
