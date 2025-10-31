'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '@/lib/utils';
import type { DashboardMetrics } from '@/types/finance.types';

interface RecentActivityCardProps {
  recentTransactions: DashboardMetrics['recentTransactions'];
}

export function RecentActivityCard({ recentTransactions }: RecentActivityCardProps) {
  const router = useRouter();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return TrendingUp;
      case 'expense':
        return TrendingDown;
      default:
        return ArrowRightLeft;
    }
  };

  const getTransactionStyles = (type: string) => {
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
  };

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
        <div className="space-y-4">
          {recentTransactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);
            const styles = getTransactionStyles(transaction.type);

            return (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full p-2 ${styles.bg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category} • {formatDisplayDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${styles.text}`}>
                  {styles.prefix}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
