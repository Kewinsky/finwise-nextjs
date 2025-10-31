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
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <AreaChart className="h-5 w-5" />
              Balance History
            </CardTitle>
            <CardDescription>Track your balance history over time</CardDescription>
          </div>
          <BalanceHistoryFilters
            accounts={accounts}
            selectedYear={selectedYear}
            selectedAccounts={selectedAccounts}
            years={years}
            onYearChange={setSelectedYear}
            onAccountsChange={setSelectedAccounts}
          />
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
