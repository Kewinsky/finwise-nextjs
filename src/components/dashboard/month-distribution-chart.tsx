'use client';

import { useMemo, useState, useEffect } from 'react';
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

export function AccountDistributionChart({ className }: AccountDistributionChartProps) {
  const [accountData, setAccountData] = useState<AccountDistributionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        setIsLoading(true);
        const result = await getAccountDistribution();
        if (result.success && 'data' in result && result.data) {
          setAccountData(result.data);
        }
      } catch (error) {
        console.error('Failed to load account distribution:', error);
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

  if (isLoading) {
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
          <div className="flex items-center justify-center h-[300px] text-center text-muted-foreground">
            <p>Loading account data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {pieChartData.length > 0 ? (
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
          <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-center text-muted-foreground">
            <p className="text-sm sm:text-base">No accounts with balance available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
