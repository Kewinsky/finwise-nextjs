'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'card' | 'inline';
}

export function ErrorState({
  title = 'Failed to load data',
  description = 'Something went wrong while loading this section. Please try again.',
  onRetry,
  className = '',
  variant = 'inline',
}: ErrorStateProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="rounded-full bg-destructive/10 p-3 mb-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card>
        <CardContent className="py-8">{content}</CardContent>
      </Card>
    );
  }

  return <div className="py-8">{content}</div>;
}
