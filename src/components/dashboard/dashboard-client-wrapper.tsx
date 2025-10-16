'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { notifySuccess } from '@/lib/notifications';
import { PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubscriptionBanner } from '@/components/subscription/subscription-banner';
import type { SubscriptionStatusInfo } from '@/types/subscription.types';
import {
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  BarChart3,
  Settings,
} from 'lucide-react';

/**
 * Client wrapper for dashboard page
 * Handles user interactions and client-side state
 * This pattern separates server data fetching from client interactions
 */
interface DashboardClientWrapperProps {
  metrics: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  };
  recentActivity: Array<{
    id: number;
    type: string;
    message: string;
    user?: string;
    amount?: string;
    project?: string;
    report?: string;
    time: string;
  }>;
  upcomingTasks: Array<{
    id: number;
    title: string;
    dueDate: string;
    priority: string;
    category: string;
  }>;
  subscriptionInfo: SubscriptionStatusInfo | null;
}

export function DashboardClientWrapper({
  metrics,
  recentActivity: serverRecentActivity,
  upcomingTasks: serverUpcomingTasks,
  subscriptionInfo,
}: DashboardClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const hasShownToast = useRef(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const welcome = searchParams.get('welcome');

    if (success === 'true' && !hasShownToast.current) {
      hasShownToast.current = true;
      notifySuccess('Payment successful', {
        description: 'Your subscription has been activated and is ready to use.',
      });
      // Clean up URL without reloading using Next.js router
      setTimeout(() => {
        router.replace('/dashboard');
      }, 500);
    }

    if (welcome === 'true') {
      setShowWelcomeModal(true);
      // Clean up URL without reloading using Next.js router
      router.replace('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
  };

  // Map server data to display format with icons and colors
  const recentActivity = serverRecentActivity.map((activity) => {
    const iconMap = {
      user_signup: Users,
      payment: DollarSign,
      project: CheckCircle2,
      report: FileText,
    };

    const colorMap = {
      user_signup: 'text-green-500',
      payment: 'text-blue-500',
      project: 'text-purple-500',
      report: 'text-orange-500',
    };

    return {
      ...activity,
      icon: iconMap[activity.type as keyof typeof iconMap] || FileText,
      color: colorMap[activity.type as keyof typeof colorMap] || 'text-gray-500',
    };
  });

  const upcomingTasks = serverUpcomingTasks;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 lg:gap-6 lg:py-6 px-4 lg:px-6">
            <SubscriptionBanner subscriptionInfo={subscriptionInfo} />
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
                <p className="text-muted-foreground">
                  Here&apos;s your financial overview for today.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.totalBalance.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +5.2%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${metrics.monthlyIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +3.1%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${metrics.monthlyExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      -2.3%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.savingsRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +2.1%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Activity */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest financial transactions and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <IconComponent className="h-3 w-3" />
                              <span>
                                {activity.user ||
                                  activity.amount ||
                                  activity.project ||
                                  activity.report}
                              </span>
                              <span>•</span>
                              <span>{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Financial tasks and goals to complete</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.dueDate}</span>
                          </div>
                          <span>{task.category}</span>
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
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Plus className="h-6 w-6" />
                    <span>New Project</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Users className="h-6 w-6" />
                    <span>Add Team Member</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>View Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
              <PartyPopper className="h-6 w-6 text-green-600" />
              Welcome Aboard!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Your email has been verified and your account is now active. You&apos;re all set to
              explore all the features!
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Ready to get started?</p>
                <p className="text-muted-foreground">
                  Explore your dashboard and discover everything you can do with your new account.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={handleCloseWelcome} className="w-full sm:w-auto">
              Let&apos;s Go!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
