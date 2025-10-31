'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  XAxis,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { SimpleChartTooltip } from '@/components/charts/simple-chart-tooltip';
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
import {
  getDashboardData,
  getMonthlyCashFlowTrend,
  getDailyCashFlowTrend,
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

interface ChartDataItem {
  date?: string;
  month?: string;
  week?: string;
  income: number;
  expenses: number;
}

interface AreaChartDataPoint {
  date: string;
  label: string;
  value: number;
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
  balance: {
    label: 'Balance',
    color: 'var(--blue)',
  },
  savings: {
    label: 'Savings',
    color: 'var(--purple)',
  },
  value: {
    label: 'Value',
    color: 'var(--primary)',
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>(
    'expense',
  );
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);

  // Additional data states
  const [monthlyCategorySpending, setMonthlyCategorySpending] = useState<CategorySpending[]>([]);
  const [financialHealthScore, setFinancialHealthScore] = useState<FinancialHealthScore | null>(
    null,
  );

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<{
    insights: string[];
    recommendations: string[];
    scoreExplanation: string;
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Selected month for spending analysis
  const [selectedMonth] = useState<Date>(new Date());

  const [selectedTimeRange, setSelectedTimeRange] = useState<'1W' | '1M' | '3M' | '6M' | '1Y'>(
    '1M',
  );
  const [selectedSeries, setSelectedSeries] = useState<
    'balance' | 'income' | 'expenses' | 'savings'
  >('balance');
  const [areaChartData, setAreaChartData] = useState<AreaChartDataPoint[]>([]);
  const [isLoadingAreaChart, setIsLoadingAreaChart] = useState(false);

  // Cache for chart data to avoid repeated server calls
  const chartCacheRef = useRef<Map<string, CashFlowData[]>>(new Map());
  const categoryCacheRef = useRef<Map<string, CategorySpending[]>>(new Map());
  const areaChartCacheRef = useRef<Map<string, AreaChartDataPoint[]>>(new Map());

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

  // Load area chart data based on time range and series
  const loadAreaChartData = useCallback(async () => {
    const cacheKey = `${selectedTimeRange}-${selectedSeries}`;

    // Check cache first
    if (areaChartCacheRef.current.has(cacheKey)) {
      setAreaChartData(areaChartCacheRef.current.get(cacheKey)!);
      return;
    }

    setIsLoadingAreaChart(true);
    try {
      // Calculate date range based on selected time range
      const now = new Date();
      let from: Date,
        to: Date = now;

      switch (selectedTimeRange) {
        case '1W':
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1M':
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3M':
          // Exactly 3 months ago (including current month = 3 months total)
          from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case '6M':
          // Exactly 6 months ago (including current month = 6 months total)
          from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          break;
        case '1Y':
          // Exactly 12 months ago (including current month = 12 months total)
          from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          break;
        default:
          from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }

      // Set end date to end of current month for monthly aggregations
      if (selectedTimeRange === '3M' || selectedTimeRange === '6M' || selectedTimeRange === '1Y') {
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
      }

      // Get data based on time range with appropriate aggregation
      let result;
      if (selectedTimeRange === '1W' || selectedTimeRange === '1M') {
        // Daily aggregation for 1W and 1M
        result = await getDailyCashFlowTrend({ from, to });
      } else {
        // Monthly aggregation for 3M, 6M, and 1Y
        result = await getMonthlyCashFlowTrend({ from, to });
      }

      if (result.success) {
        const data = result.data || [];

        // Transform data based on selected series
        const cumulativeBalance = dashboardData?.totalBalance || 0;

        // For balance series, we need to work backwards from current balance
        // by subtracting net transactions from each period
        if (selectedSeries === 'balance') {
          // Start from current balance and work backwards
          let runningBalance = cumulativeBalance;
          const balanceData: AreaChartDataPoint[] = [];

          for (let i = data.length - 1; i >= 0; i--) {
            const item = data[i] as ChartDataItem;
            const netChange = (item.income || 0) - (item.expenses || 0);
            runningBalance -= netChange;

            let label = '';
            let date = '';

            if (selectedTimeRange === '1W' || selectedTimeRange === '1M') {
              const dayDate = item.date ? new Date(item.date) : new Date();
              label = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              date = item.date?.split('T')[0] || '';
            } else {
              // Monthly data (3M, 6M, 1Y all use monthly aggregation)
              label = item.month || `Month ${i + 1}`;
              date = item.month || `Month ${i + 1}`;
            }

            balanceData.unshift({
              date,
              label,
              value: Math.max(0, runningBalance),
            });
          }

          setAreaChartData(balanceData);
          areaChartCacheRef.current.set(cacheKey, balanceData);
          return;
        }

        // For income and expenses, show period totals
        // For savings, show cumulative (running total from start)
        let cumulativeSavings = 0;
        const transformedData: AreaChartDataPoint[] = data.map((item, index) => {
          const chartItem = item as ChartDataItem;
          let label = '';
          let date = '';

          if (selectedTimeRange === '1W' || selectedTimeRange === '1M') {
            // For daily data (1W and 1M both use daily aggregation)
            const dayDate = chartItem.date ? new Date(chartItem.date) : new Date();
            label = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            date = chartItem.date?.split('T')[0] || '';
          } else {
            // For monthly data (3M, 6M, 1Y all use monthly aggregation)
            label = chartItem.month || `Month ${index + 1}`;
            date = chartItem.month || `Month ${index + 1}`;
          }

          let value = 0;
          if (selectedSeries === 'income') {
            // Period total: income for this day/month
            value = chartItem.income || 0;
          } else if (selectedSeries === 'expenses') {
            // Period total: expenses for this day/month
            value = chartItem.expenses || 0;
          } else if (selectedSeries === 'savings') {
            // Cumulative: running total of savings from start of period
            const periodSavings = (chartItem.income || 0) - (chartItem.expenses || 0);
            cumulativeSavings += periodSavings;
            value = cumulativeSavings;
          }

          return {
            date,
            label,
            value: selectedSeries === 'savings' ? value : Math.max(0, value), // Allow negative cumulative savings
          };
        });

        setAreaChartData(transformedData);
        areaChartCacheRef.current.set(cacheKey, transformedData);
      }
    } catch (error) {
      console.error('Error loading area chart data:', error);
      notifyError('Failed to load area chart data');
    } finally {
      setIsLoadingAreaChart(false);
    }
  }, [selectedTimeRange, selectedSeries, dashboardData]);

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
    try {
      const healthResult = await getSimpleFinancialHealthScore();
      if (healthResult.success) setFinancialHealthScore(healthResult.data || null);
    } catch (error) {
      console.error('Failed to load additional data:', error);
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

  // Load area chart data when time range or series changes
  useEffect(() => {
    if (dashboardData) {
      loadAreaChartData();
    }
  }, [selectedTimeRange, selectedSeries, dashboardData, loadAreaChartData]);

  // Clear cache when transactions are added/updated
  const clearCache = useCallback(() => {
    chartCacheRef.current.clear();
    categoryCacheRef.current.clear();
    areaChartCacheRef.current.clear();
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

  // Pie chart data for current month distribution
  const pieChartData = useMemo(() => {
    if (!dashboardData) return [];

    const totalIncome = dashboardData.monthlySummary.totalIncome;
    const totalExpenses = dashboardData.monthlySummary.totalExpenses;
    const savings = dashboardData.monthlySummary.savings;

    return [
      {
        name: 'Income',
        value: totalIncome,
        fill: '#10b981', // green
      },
      {
        name: 'Expenses',
        value: totalExpenses,
        fill: '#ef4444', // red
      },
      {
        name: 'Savings',
        value: savings,
        fill: '#8b5cf6', // purple
      },
    ].filter((item) => item.value > 0);
  }, [dashboardData]);

  // Top 5 categories chart data
  const topCategoriesData = useMemo(() => {
    if (monthlyCategorySpending.length === 0) return [];

    return monthlyCategorySpending.slice(0, 5).map((category, index) => ({
      name: category.category,
      value: category.amount,
      fill: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index],
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
        <p className="text-muted-foreground">Advanced financial insights and analytics.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              My Balance
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
              Incomes This Month
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
              Expenses This Month
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
              My Savings
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

      {/* Area Chart with Time Range and Series Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Financial Trends
              </CardTitle>
              <CardDescription>Track your financial performance over time</CardDescription>
            </div>

            {/* Time Range Buttons */}
            <div className="flex gap-2">
              {(['1W', '1M', '3M', '6M', '1Y'] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                  className="min-w-[40px]"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Series Tabs */}
          <Tabs
            value={selectedSeries}
            onValueChange={(value) =>
              setSelectedSeries(value as 'balance' | 'income' | 'expenses' | 'savings')
            }
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="balance">Total Balance</TabsTrigger>
              <TabsTrigger value="income">Incomes</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoadingAreaChart ? (
            <div className="flex items-center justify-center h-[400px]">
              <LoadingSpinner message="Loading chart data..." />
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <AreaChart
                accessibilityLayer
                data={areaChartData}
                margin={{ top: 16, bottom: 16, left: 32, right: 32 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={selectedTimeRange === '1M' ? 100 : 50}
                  interval={selectedTimeRange === '1M' ? Math.floor(areaChartData.length / 15) : 0}
                />
                <ChartTooltip cursor={false} content={<SimpleChartTooltip labelKey="label" />} />
                <Area
                  dataKey="value"
                  stroke={`var(--color-${selectedSeries})`}
                  fill={`var(--color-${selectedSeries})`}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rounded Pie Chart - Current Month Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Current Month Distribution
            </CardTitle>
            <CardDescription>
              How your income, expenses, and savings are distributed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-center text-muted-foreground">
                <p>No data available</p>
              </div>
            )}

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
          </CardContent>
        </Card>

        {/* Top 5 Categories Chart */}
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
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={topCategoriesData}>
                  <CartesianGrid vertical={false} />
                  <ChartTooltip cursor={false} content={<SimpleChartTooltip labelKey="name" />} />
                  <Bar dataKey="value" radius={8} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>No category data available</p>
              </div>
            )}

            {/* Category List */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {topCategoriesData.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.fill }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {category.name}: {formatCurrency(category.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Smart AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Smart AI Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your financial data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInsights ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner message="Generating insights..." />
              </div>
            ) : aiInsights && aiInsights.recommendations.length > 0 ? (
              <div className="space-y-4">
                {/* Financial Health Score */}
                {financialHealthScore && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">Financial Health Score</span>
                      <span className="text-2xl font-bold text-primary">
                        {financialHealthScore.overallScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          financialHealthScore.overallScore >= 80
                            ? 'bg-green-500'
                            : financialHealthScore.overallScore >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${financialHealthScore.overallScore}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{aiInsights.scoreExplanation}</p>
                  </div>
                )}

                {/* AI Recommendations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">AI Recommendations</span>
                  </div>
                  <div className="space-y-3">
                    {aiInsights.recommendations.slice(0, 4).map((recommendation, index) => (
                      <div
                        key={index}
                        className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{index + 1}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                {aiInsights.insights.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Key Insights</span>
                    </div>
                    <div className="space-y-2">
                      {aiInsights.insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Target className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No AI suggestions available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add more transaction data to get personalized recommendations
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Recent Activity
              </CardTitle>
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
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
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
