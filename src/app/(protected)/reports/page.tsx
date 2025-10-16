'use client';

import { SiteHeader } from '@/components/layout/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Eye,
  Share2,
} from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      name: 'Monthly Revenue Report',
      description: 'Comprehensive revenue analysis for the current month',
      type: 'financial',
      status: 'ready',
      lastGenerated: '2024-01-15',
      size: '2.4 MB',
      format: 'PDF',
      views: 24,
      downloads: 8,
    },
    {
      id: 2,
      name: 'User Engagement Analytics',
      description: 'Detailed user behavior and engagement metrics',
      type: 'analytics',
      status: 'generating',
      lastGenerated: '2024-01-14',
      size: '1.8 MB',
      format: 'Excel',
      views: 18,
      downloads: 5,
    },
    {
      id: 3,
      name: 'Project Performance Summary',
      description: 'Overview of all project milestones and deliverables',
      type: 'project',
      status: 'ready',
      lastGenerated: '2024-01-13',
      size: '3.2 MB',
      format: 'PDF',
      views: 31,
      downloads: 12,
    },
    {
      id: 4,
      name: 'Team Productivity Report',
      description: 'Team member performance and productivity metrics',
      type: 'hr',
      status: 'scheduled',
      lastGenerated: '2024-01-12',
      size: '1.5 MB',
      format: 'Excel',
      views: 15,
      downloads: 3,
    },
    {
      id: 5,
      name: 'Customer Satisfaction Survey',
      description: 'Quarterly customer feedback and satisfaction scores',
      type: 'customer',
      status: 'ready',
      lastGenerated: '2024-01-10',
      size: '2.1 MB',
      format: 'PDF',
      views: 42,
      downloads: 19,
    },
    {
      id: 6,
      name: 'System Performance Metrics',
      description: 'Server performance, uptime, and technical metrics',
      type: 'technical',
      status: 'ready',
      lastGenerated: '2024-01-09',
      size: '4.7 MB',
      format: 'CSV',
      views: 8,
      downloads: 2,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'generating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <TrendingUp className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'project':
        return <FileText className="h-4 w-4" />;
      case 'hr':
        return <Calendar className="h-4 w-4" />;
      case 'customer':
        return <PieChart className="h-4 w-4" />;
      case 'technical':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'PDF':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Excel':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CSV':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <>
      <SiteHeader title="Reports" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
                <p className="text-muted-foreground">Generate and manage your business reports</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.length}</div>
                  <p className="text-xs text-muted-foreground">+2 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ready</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports.filter((r) => r.status === 'ready').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Available for download</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports.reduce((sum, r) => sum + r.views, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all reports</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports.reduce((sum, r) => sum + r.downloads, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(report.type)}
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                        </div>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                      <Badge className={getFormatColor(report.format)}>{report.format}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Report Details */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Last Generated:</span>
                          <span>{new Date(report.lastGenerated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{report.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Views:</span>
                          <span>{report.views}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downloads:</span>
                          <span>{report.downloads}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={report.status !== 'ready'}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={report.status !== 'ready'}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" disabled={report.status !== 'ready'}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Generate common reports with one click</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Revenue Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Calendar className="h-6 w-6" />
                    <span>Team Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <PieChart className="h-6 w-6" />
                    <span>Custom Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
