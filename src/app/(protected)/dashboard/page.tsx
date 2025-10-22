'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Plus,
  ArrowRightLeft,
  Building,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { DateRangeSelector, type DateRange } from '@/components/dashboard/date-range-selector';
import { getDashboardData } from '@/lib/actions/finance-actions';
import { notifyError } from '@/lib/notifications';
import {
  calculatePercentageChange,
  formatPercentageChange,
  formatCurrency,
  formatDisplayDate,
} from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import type { DashboardMetrics } from '@/types/finance.types';

const chartConfig = {
  income: {
    label: 'Income',
    color: 'var(--success)',
  },
  expenses: {
    label: 'Expenses',
    color: 'var(--destructive)',
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>(
    'expense',
  );
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  const loadDashboardData = async () => {
    try {
      const result = await getDashboardData();

      if (result.success && 'data' in result) {
        setDashboardData(result.data as DashboardMetrics);
      } else {
        notifyError('Failed to load dashboard data', {
          description: result.error || 'Unknown error occurred',
        });
      }
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      notifyError('Failed to load dashboard data', {
        description: 'Please try refreshing the page',
      });
    }
  };

  const loadChartData = useCallback(async () => {
    if (!dateRange.from && !dateRange.to) return;

    setIsLoadingChart(true);
    try {
      const result = await getDashboardData(dateRange);

      if (result.success && 'data' in result && result.data) {
        setDashboardData((prev) =>
          prev
            ? {
                ...prev,
                spendingTrends: result.data.spendingTrends,
              }
            : (result.data as DashboardMetrics),
        );
      } else {
        notifyError('Failed to load chart data', {
          description: result.error,
        });
      }
    } catch {
      notifyError('Failed to load chart data');
    } finally {
      setIsLoadingChart(false);
    }
  }, [dateRange]);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload chart data when date range changes
  useEffect(() => {
    if (dashboardData && (dateRange.from || dateRange.to)) {
      loadChartData();
    }
  }, [dateRange, loadChartData, dashboardData]);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleAddTransaction = (type: 'income' | 'expense' | 'transfer') => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  const handleTransactionSuccess = () => {
    // Only reload dashboard data when transaction is successfully saved
    loadDashboardData();
  };

  const formatDate = (dateString: string) => {
    return formatDisplayDate(dateString);
  };

  // Transform spending trends data for the chart - memoized for performance
  const chartData = useMemo(() => {
    return (
      dashboardData?.spendingTrends.map((trend) => ({
        day: new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' }),
        expenses: trend.type === 'expense' ? trend.amount : 0,
        income: trend.type === 'income' ? trend.amount : 0,
      })) || []
    );
  }, [dashboardData?.spendingTrends]);

  // Show loading spinner only on initial load
  if (!dashboardData) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your finances.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {formatCurrency(dashboardData.totalBalance)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {(() => {
                if (!dashboardData.previousMonthBalance) {
                  return <span className="text-muted-foreground">No previous data</span>;
                }
                const percentage = calculatePercentageChange(
                  dashboardData.totalBalance,
                  dashboardData.previousMonthBalance,
                );
                const { text, isPositive } = formatPercentageChange(percentage);
                return (
                  <span
                    className={
                      isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {text}
                  </span>
                );
              })()}{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              This Month Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(dashboardData.monthlySummary.totalIncome)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {(() => {
                if (!dashboardData.monthlySummary.previousMonth) {
                  return <span className="text-muted-foreground">No previous data</span>;
                }
                const percentage = calculatePercentageChange(
                  dashboardData.monthlySummary.totalIncome,
                  dashboardData.monthlySummary.previousMonth.totalIncome,
                );
                const { text, isPositive } = formatPercentageChange(percentage);
                return (
                  <span
                    className={
                      isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {text}
                  </span>
                );
              })()}{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 border-rose-200/50 dark:border-rose-800/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">
              This Month Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-800 dark:text-rose-200">
              {formatCurrency(dashboardData.monthlySummary.totalExpenses)}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {(() => {
                if (!dashboardData.monthlySummary.previousMonth) {
                  return <span className="text-muted-foreground">No previous data</span>;
                }
                const percentage = calculatePercentageChange(
                  dashboardData.monthlySummary.totalExpenses,
                  dashboardData.monthlySummary.previousMonth.totalExpenses,
                );
                const { text, isPositive } = formatPercentageChange(percentage);
                // For expenses, we want to show positive change as bad (red) and negative change as good (green)
                const isGood = !isPositive;
                return (
                  <span
                    className={
                      isGood
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {text}
                  </span>
                );
              })()}{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200/50 dark:border-purple-800/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Net Savings
            </CardTitle>
            <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {formatCurrency(dashboardData.monthlySummary.savings)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {(() => {
                if (!dashboardData.monthlySummary.previousMonth) {
                  return <span className="text-muted-foreground">No previous data</span>;
                }
                const percentage = calculatePercentageChange(
                  dashboardData.monthlySummary.savings,
                  dashboardData.monthlySummary.previousMonth.savings,
                );
                const { text, isPositive } = formatPercentageChange(percentage);
                return (
                  <span
                    className={
                      isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {text}
                  </span>
                );
              })()}{' '}
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Spending Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="min-w-0 flex-1">
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {dateRange.from && dateRange.to ? (
                    <span className="block sm:inline">
                      Income and expenses from{' '}
                      <span className="font-medium">
                        {formatDate(dateRange.from.toISOString())}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">{formatDate(dateRange.to.toISOString())}</span>
                    </span>
                  ) : (
                    'Daily income and expenses over the last 7 days'
                  )}
                </CardDescription>
              </div>
              <div className="w-full sm:w-auto sm:flex-shrink-0 sm:ml-4">
                <DateRangeSelector
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  isLoading={isLoadingChart}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingChart ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner message="Loading chart data..." />
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 20,
                    right: 20,
                  }}
                >
                  <CartesianGrid vertical={true} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area
                    dataKey="income"
                    type="linear"
                    fill="var(--color-income)"
                    fillOpacity={0.4}
                    stroke="var(--color-income)"
                    stackId="a"
                  />
                  <Area
                    dataKey="expenses"
                    type="linear"
                    fill="var(--color-expenses)"
                    fillOpacity={0.4}
                    stroke="var(--color-expenses)"
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/transactions')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`rounded-full p-2 ${
                        transaction.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              <CardDescription>Common tasks at your fingertips</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="h-20 sm:h-24 flex flex-col items-center gap-1 sm:gap-2 transition-all duration-200 group"
              onClick={() => handleAddTransaction('income')}
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Add Income</p>
                <p className="text-xs text-muted-foreground">Record new income</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 sm:h-24 flex flex-col items-center gap-1 sm:gap-2 transition-all duration-200 group"
              onClick={() => handleAddTransaction('expense')}
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Add Expense</p>
                <p className="text-xs text-muted-foreground">Track new expense</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 sm:h-24 flex flex-col items-center gap-1 sm:gap-2 transition-all duration-200 group"
              onClick={() => handleAddTransaction('transfer')}
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Transfer Funds</p>
                <p className="text-xs text-muted-foreground">Move between accounts</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 sm:h-24 flex flex-col items-center gap-1 sm:gap-2 transition-all duration-200 group"
              onClick={() => router.push('/accounts')}
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:scale-110 transition-transform">
                <Building className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Manage Accounts</p>
                <p className="text-xs text-muted-foreground">Add or edit accounts</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Form */}
      {showTransactionForm && (
        <TransactionForm
          open={showTransactionForm}
          onOpenChange={setShowTransactionForm}
          onSuccess={handleTransactionSuccess}
          defaultType={transactionType}
        />
      )}
    </div>
  );
}
