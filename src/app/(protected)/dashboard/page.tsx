'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Plus,
  ArrowRightLeft,
  Building,
  ArrowRight,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { DateRangeSelector, type DateRange } from '@/components/dashboard/date-range-selector';
import {
  getDashboardData,
  getMonthlyCashFlowTrend,
  getCategorySpendingBreakdown,
  getCategorySpendingForMonth,
  getSimpleFinancialHealthScore,
  generateInsights,
} from '@/lib/actions/finance-actions';
import { notifyError } from '@/lib/notifications';
import {
  calculatePercentageChange,
  formatPercentageChange,
  formatCurrency,
  formatDisplayDate,
} from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { NumberTicker } from '@/components/ui/number-ticker';
import type { DashboardMetrics } from '@/types/finance.types';

// Additional data types
interface CashFlowData {
  month?: string;
  year?: string;
  income: number;
  expenses: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  avgCategory?: number;
}

interface FinancialHealthScore {
  overallScore: number;
  breakdown: {
    savingsRate: { score: number; weight: number };
    emergencyFund: { score: number; weight: number };
    debtManagement: { score: number; weight: number };
    consistency: { score: number; weight: number };
  };
}

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
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    // Go back 2 months so we get exactly 3 months total (including current month)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: threeMonthsAgo, to: endOfCurrentMonth };
  });
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // Additional data states
  const [monthlyCashFlowTrend, setMonthlyCashFlowTrend] = useState<CashFlowData[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [monthlyCategorySpending, setMonthlyCategorySpending] = useState<CategorySpending[]>([]);
  const [financialHealthScore, setFinancialHealthScore] = useState<FinancialHealthScore | null>(
    null,
  );
  const [isLoadingAdditionalData, setIsLoadingAdditionalData] = useState(false);

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<{
    insights: string[];
    recommendations: string[];
    scoreExplanation: string;
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Selected month for spending analysis
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Cache for chart data to avoid repeated server calls
  const chartCacheRef = useRef<Map<string, CashFlowData[]>>(new Map());
  const categoryCacheRef = useRef<Map<string, CategorySpending[]>>(new Map());

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
    // Always load chart data when we have a date range (including default)
    if (!dateRange.from || !dateRange.to) return;

    // Create cache key from date range
    const cacheKey = `${dateRange.from.toISOString().split('T')[0]}-${dateRange.to.toISOString().split('T')[0]}`;

    // Check cache first
    if (chartCacheRef.current.has(cacheKey)) {
      setMonthlyCashFlowTrend(chartCacheRef.current.get(cacheKey)!);
      return;
    }

    setIsLoadingChart(true);
    try {
      // Pass the date range directly to getMonthlyCashFlowTrend
      const result = await getMonthlyCashFlowTrend(dateRange);
      if (result.success) {
        const data = result.data || [];
        setMonthlyCashFlowTrend(data);
        // Cache the result
        chartCacheRef.current.set(cacheKey, data);
      }
    } catch {
      notifyError('Failed to load chart data');
    } finally {
      setIsLoadingChart(false);
    }
  }, [dateRange]);

  const loadMonthlyCategoryData = useCallback(async () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1; // getMonth() returns 0-11, we need 1-12

      // Create cache key from year and month
      const cacheKey = `${year}-${month}`;

      // Check cache first
      if (categoryCacheRef.current.has(cacheKey)) {
        setMonthlyCategorySpending(categoryCacheRef.current.get(cacheKey)!);
        return;
      }

      const result = await getCategorySpendingForMonth(year, month);
      if (result.success) {
        const data = result.data || [];
        setMonthlyCategorySpending(data);
        // Cache the result
        categoryCacheRef.current.set(cacheKey, data);
      }
    } catch (error) {
      console.error('Error loading monthly category data:', error);
    }
  }, [selectedMonth]);

  const loadAdditionalData = useCallback(async () => {
    setIsLoadingAdditionalData(true);
    try {
      const [categoryResult, healthResult] = await Promise.all([
        getCategorySpendingBreakdown(),
        getSimpleFinancialHealthScore(),
      ]);

      // Load account distribution (removed - no longer needed)
      if (categoryResult.success) setCategorySpending(categoryResult.data || []);
      if (healthResult.success) setFinancialHealthScore(healthResult.data || null);
    } catch (error) {
      console.error('Failed to load additional data:', error);
    } finally {
      setIsLoadingAdditionalData(false);
    }
  }, []);

  // Load AI insights
  const loadAIInsights = useCallback(async () => {
    if (!financialHealthScore) return;

    setIsLoadingInsights(true);
    try {
      const result = await generateInsights();
      if (result.success && 'data' in result) {
        const insights = result.data;

        // Generate score explanation based on the health score
        const score = financialHealthScore.overallScore;
        let scoreExplanation = '';

        if (score >= 80) {
          scoreExplanation =
            'Excellent! Your financial health is in great shape. You have strong savings habits and good financial discipline.';
        } else if (score >= 60) {
          scoreExplanation =
            'Good progress! You have a solid financial foundation with room for improvement in some areas.';
        } else if (score >= 40) {
          scoreExplanation =
            'Fair financial health. Focus on building better savings habits and reducing expenses.';
        } else {
          scoreExplanation =
            'Needs attention. Consider creating a budget and focusing on basic financial fundamentals.';
        }

        setAiInsights({
          insights: insights.spendingInsights || [],
          recommendations: insights.savingsTips || [],
          scoreExplanation,
        });
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [financialHealthScore]);

  // Load monthly category data when selected month changes
  useEffect(() => {
    loadMonthlyCategoryData();
  }, [loadMonthlyCategoryData]);

  // Load AI insights when financial health score is available
  useEffect(() => {
    if (financialHealthScore) {
      loadAIInsights();
    }
  }, [financialHealthScore, loadAIInsights]);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
    loadAdditionalData();
  }, [loadAdditionalData]);

  // Reload chart data when date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      loadChartData();
    }
  }, [dateRange]);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  // Clear cache when transactions are added/updated
  const clearCache = useCallback(() => {
    chartCacheRef.current.clear();
    categoryCacheRef.current.clear();
  }, []);

  const handleAddTransaction = (type: 'income' | 'expense' | 'transfer') => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  const handleTransactionSuccess = () => {
    // Clear cache to ensure fresh data
    clearCache();
    // Only reload dashboard data when transaction is successfully saved
    loadDashboardData();
  };

  const formatDate = (dateString: string) => {
    return formatDisplayDate(dateString);
  };

  // Transform spending trends data for the chart - simplified
  const monthlyCashFlowChartData = useMemo(() => {
    return monthlyCashFlowTrend.map((month) => ({
      month: month.month,
      income: Math.round(month.income),
      expenses: Math.round(month.expenses),
    }));
  }, [monthlyCashFlowTrend]);

  // Get chart data - always monthly aggregation
  const getChartData = useMemo(() => {
    return monthlyCashFlowChartData.map((item) => ({
      ...item,
      day: item.month || 'Month',
    }));
  }, [monthlyCashFlowChartData]);

  const categoryChartData = useMemo(() => {
    if (monthlyCategorySpending.length === 0) return [];

    // Calculate total expenses for percentage calculation
    const totalExpenses = monthlyCategorySpending.reduce(
      (sum, category) => sum + category.amount,
      0,
    );

    return monthlyCategorySpending.slice(0, 8).map((category) => ({
      ...category,
      amount: Math.round(category.amount),
      percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0,
    }));
  }, [monthlyCategorySpending]);

  // Show loading spinner only on initial load
  if (!dashboardData) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your finances.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              <NumberTicker
                value={dashboardData.totalBalance}
                decimalPlaces={2}
                delay={0.1}
                className="text-blue-800 dark:text-blue-200"
              />
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
              <NumberTicker
                value={dashboardData.monthlySummary.totalIncome}
                decimalPlaces={2}
                delay={0.2}
                className="text-green-800 dark:text-green-200"
              />
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
              <NumberTicker
                value={dashboardData.monthlySummary.totalExpenses}
                decimalPlaces={2}
                delay={0.3}
                className="text-rose-800 dark:text-rose-200"
              />
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
              <NumberTicker
                value={dashboardData.monthlySummary.savings}
                decimalPlaces={2}
                delay={0.4}
                className="text-purple-800 dark:text-purple-200"
              />
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

      {/* Financial Trends Section */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Financial Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Financial Trends
                </CardTitle>
                <CardDescription>
                  Track your financial performance with monthly aggregation
                </CardDescription>
              </div>
              <div className="w-full sm:w-auto sm:flex-shrink-0">
                <DateRangeSelector
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  isLoading={isLoadingChart}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {/* Chart */}
              {isLoadingChart ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner message="Loading chart data..." />
                </div>
              ) : (
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={getChartData}
                    margin={{
                      left: 20,
                      right: 20,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Health Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Financial Health Score
            </CardTitle>
            <CardDescription>Your overall financial health assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAdditionalData ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner message="Loading..." />
              </div>
            ) : financialHealthScore ? (
              <>
                <div className="text-2xl font-bold mb-2">
                  <NumberTicker
                    value={financialHealthScore.overallScore}
                    decimalPlaces={0}
                    delay={0.1}
                  />
                  <span className="text-sm text-muted-foreground ml-1">/100</span>
                </div>

                {/* AI Score Explanation */}
                {aiInsights && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <Zap className="h-3 w-3 inline mr-1" />
                      AI Insight
                    </p>
                    <p className="text-sm">{aiInsights.scoreExplanation}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {Object.entries(financialHealthScore.breakdown).map(
                    ([key, value]: [string, { score: number; weight: number }]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{value.score}/100</span>
                      </div>
                    ),
                  )}
                </div>

                {/* AI Recommendations */}
                {isLoadingInsights ? (
                  <div className="flex items-center justify-center py-2">
                    <LoadingSpinner message="Generating insights..." />
                  </div>
                ) : aiInsights && aiInsights.recommendations.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      <Zap className="h-3 w-3 inline mr-1" />
                      AI Recommendations
                    </p>
                    <div className="space-y-1">
                      {aiInsights.recommendations.slice(0, 2).map((recommendation, index) => (
                        <div
                          key={index}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-0.5">•</span>
                          <span>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Categories & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Top Categories
                </CardTitle>
                <CardDescription>Your top categories by spending</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prevMonth = new Date(selectedMonth);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    setSelectedMonth(prevMonth);
                  }}
                >
                  ←
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextMonth = new Date(selectedMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setSelectedMonth(nextMonth);
                  }}
                  disabled={
                    selectedMonth.getMonth() === new Date().getMonth() &&
                    selectedMonth.getFullYear() === new Date().getFullYear()
                  }
                >
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Monthly Category Summary */}
            {isLoadingAdditionalData ? (
              // center the spinner
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner message="Loading category data..." />
              </div>
            ) : monthlyCategorySpending.length > 0 ? (
              <div className="space-y-3">
                {monthlyCategorySpending.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{category.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(category.amount)} ({category.percentage}%)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {formatCurrency(category.avgCategory || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm text-muted-foreground mb-2">No spending data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Recent Activity
              </CardTitle>
              <CardDescription className="mt-1">Your latest transactions</CardDescription>
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
                          : transaction.type === 'expense'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : transaction.type === 'expense' ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <ArrowRightLeft className="h-4 w-4" />
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
                        : transaction.type === 'expense'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {transaction.type === 'income'
                      ? '+'
                      : transaction.type === 'expense'
                        ? '-'
                        : ''}
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
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </CardTitle>
              <CardDescription className="mt-1">Common tasks at your fingertips</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
