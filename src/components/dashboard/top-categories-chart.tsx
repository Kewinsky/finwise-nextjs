'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, CartesianGrid, XAxis, Cell, LabelList } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart3 } from 'lucide-react';
import type { CategorySpending } from '@/hooks/use-category-spending';

interface TopCategoriesChartProps {
  categorySpending: CategorySpending[];
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

export function TopCategoriesChart({ categorySpending }: TopCategoriesChartProps) {
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
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
              <Bar dataKey="value" radius={8}>
                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-muted-foreground">
            <p className="text-sm sm:text-base">No category data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
