'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useCategorySpending } from '@/hooks/use-category-spending';
import { MetricsGrid } from '@/components/dashboard/metrics-grid';
import { FinancialTrendsChart } from '@/components/dashboard/financial-trends-chart';
import { AccountDistributionChart } from '@/components/dashboard/month-distribution-chart';
import { TopCategoriesChart } from '@/components/dashboard/top-categories-chart';
import { ErrorState } from '@/components/common/error-state';
import { RecentActivityCard } from '@/components/dashboard/recent-activity-card';
import { QuickActionsCard } from '@/components/dashboard/quick-actions-card';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import {
  MetricsGridSkeleton,
  ChartSkeleton,
  RecentActivitySkeleton,
  AISuggestionsSkeleton,
} from '@/components/common/skeletons';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>(
    'expense',
  );

  const { dashboardData, refetch, error: dashboardError } = useDashboardData();

  const currentDate = new Date();
  const {
    data: monthlyCategorySpending,
    isLoading: isLoadingCategorySpending,
    error: categorySpendingError,
    clearCache: clearCategoryCache,
  } = useCategorySpending({
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

  // Check for welcome query parameter
  useEffect(() => {
    const welcomeParam = searchParams.get('welcome');
    if (welcomeParam === 'true') {
      setShowWelcome(true);
      // Clean up URL by removing query param
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams]);

  if (dashboardError) {
    return (
      <div className="flex-1 space-y-4 @sm:space-y-6 p-4 @sm:p-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
            Advanced financial insights and analytics.
          </p>
        </div>
        <ErrorState
          title="Failed to load dashboard"
          description={dashboardError}
          onRetry={() => refetch()}
          variant="card"
        />
      </div>
    );
  }

  const isLoadingDashboard = !dashboardData;

  return (
    <div className="flex-1 space-y-4 @sm:space-y-6 p-4 @sm:p-6">
      {showWelcome && <WelcomeBanner onDismiss={() => setShowWelcome(false)} />}

      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
          Advanced financial insights and analytics.
        </p>
      </div>

      {isLoadingDashboard ? (
        <>
          <MetricsGridSkeleton />
          <ChartSkeleton showTabs height="h-[400px]" />
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @sm:gap-6">
            <ChartSkeleton height="h-[250px] @sm:h-[300px]" />
            <ChartSkeleton height="h-[250px] @sm:h-[300px]" />
          </div>
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @sm:gap-6">
            <AISuggestionsSkeleton />
            <RecentActivitySkeleton />
          </div>
        </>
      ) : (
        <>
          <MetricsGrid data={dashboardData} />

          <FinancialTrendsChart dashboardData={dashboardData} />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 @3xl:grid-cols-2">
            <AccountDistributionChart />
            <TopCategoriesChart
              categorySpending={monthlyCategorySpending}
              isLoading={isLoadingCategorySpending}
              error={categorySpendingError}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 @3xl:grid-cols-2">
            <div className="order-1 @3xl:order-2">
              <RecentActivityCard recentTransactions={dashboardData.recentTransactions} />
            </div>
            <div className="order-2 @3xl:order-1">
              <QuickActionsCard onAddTransaction={handleAddTransaction} />
            </div>
          </div>
        </>
      )}

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
