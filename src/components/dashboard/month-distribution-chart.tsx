'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Wallet } from 'lucide-react';
import { getAccountDistribution } from '@/lib/actions/finance-actions';
import { ErrorState } from '@/components/common/error-state';
import { NoDataState } from '@/components/common/no-data-state';
import { Skeleton } from '@/components/ui/skeleton';

interface AccountDistributionItem {
  name: string;
  type: string;
  value: number;
  currency?: string;
  color: string;
}

interface AccountDistributionChartProps {
  className?: string;
}

export const AccountDistributionChart = React.memo(function AccountDistributionChart({
  className,
}: AccountDistributionChartProps) {
  const [accountData, setAccountData] = useState<AccountDistributionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getAccountDistribution();
        if (result.success && 'data' in result && result.data) {
          setAccountData(result.data);
          setError(null);
        } else {
          const errorMessage = result.error || 'Failed to load account distribution';
          setError(errorMessage);
        }
      } catch (error) {
        console.error('Failed to load account distribution:', error);
        setError('Failed to load account distribution');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
  }, []);

  /**
   * Prepares chart data and config for PieChart
   */
  const { pieChartData, chartConfig } = useMemo(() => {
    const filteredData = accountData.filter((item) => item.value > 0);

    const data = filteredData.map((account) => ({
      name: account.name,
      value: account.value,
      fill: account.color,
      type: account.type,
    }));

    const config: Record<string, { label: string; color: string }> = {};
    data.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });

    return {
      pieChartData: data,
      chartConfig: config,
    };
  }, [accountData]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Account Distribution
        </CardTitle>
        <CardDescription>How your total balance is distributed across accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] sm:h-[300px] w-full" />
        ) : error ? (
          <ErrorState
            title="Failed to load account distribution"
            description={error}
            variant="inline"
            className="h-[250px] sm:h-[300px]"
          />
        ) : pieChartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <PieChart>
              <Pie
                data={pieChartData}
                innerRadius="60%"
                outerRadius="100%"
                cornerRadius="5"
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <NoDataState
            icon={Wallet}
            title="No accounts with balance available"
            description="Add transactions to see your account distribution"
            variant="inline"
            height="h-[250px] sm:h-[300px]"
          />
        )}
      </CardContent>
    </Card>
  );
});
