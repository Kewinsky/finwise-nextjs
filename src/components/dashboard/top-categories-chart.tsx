'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, CartesianGrid, XAxis, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart3 } from 'lucide-react';
import type { CategorySpending } from '@/hooks/use-category-spending';
import { ErrorState } from '@/components/common/error-state';
import { NoDataState } from '@/components/common/no-data-state';
import { Skeleton } from '@/components/ui/skeleton';

interface TopCategoriesChartProps {
  categorySpending: CategorySpending[];
  isLoading?: boolean;
  error?: string | null;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

/**
 * Prepares chart data and config for BarChart
 * Each category is a separate data point on the X-axis
 */
function prepareBarChartData(
  categorySpending: CategorySpending[],
  colors: string[],
): {
  chartData: Array<{ name: string; value: number; fill: string }>;
  chartConfig: Record<string, { label: string; color: string }>;
} {
  const topCategories = categorySpending.slice(0, 5);

  if (topCategories.length === 0) {
    return {
      chartData: [],
      chartConfig: {},
    };
  }

  const chartData = topCategories.map((category, index) => ({
    name: category.category,
    value: category.amount,
    fill: colors[index % colors.length],
  }));

  // Create config for each category name to show in tooltip
  const chartConfig: Record<string, { label: string; color: string }> = {
    value: {
      label: 'Amount',
      color: '#3b82f6',
    },
  };

  chartData.forEach((item) => {
    chartConfig[item.name] = {
      label: item.name,
      color: item.fill,
    };
  });

  return {
    chartData,
    chartConfig,
  };
}

export const TopCategoriesChart = React.memo(function TopCategoriesChart({
  categorySpending,
  isLoading = false,
  error = null,
}: TopCategoriesChartProps) {
  const { chartData, chartConfig } = useMemo(
    () => prepareBarChartData(categorySpending, CATEGORY_COLORS),
    [categorySpending],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Top 5 Categories
        </CardTitle>
        <CardDescription>Your highest spending categories this month</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] sm:h-[300px] w-full" />
        ) : error ? (
          <ErrorState
            title="Failed to load category data"
            description={error}
            variant="inline"
            className="h-[250px] sm:h-[300px]"
          />
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={8}>
                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <NoDataState
            icon={BarChart3}
            title="No category data available"
            description="Add expenses to see your spending by category"
            variant="inline"
            height="h-[250px] sm:h-[300px]"
          />
        )}
      </CardContent>
    </Card>
  );
});
