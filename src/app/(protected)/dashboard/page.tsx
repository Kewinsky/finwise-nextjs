'use client';

import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useCategorySpending } from '@/hooks/use-category-spending';
import { MetricsGrid } from '@/components/dashboard/metrics-grid';
import { FinancialTrendsChart } from '@/components/dashboard/financial-trends-chart';
import { AccountDistributionChart } from '@/components/dashboard/month-distribution-chart';
import { TopCategoriesChart } from '@/components/dashboard/top-categories-chart';
import { RecentActivityCard } from '@/components/dashboard/recent-activity-card';
import { QuickActionsCard } from '@/components/dashboard/quick-actions-card';

export default function DashboardPage() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>(
    'expense',
  );

  const { dashboardData, refetch } = useDashboardData();

  const currentDate = new Date();
  const { data: monthlyCategorySpending, clearCache: clearCategoryCache } = useCategorySpending({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });

  const handleAddTransaction = (type: 'income' | 'expense' | 'transfer') => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  const handleTransactionSuccess = () => {
    clearCategoryCache();
    refetch();
    setShowTransactionForm(false);
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Advanced financial insights and analytics.</p>
      </div>

      <MetricsGrid data={dashboardData} />

      <FinancialTrendsChart dashboardData={dashboardData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AccountDistributionChart />
        <TopCategoriesChart categorySpending={monthlyCategorySpending} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActionsCard onAddTransaction={handleAddTransaction} />
        <RecentActivityCard recentTransactions={dashboardData.recentTransactions} />
      </div>

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
