'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface NoDataStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'card' | 'inline';
  height?: string;
}

export function NoDataState({
  icon: Icon,
  title = 'No data available',
  description,
  className = '',
  variant = 'inline',
  height = 'h-[250px] sm:h-[300px]',
}: NoDataStateProps) {
  const content = (
    <div
      className={`flex items-center justify-center ${height} text-center text-muted-foreground ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        {Icon && (
          <div className="rounded-full bg-muted p-3 mb-2">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <p className="text-sm sm:text-base font-medium">{title}</p>
        {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card>
        <CardContent className="py-8">{content}</CardContent>
      </Card>
    );
  }

  return content;
}
