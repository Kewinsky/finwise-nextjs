'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { SimpleChartTooltip } from '@/components/charts/simple-chart-tooltip';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardMetrics } from '@/types/finance.types';

interface MonthDistributionChartProps {
  dashboardData: DashboardMetrics;
}

const chartConfig = {
  value: {
    label: 'Value',
    color: 'var(--primary)',
  },
};

const COLORS = {
  income: 'var(--success)',
  expenses: 'var(--destructive)',
  savings: 'var(--purple)',
};

export function MonthDistributionChart({ dashboardData }: MonthDistributionChartProps) {
  const pieChartData = useMemo(() => {
    const totalIncome = dashboardData.monthlySummary.totalIncome;
    const totalExpenses = dashboardData.monthlySummary.totalExpenses;
    const savings = dashboardData.monthlySummary.savings;

    return [
      {
        name: 'Income',
        value: totalIncome,
        fill: COLORS.income,
      },
      {
        name: 'Expenses',
        value: totalExpenses,
        fill: COLORS.expenses,
      },
      {
        name: 'Savings',
        value: savings,
        fill: COLORS.savings,
      },
    ].filter((item) => item.value > 0);
  }, [dashboardData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Current Month Distribution
        </CardTitle>
        <CardDescription>How your income, expenses, and savings are distributed</CardDescription>
      </CardHeader>
      <CardContent>
        {pieChartData.length > 0 ? (
          <>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <PieChart>
                <Pie
                  data={pieChartData}
                  innerRadius="80%"
                  outerRadius="100%"
                  cornerRadius="50%"
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip cursor={false} content={<SimpleChartTooltip labelKey="name" />} />
              </PieChart>
            </ChartContainer>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-center text-muted-foreground">
            <p>No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
