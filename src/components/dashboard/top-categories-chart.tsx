'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { SimpleChartTooltip } from '@/components/charts/simple-chart-tooltip';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useBaseCurrency } from '@/hooks/use-base-currency';
import type { CategorySpending } from '@/hooks/use-category-spending';

interface TopCategoriesChartProps {
  categorySpending: CategorySpending[];
}

const chartConfig = {
  value: {
    label: 'Value',
    color: 'var(--primary)',
  },
};

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function TopCategoriesChart({ categorySpending }: TopCategoriesChartProps) {
  const baseCurrency = useBaseCurrency();

  const topCategoriesData = useMemo(() => {
    if (categorySpending.length === 0) return [];

    return categorySpending.slice(0, 5).map((category, index) => ({
      name: category.category,
      value: category.amount,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [categorySpending]);

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
        {topCategoriesData.length > 0 ? (
          <>
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <BarChart accessibilityLayer data={topCategoriesData}>
                <CartesianGrid vertical={false} />
                <ChartTooltip
                  cursor={false}
                  content={<SimpleChartTooltip labelKey="name" currency={baseCurrency} />}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>

            {/* Category List */}
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-4 justify-center">
              {topCategoriesData.map((category, index) => (
                <div key={index} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.fill }}
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    <span className="hidden sm:inline">{category.name}: </span>
                    <span className="sm:hidden">
                      {category.name.length > 10
                        ? `${category.name.substring(0, 10)}...`
                        : category.name}
                      :{' '}
                    </span>
                    {formatCurrency(category.value, baseCurrency)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-muted-foreground">
            <p className="text-sm sm:text-base">No category data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
