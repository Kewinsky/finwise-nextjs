'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis } from 'recharts';
import { useBalanceHistory } from '@/hooks/use-balance-history';
import { BalanceHistoryFilters } from './balance-history-filters';
import { ErrorState } from '@/components/common/error-state';
import { NoDataState } from '@/components/common/no-data-state';
import type { Account } from '@/types/finance.types';

interface BalanceHistoryChartProps {
  accounts: Account[];
}

export function BalanceHistoryChartComponent({ accounts }: BalanceHistoryChartProps) {
  const {
    selectedAccounts,
    selectedYear,
    isLoading,
    error,
    chartData,
    chartConfig,
    setSelectedAccounts,
    setSelectedYear,
    years,
  } = useBalanceHistory({ accounts });

  if (accounts.length === 0) {
    return null;
  }

  // Check if we have chart data (should always be true since we always have accounts)
  const hasChartData = chartData.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col @lg:flex-row items-stretch @lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2 text-lg @sm:text-xl">
              <AreaChart className="h-4 w-4 @sm:h-5 @sm:w-5" />
              Balance History
            </CardTitle>
            <CardDescription>Track your balance history over time</CardDescription>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner message="Loading chart data..." />
            </div>
          ) : error ? (
            <ErrorState
              title="Failed to load balance history"
              description={error}
              variant="inline"
              className="h-full"
            />
          ) : !hasChartData ? (
            <NoDataState
              icon={AreaChart}
              title="No balance history data available"
              description="Chart will appear once you have transaction data"
              variant="inline"
              height="h-full"
            />
          ) : (
            <div className="overflow-x-auto">
              <ChartContainer config={chartConfig} className="w-full h-full min-w-[600px]">
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  className="w-full h-full"
                  margin={{ top: 16, bottom: 16, left: 32, right: 32 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  {Array.from(selectedAccounts).map((accountId) => {
                    const account = accounts.find((acc) => acc.id === accountId);
                    if (!account) return null;

                    return (
                      <Line
                        key={accountId}
                        dataKey={accountId}
                        type="linear"
                        stroke={`var(--color-${accountId})`}
                        strokeWidth={2}
                        dot={{
                          fill: `var(--color-${accountId})`,
                          strokeWidth: 2,
                          r: 4,
                        }}
                        activeDot={{
                          r: 6,
                          stroke: `var(--color-${accountId})`,
                          strokeWidth: 2,
                        }}
                      />
                    );
                  })}
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
