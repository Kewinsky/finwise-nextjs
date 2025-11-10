import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BrandLogo } from '../layout/brand-logo';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-0 shadow-2xl',
        'bg-background/80 backdrop-blur-xl',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-transparent before:to-purple-500/5 before:pointer-events-none',
        'dark:bg-background/90',
        className,
      )}
    >
      <CardHeader>
        <div className="flex justify-center">
          <BrandLogo href={null} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}
