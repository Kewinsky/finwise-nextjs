import { Suspense } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { DashboardClientWrapper } from '@/components/dashboard/dashboard-client-wrapper';
import { SubscriptionService } from '@/services/subscription.service';
import { createClientForServer } from '@/utils/supabase/server';
import {
  validateAuthenticatedUser,
  handleProtectedRouteError,
} from '@/lib/utils/protected-route-utils';

/**
 * Server component for dashboard
 * Fetches dashboard data including subscription status
 */
async function DashboardData() {
  try {
    const user = await validateAuthenticatedUser();

    const supabase = await createClientForServer();
    const subscriptionService = new SubscriptionService(supabase);
    const subscriptionResult = await subscriptionService.getUserSubscription(user.id);

    const subscriptionInfo = subscriptionResult.success
      ? subscriptionService.getSubscriptionStatusInfo(subscriptionResult.data)
      : null;

    // Mock dashboard data - in a real app, these would be actual API calls
    const metrics = {
      totalBalance: 45231.89,
      monthlyIncome: 8500.0,
      monthlyExpenses: 6200.0,
      savingsRate: 27.1,
    };

    const recentActivity = [
      {
        id: 1,
        type: 'expense',
        message: 'Expense added',
        amount: '$45.67',
        category: 'Groceries',
        time: '2 minutes ago',
      },
      {
        id: 2,
        type: 'income',
        message: 'Income recorded',
        amount: '$1,200.00',
        source: 'Salary',
        time: '5 minutes ago',
      },
      {
        id: 3,
        type: 'insight',
        message: 'AI insight generated',
        insight: 'You spent 15% more on dining this month',
        time: '1 hour ago',
      },
      {
        id: 4,
        type: 'goal',
        message: 'Goal progress updated',
        goal: 'Emergency Fund',
        progress: '75%',
        time: '2 hours ago',
      },
    ];

    const upcomingTasks = [
      {
        id: 1,
        title: 'Review monthly budget',
        dueDate: 'Today',
        priority: 'high',
        category: 'Budgeting',
      },
      {
        id: 2,
        title: 'Categorize pending transactions',
        dueDate: 'Tomorrow',
        priority: 'medium',
        category: 'Transactions',
      },
      {
        id: 3,
        title: 'Set up savings goal',
        dueDate: 'This week',
        priority: 'medium',
        category: 'Goals',
      },
    ];

    return {
      user,
      subscriptionInfo,
      metrics,
      recentActivity,
      upcomingTasks,
    };
  } catch (error) {
    handleProtectedRouteError(error, 'dashboard data');
  }
}

/**
 * Main dashboard page component
 * Uses Suspense for better perceived performance
 */
export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const { subscriptionInfo, metrics, recentActivity, upcomingTasks } = await DashboardData();

  return (
    <>
      <SiteHeader title="Dashboard" />
      <DashboardClientWrapper
        metrics={metrics}
        recentActivity={recentActivity}
        upcomingTasks={upcomingTasks}
        subscriptionInfo={subscriptionInfo}
      />
    </>
  );
}
