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
      totalRevenue: 45231.89,
      activeUsers: 2350,
      activeProjects: 12,
      conversionRate: 3.2,
    };

    const recentActivity = [
      {
        id: 1,
        type: 'user_signup',
        message: 'New user registered',
        user: 'john.doe@example.com',
        time: '2 minutes ago',
      },
      {
        id: 2,
        type: 'payment',
        message: 'Payment processed',
        amount: '$99.00',
        time: '5 minutes ago',
      },
      {
        id: 3,
        type: 'project',
        message: 'Project milestone completed',
        project: 'Website Redesign',
        time: '1 hour ago',
      },
      {
        id: 4,
        type: 'report',
        message: 'Monthly report generated',
        report: 'Revenue Analytics',
        time: '2 hours ago',
      },
    ];

    const upcomingTasks = [
      {
        id: 1,
        title: 'Review Q1 performance metrics',
        dueDate: 'Today',
        priority: 'high',
        assignee: 'Sarah Johnson',
      },
      {
        id: 2,
        title: 'Update project documentation',
        dueDate: 'Tomorrow',
        priority: 'medium',
        assignee: 'Michael Chen',
      },
      {
        id: 3,
        title: 'Team standup meeting',
        dueDate: 'In 2 hours',
        priority: 'high',
        assignee: 'All team members',
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
