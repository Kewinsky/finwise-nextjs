'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDisplayDate, capitalizeFirst } from '@/lib/utils';
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
            bg: 'bg-green-50 dark:bg-green-950/40 border border-green-200/50 dark:border-green-800/30 text-green-700 dark:text-green-300',
            text: 'text-green-600 dark:text-green-400',
            prefix: '+',
          };
        case 'expense':
          return {
            bg: 'bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-800/30 text-red-700 dark:text-red-300',
            text: 'text-red-600 dark:text-red-400',
            prefix: '-',
          };
        default:
          return {
            bg: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/30 text-blue-700 dark:text-blue-300',
            text: 'text-blue-600 dark:text-blue-400',
            prefix: '',
          };
      }
    },
    [],
  );

  return (
    <Card className="flex flex-col h-full">
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
      <CardContent className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-b border-border/50 last:border-0"
              >
                <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-4 sm:h-5 w-3/4" />
                  <Skeleton className="h-3 sm:h-4 w-1/2" />
                </div>
                <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 shrink-0" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load recent activity"
            description={error}
            variant="inline"
            className="h-full min-h-[250px] @sm:min-h-[300px]"
          />
        ) : recentTransactions.length === 0 ? (
          <NoDataState
            icon={ArrowRightLeft}
            title="No recent transactions"
            description="Start tracking your finances by adding your first transaction"
            variant="inline"
            height="h-full min-h-[250px] @sm:min-h-[300px]"
          />
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <div className="space-y-0">
              {recentTransactions.map((transaction, index) => {
                const Icon = getTransactionIcon(transaction.type);
                const styles = getTransactionStyles(transaction.type);
                const isLast = index === recentTransactions.length - 1;

                return (
                  <div
                    key={transaction.id}
                    className="group relative flex items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4 transition-colors hover:bg-muted/50 rounded-lg -mx-2 px-2"
                  >
                    {/* Separator line */}
                    {!isLast && (
                      <div className="absolute bottom-0 left-2 right-2 h-px bg-border/50" />
                    )}

                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      {/* Icon with better styling */}
                      <div
                        className={`rounded-xl p-2.5 sm:p-3 ${styles.bg} flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      {/* Transaction details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm sm:text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="font-medium">
                            {capitalizeFirst(transaction.category)}
                          </span>
                          <span className="text-muted-foreground/60">•</span>
                          <span>{formatDisplayDate(transaction.date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount with better styling */}
                    <div className={`text-sm sm:text-base shrink-0 ${styles.text} tabular-nums`}>
                      {styles.prefix}
                      {formatCurrency(transaction.amount, baseCurrency)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
