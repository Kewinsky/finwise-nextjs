'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { SimpleChartTooltip } from '@/components/charts/simple-chart-tooltip';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getAccountDistribution } from '@/lib/actions/finance-actions';
import { useBaseCurrency } from '@/hooks/use-base-currency';

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
  const baseCurrency = useBaseCurrency();

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

  const pieChartData = useMemo(() => {
    return accountData
      .filter((item) => item.value > 0)
      .map((account) => ({
        name: account.name,
        value: account.value,
        fill: account.color,
        type: account.type,
      }));
  }, [accountData]);

  const chartConfig = {
    value: {
      label: 'Balance',
      color: 'var(--primary)',
    },
  };

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

  const totalBalance = pieChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Account Distribution
        </CardTitle>
        <CardDescription>
          {totalBalance > 0
            ? `Total balance: ${formatCurrency(totalBalance, baseCurrency)} distributed across ${pieChartData.length} account${pieChartData.length !== 1 ? 's' : ''}`
            : 'How your total balance is distributed across accounts'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pieChartData.length > 0 ? (
          <>
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
                <ChartTooltip
                  cursor={false}
                  content={<SimpleChartTooltip labelKey="name" currency={baseCurrency} />}
                />
              </PieChart>
            </ChartContainer>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-4 justify-center">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    <span className="hidden sm:inline">{item.name}: </span>
                    <span className="sm:hidden">
                      {item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name}:{' '}
                    </span>
                    {formatCurrency(item.value, baseCurrency)} (
                    {totalBalance > 0 ? `${((item.value / totalBalance) * 100).toFixed(1)}%` : '0%'}
                    )
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-center text-muted-foreground">
            <p className="text-sm sm:text-base">No accounts with balance available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
