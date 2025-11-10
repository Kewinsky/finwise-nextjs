'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import { useAreaChart, type TimeRange, type SeriesType } from '@/hooks/use-area-chart';
import type { DashboardMetrics } from '@/types/finance.types';
import { ErrorState } from '@/components/common/error-state';
import { NoDataState } from '@/components/common/no-data-state';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialTrendsChartProps {
  dashboardData: DashboardMetrics | null;
}

/**
 * Prepares chart config for AreaChart
 */
function prepareAreaChartConfig(
  series: SeriesType,
): Record<string, { label: string; color: string }> {
  const configs: Record<SeriesType, { label: string; color: string }> = {
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
  };

  return {
    value: configs[series],
  };
}

export const FinancialTrendsChart = React.memo(function FinancialTrendsChart({
  dashboardData,
}: FinancialTrendsChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1M');
  const [selectedSeries, setSelectedSeries] = useState<SeriesType>('balance');

  const {
    data: areaChartData,
    isLoading: isLoadingAreaChart,
    error: areaChartError,
  } = useAreaChart({
    timeRange: selectedTimeRange,
    series: selectedSeries,
    dashboardData,
  });

  const chartConfig = useMemo(() => prepareAreaChartConfig(selectedSeries), [selectedSeries]);
  const chartColor = chartConfig.value.color;

  return (
    <Card>
      <CardHeader className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span className="truncate">Financial Trends</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Track your financial performance over time
            </CardDescription>
          </div>

          {/* Time Range Buttons */}
          <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:shrink-0">
            {(['1W', '1M', '3M', '6M', '1Y'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
                className={`min-w-[44px] text-xs sm:text-sm ${
                  selectedTimeRange === range
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : ''
                }`}
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10 gap-1 sm:gap-0">
            <TabsTrigger value="balance" className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5">
              <span className="truncate">Balance</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5">
              <span className="truncate">Income</span>
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5"
            >
              <span className="truncate">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5">
              <span className="truncate">Savings</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoadingAreaChart ? (
          <Skeleton className="h-[300px] sm:h-[400px] w-full" />
        ) : areaChartError ? (
          <ErrorState
            title="Failed to load chart data"
            description={areaChartError}
            variant="inline"
            className="h-[300px] sm:h-[400px]"
          />
        ) : areaChartData.length === 0 ? (
          <NoDataState
            icon={TrendingUp}
            title="No chart data available"
            description="Chart will appear once you have transaction data for this period"
            variant="inline"
            height="h-[300px] sm:h-[400px]"
          />
        ) : (
          <div className="overflow-x-auto">
            <ChartContainer config={chartConfig} className="w-full h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaChartData}
                  margin={{ top: 16, bottom: 16, left: 16, right: 16 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={selectedTimeRange === '1M' ? 60 : 30}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area
                    dataKey="value"
                    stroke={chartColor}
                    fill={chartColor}
                    fillOpacity={0.3}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
