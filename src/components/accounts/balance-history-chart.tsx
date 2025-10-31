'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AreaChart } from 'lucide-react';
import { notifyError } from '@/lib/notifications';
import { getBalanceHistory } from '@/lib/actions/finance-actions';
import type { Account, BalanceHistoryChart, BalanceHistoryFilters } from '@/types/finance.types';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line } from 'recharts';
import { CartesianGrid } from 'recharts';
import { YAxis, XAxis } from 'recharts';
import { LoadingSpinner } from '../ui/custom-spinner';

interface BalanceHistoryChartProps {
  accounts: Account[];
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export function BalanceHistoryChartComponent({ accounts }: BalanceHistoryChartProps) {
  const [allBalanceHistory, setAllBalanceHistory] = useState<BalanceHistoryChart[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize selected accounts with all accounts
  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.size === 0) {
      setSelectedAccounts(new Set(accounts.map((account) => account.id)));
    }
  }, [accounts, selectedAccounts.size]);

  // Load balance history only when year changes (not when account selection changes)
  const loadBalanceHistory = useCallback(async () => {
    if (accounts.length === 0) return;

    setIsLoading(true);
    try {
      const filters: BalanceHistoryFilters = {
        accountIds: accounts.map((account) => account.id), // Load ALL accounts
        startDate: new Date(selectedYear, 0, 1), // January 1st
        endDate: new Date(selectedYear, 11, 31), // December 31st
        period: 'monthly',
      };

      const result = await getBalanceHistory(filters);

      if (result.success && 'data' in result && Array.isArray(result.data)) {
        setAllBalanceHistory(result.data);
      } else {
        notifyError('Failed to load balance history', {
          description: 'error' in result ? result.error : 'Unknown error occurred',
        });
      }
    } catch {
      notifyError('Failed to load balance history');
    } finally {
      setIsLoading(false);
    }
  }, [accounts, selectedYear]); // Removed selectedAccounts from dependencies

  useEffect(() => {
    loadBalanceHistory();
  }, [loadBalanceHistory]);

  // Filter balance history client-side based on selected accounts
  const balanceHistory = useMemo(() => {
    return allBalanceHistory.filter((history) => selectedAccounts.has(history.accountId));
  }, [allBalanceHistory, selectedAccounts]);

  // Prepare chart data for all 12 months (only for selected accounts)
  const chartData = useMemo(() => {
    const data = MONTHS.map((month, index) => {
      const monthData: Record<string, string | number> = {
        month: month.substring(0, 3), // Jan, Feb, Mar, etc.
        fullMonth: month,
      };

      // Add balance data only for selected accounts
      Array.from(selectedAccounts).forEach((accountId) => {
        const historyPoint = balanceHistory.find((h) => h.accountId === accountId);
        const monthBalance = historyPoint?.data.find((d) => d.month === index + 1);
        monthData[accountId] = monthBalance?.balance || 0;
      });

      return monthData;
    });

    return data;
  }, [balanceHistory, selectedAccounts]);

  // Calculate Y-axis domain with constant step
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 1000];

    const allValues = chartData.flatMap((data) =>
      Array.from(selectedAccounts).map((accountId) => (data[accountId] as number) || 0),
    );

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);

    // Add some padding and ensure nice round numbers
    const padding = (max - min) * 0.1;
    const minValue = Math.max(0, min - padding);
    const maxValue = max + padding;

    // Round to nearest 100 for cleaner ticks
    const roundedMin = Math.floor(minValue / 100) * 100;
    const roundedMax = Math.ceil(maxValue / 100) * 100;

    return [roundedMin, roundedMax];
  }, [chartData, selectedAccounts]);

  // Chart configuration for selected accounts only
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};

    Array.from(selectedAccounts).forEach((accountId) => {
      const account = accounts.find((acc) => acc.id === accountId);
      if (account) {
        config[accountId] = {
          label: account.name,
          color: account.color || '#3B82F6',
        };
      }
    });

    return config;
  }, [accounts, selectedAccounts]);

  if (accounts.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AreaChart className="h-5 w-5" />
            Balance History
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Year:</span>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Accounts:</span>
              <Select
                value={selectedAccounts.size === accounts.length ? 'all' : 'custom'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setSelectedAccounts(new Set(accounts.map((account) => account.id)));
                  } else {
                    // Individual account toggle
                    const accountId = value;
                    const newSelected = new Set(selectedAccounts);
                    if (newSelected.has(accountId)) {
                      newSelected.delete(accountId);
                    } else {
                      newSelected.add(accountId);
                    }
                    setSelectedAccounts(newSelected);
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue>
                    {selectedAccounts.size === accounts.length
                      ? 'All Accounts'
                      : `${selectedAccounts.size} Account${selectedAccounts.size > 1 ? 's' : ''}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: account.color || '#3B82F6' }}
                        />
                        {account.name}
                        {selectedAccounts.has(account.id) && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="w-full h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner message="Loading chart data..." />
            </div>
          ) : chartData.length === 0 || allBalanceHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AreaChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No balance history data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Chart will appear once you have transaction data
                </p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                className="w-full h-full"
                margin={{ top: 16, bottom: 16, left: 32, right: 32 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                {Array.from(selectedAccounts).map((accountId) => {
                  const account = accounts.find((acc) => acc.id === accountId);
                  if (!account) return null;

                  return (
                    <Line
                      key={accountId}
                      dataKey={accountId}
                      type="linear"
                      stroke={account.color || '#3B82F6'}
                      strokeWidth={2}
                      dot={{
                        fill: account.color || '#3B82F6',
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: account.color || '#3B82F6',
                        strokeWidth: 2,
                      }}
                    />
                  );
                })}

                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
