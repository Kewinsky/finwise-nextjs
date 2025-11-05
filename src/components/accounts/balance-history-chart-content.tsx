'use client';

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
import { useBaseCurrency } from '@/hooks/use-base-currency';
import type { Account } from '@/types/finance.types';

interface BalanceHistoryChartContentProps {
  accounts: Account[];
  isLoading: boolean;
  chartData: Array<Record<string, string | number>>;
  chartConfig: Record<string, { label: string; color: string }>;
  selectedAccounts: Set<string>;
  hasData: boolean;
}

export function BalanceHistoryChartContent({
  accounts,
  isLoading,
  chartData,
  chartConfig,
  selectedAccounts,
  hasData,
}: BalanceHistoryChartContentProps) {
  const baseCurrency = useBaseCurrency();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner message="Loading chart data..." />
      </div>
    );
  }

  if (!hasData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AreaChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No balance history data available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Chart will appear once you have transaction data
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
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
  );
}
