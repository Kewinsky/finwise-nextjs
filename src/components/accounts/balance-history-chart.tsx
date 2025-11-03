'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart } from 'lucide-react';
import { useBalanceHistory } from '@/hooks/use-balance-history';
import { BalanceHistoryFilters } from './balance-history-filters';
import { BalanceHistoryChartContent } from './balance-history-chart-content';
import type { Account } from '@/types/finance.types';

interface BalanceHistoryChartProps {
  accounts: Account[];
}

export function BalanceHistoryChartComponent({ accounts }: BalanceHistoryChartProps) {
  const {
    allBalanceHistory,
    selectedAccounts,
    selectedYear,
    isLoading,
    chartData,
    chartConfig,
    setSelectedAccounts,
    setSelectedYear,
    years,
  } = useBalanceHistory({ accounts });

  if (accounts.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AreaChart className="h-4 w-4 sm:h-5 sm:w-5" />
              Balance History
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track your balance history over time
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <BalanceHistoryFilters
              accounts={accounts}
              selectedYear={selectedYear}
              selectedAccounts={selectedAccounts}
              years={years}
              onYearChange={setSelectedYear}
              onAccountsChange={setSelectedAccounts}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <BalanceHistoryChartContent
            accounts={accounts}
            isLoading={isLoading}
            chartData={chartData}
            chartConfig={chartConfig}
            selectedAccounts={selectedAccounts}
            hasData={allBalanceHistory.length > 0}
          />
        </div>
      </CardContent>
    </Card>
  );
}
