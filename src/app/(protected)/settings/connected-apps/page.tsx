'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Grid3X3,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { log } from '@/lib/logger';

interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  lastUsed: string;
  permissions: string[];
  category: string;
}

interface AvailableApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const connectedApps: ConnectedApp[] = [
  {
    id: '1',
    name: 'GitHub',
    description: 'Connect your GitHub repositories for seamless integration',
    icon: '🐙',
    status: 'connected',
    lastUsed: '2024-01-15',
    permissions: ['Read repositories', 'Read user profile', 'Create issues'],
    category: 'Development',
  },
  {
    id: '2',
    name: 'Slack',
    description: 'Get notifications and updates in your Slack workspace',
    icon: '💬',
    status: 'connected',
    lastUsed: '2024-01-14',
    permissions: ['Send messages', 'Read workspace info', 'Manage channels'],
    category: 'Communication',
  },
  {
    id: '3',
    name: 'Google Drive',
    description: 'Sync and manage files with Google Drive',
    icon: '📁',
    status: 'disconnected',
    lastUsed: '2024-01-10',
    permissions: ['Read files', 'Write files', 'Manage folders'],
    category: 'Storage',
  },
];

const availableApps: AvailableApp[] = [
  {
    id: '4',
    name: 'Discord',
    description: 'Connect your Discord server for notifications and updates',
    icon: '🎮',
    category: 'Communication',
  },
  {
    id: '5',
    name: 'Trello',
    description: 'Sync your Trello boards and manage project cards',
    icon: '📋',
    category: 'Productivity',
  },
  {
    id: '6',
    name: 'Zapier',
    description: 'Automate workflows and connect with 5000+ apps',
    icon: '⚡',
    category: 'Automation',
  },
  {
    id: '7',
    name: 'Webhook',
    description: 'Send data to external webhooks and APIs',
    icon: '🔗',
    category: 'Integration',
  },
  {
    id: '8',
    name: 'Notion',
    description: 'Sync your Notion pages and databases',
    icon: '📝',
    category: 'Productivity',
  },
  {
    id: '9',
    name: 'Figma',
    description: 'Connect your Figma designs and prototypes',
    icon: '🎨',
    category: 'Design',
  },
];

export default function ConnectedAppsPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleConnect = async (appId: string) => {
    setIsLoading(appId);
    try {
      // TODO: Implement app connection logic
      log.info({ appId }, 'App connected');
      notifySuccess('App connected successfully', {
        description: 'The app is now authorized and ready to use.',
      });
    } catch {
      notifyError('Failed to connect app');
    } finally {
      setIsLoading(null);
    }
  };

  const handleDisconnect = async (appId: string) => {
    setIsLoading(appId);
    try {
      // TODO: Implement app disconnection logic
      log.info({ appId }, 'App disconnected');
      notifySuccess('App disconnected successfully', {
        description: 'The app has been removed from your account.',
      });
    } catch {
      notifyError('Failed to disconnect app');
    } finally {
      setIsLoading(null);
    }
  };

  const handleReconnect = async (appId: string) => {
    setIsLoading(appId);
    try {
      // TODO: Implement app reconnection logic
      log.info({ appId }, 'App reconnected');
      notifySuccess('App reconnected successfully', {
        description: 'The app has been re-authorized and is ready to use.',
      });
    } catch {
      notifyError('Failed to reconnect app');
    } finally {
      setIsLoading(null);
    }
  };

  const groupedApps = availableApps.reduce(
    (acc, app) => {
      if (!acc[app.category]) {
        acc[app.category] = [];
      }
      acc[app.category].push(app);
      return acc;
    },
    {} as Record<string, AvailableApp[]>,
  );

  return (
    <div className="space-y-4 @md:space-y-6">
      {/* Connected Apps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Connected Apps
          </CardTitle>
          <CardDescription>
            Manage your connected third-party applications and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedApps.length > 0 ? (
            <div className="space-y-3 @md:space-y-4">
              {connectedApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 @md:h-12 @md:w-12 items-center justify-center rounded-lg bg-muted text-xl @md:text-2xl">
                      {app.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{app.name}</h3>
                        {getStatusIcon(app.status)}
                        <Badge variant="secondary" className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{app.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Last used: {app.lastUsed}</span>
                        <span>•</span>
                        <span>{app.permissions.length} permissions</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={showPermissionsDialog === app.id}
                      onOpenChange={(open) => setShowPermissionsDialog(open ? app.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-purple-600" />
                            {app.name} Permissions
                          </DialogTitle>
                          <DialogDescription>
                            Manage what {app.name} can access in your account
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {app.permissions.map((permission, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{permission}</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                    {app.status === 'connected' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(app.id)}
                        disabled={isLoading === app.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReconnect(app.id)}
                        disabled={isLoading === app.id}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reconnect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Connected Apps</h3>
              <p className="text-muted-foreground mb-4">
                Connect your favorite apps to enhance your workflow
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Apps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Available Integrations
          </CardTitle>
          <CardDescription>
            Discover and connect new apps to expand your capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 @md:space-y-6">
            {Object.entries(groupedApps).map(([category, apps]) => (
              <div key={category} className="space-y-3 @md:space-y-4">
                <h3 className="text-base @md:text-lg font-semibold">{category}</h3>
                <div className="grid gap-3 @md:gap-4 @md:grid-cols-2 @lg:grid-cols-3">
                  {apps.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-lg border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
                            {app.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{app.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {app.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(app.id)}
                          disabled={isLoading === app.id}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {isLoading === app.id ? 'Connecting...' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
