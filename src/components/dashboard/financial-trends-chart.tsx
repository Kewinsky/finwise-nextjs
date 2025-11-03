'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { SimpleChartTooltip } from '@/components/charts/simple-chart-tooltip';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { TrendingUp } from 'lucide-react';
import { useAreaChart, type TimeRange, type SeriesType } from '@/hooks/use-area-chart';
import { useBaseCurrency } from '@/hooks/use-base-currency';
import type { DashboardMetrics } from '@/types/finance.types';

interface FinancialTrendsChartProps {
  dashboardData: DashboardMetrics | null;
}

const chartConfig = {
  income: {
    label: 'Income',
    color: 'var(--success)',
  },
  expenses: {
    label: 'Expenses',
    color: 'var(--destructive)',
  },
  balance: {
    label: 'Balance',
    color: 'var(--blue)',
  },
  savings: {
    label: 'Savings',
    color: 'var(--purple)',
  },
  value: {
    label: 'Value',
    color: 'var(--primary)',
  },
};

export function FinancialTrendsChart({ dashboardData }: FinancialTrendsChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1M');
  const [selectedSeries, setSelectedSeries] = useState<SeriesType>('balance');
  const baseCurrency = useBaseCurrency();

  const { data: areaChartData, isLoading: isLoadingAreaChart } = useAreaChart({
    timeRange: selectedTimeRange,
    series: selectedSeries,
    dashboardData,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Financial Trends
            </CardTitle>
            <CardDescription>Track your financial performance over time</CardDescription>
          </div>

          {/* Time Range Buttons */}
          <div className="flex gap-2">
            {(['1W', '1M', '3M', '6M', '1Y'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
                className="min-w-[40px]"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Series Tabs */}
        <Tabs
          value={selectedSeries}
          onValueChange={(value) => setSelectedSeries(value as SeriesType)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="balance">Total Balance</TabsTrigger>
            <TabsTrigger value="income">Incomes</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoadingAreaChart ? (
          <div className="flex items-center justify-center h-[400px]">
            <LoadingSpinner message="Loading chart data..." />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <AreaChart
              accessibilityLayer
              data={areaChartData}
              margin={{ top: 16, bottom: 16, left: 32, right: 32 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={selectedTimeRange === '1M' ? 100 : 50}
                interval={selectedTimeRange === '1M' ? Math.floor(areaChartData.length / 15) : 0}
              />
              <ChartTooltip
                cursor={false}
                content={<SimpleChartTooltip labelKey="label" currency={baseCurrency} />}
              />
              <Area
                dataKey="value"
                stroke={`var(--color-${selectedSeries})`}
                fill={`var(--color-${selectedSeries})`}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
