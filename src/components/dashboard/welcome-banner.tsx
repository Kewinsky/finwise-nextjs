'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeBannerProps {
  onDismiss: () => void;
}

export function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-600/20 dark:border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Finwise
              </span>
              ! 🎉
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              We&apos;re excited to have you here! Get started by adding your first account and
              transaction to begin tracking your finances.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => (window.location.href = '/accounts')}
              >
                Add Account
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-600/20 dark:border-purple-500/20 hover:border-blue-600 dark:hover:border-purple-500"
                onClick={() => (window.location.href = '/transactions')}
              >
                Add Transaction
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="flex-shrink-0"
            aria-label="Dismiss welcome message"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
