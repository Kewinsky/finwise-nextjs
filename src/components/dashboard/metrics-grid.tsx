'use client';

import { MetricCard } from './metric-card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { DashboardMetrics } from '@/types/finance.types';

interface MetricsGridProps {
  data: DashboardMetrics;
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const calculateSavingsRate = () => {
    if (data.monthlySummary.totalIncome > 0) {
      return (data.monthlySummary.savings / data.monthlySummary.totalIncome) * 100;
    }
    return 0;
  };

  const savingsRate = calculateSavingsRate();
  const savingsSubtitle =
    savingsRate > 0 ? `${savingsRate.toFixed(1)}% savings rate` : 'Negative savings this month';

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="My Balance"
        value={data.totalBalance}
        icon={DollarSign}
        previousValue={data.previousMonthBalance}
        gradientFrom="from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
        gradientTo="border-blue-200/50 dark:border-blue-800/30"
        borderColor="border-blue-200/50 dark:border-blue-800/30"
        textColor="text-blue-700 dark:text-blue-300"
        iconColor="text-blue-600 dark:text-blue-400"
        valueColor="text-blue-800 dark:text-blue-200"
        subtitleColor="text-blue-600 dark:text-blue-400"
        delay={0.1}
      />

      <MetricCard
        title="Incomes This Month"
        value={data.monthlySummary.totalIncome}
        icon={TrendingUp}
        previousValue={data.monthlySummary.previousMonth?.totalIncome}
        gradientFrom="from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
        gradientTo="border-green-200/50 dark:border-green-800/30"
        borderColor="border-green-200/50 dark:border-green-800/30"
        textColor="text-green-700 dark:text-green-300"
        iconColor="text-green-600 dark:text-green-400"
        valueColor="text-green-800 dark:text-green-200"
        subtitleColor="text-green-600 dark:text-green-400"
        delay={0.2}
      />

      <MetricCard
        title="Expenses This Month"
        value={data.monthlySummary.totalExpenses}
        icon={TrendingDown}
        previousValue={data.monthlySummary.previousMonth?.totalExpenses}
        reverseComparison
        gradientFrom="from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20"
        gradientTo="border-rose-200/50 dark:border-rose-800/30"
        borderColor="border-rose-200/50 dark:border-rose-800/30"
        textColor="text-rose-700 dark:text-rose-300"
        iconColor="text-rose-600 dark:text-rose-400"
        valueColor="text-rose-800 dark:text-rose-200"
        subtitleColor="text-rose-600 dark:text-rose-400"
        delay={0.3}
      />

      <MetricCard
        title="My Savings"
        value={data.monthlySummary.savings}
        icon={Wallet}
        customSubtitle={savingsSubtitle}
        gradientFrom="from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20"
        gradientTo="border-purple-200/50 dark:border-purple-800/30"
        borderColor="border-purple-200/50 dark:border-purple-800/30"
        textColor="text-purple-700 dark:text-purple-300"
        iconColor="text-purple-600 dark:text-purple-400"
        valueColor="text-purple-800 dark:text-purple-200"
        subtitleColor="text-purple-600 dark:text-purple-400"
        delay={0.4}
      />
    </div>
  );
}
