'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NumberTicker } from '@/components/ui/number-ticker';
import { calculatePercentageChange, formatPercentageChange } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  previousValue?: number;
  previousValueLabel?: string;
  customSubtitle?: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  valueColor: string;
  subtitleColor: string;
  delay?: number;
  decimalPlaces?: number;
  reverseComparison?: boolean;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  previousValue,
  previousValueLabel = 'from last month',
  customSubtitle,
  gradientFrom,
  gradientTo,
  borderColor,
  textColor,
  iconColor,
  valueColor,
  subtitleColor,
  delay = 0.1,
  decimalPlaces = 2,
  reverseComparison = false,
}: MetricCardProps) {
  const renderSubtitle = () => {
    if (customSubtitle) {
      return <span>{customSubtitle}</span>;
    }

    if (!previousValue) {
      return <span className="text-muted-foreground">No previous data</span>;
    }

    const percentage = calculatePercentageChange(value, previousValue);
    const { text, isPositive } = formatPercentageChange(percentage);
    const isGood = reverseComparison ? !isPositive : isPositive;

    return (
      <span
        className={isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
      >
        {text}
      </span>
    );
  };

  return (
    <Card className={cn('bg-gradient-to-br shadow-lg', gradientFrom, gradientTo, borderColor)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn('text-sm font-medium', textColor)}>{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueColor)}>
          <NumberTicker
            value={value}
            decimalPlaces={decimalPlaces}
            delay={delay}
            className={valueColor}
          />
        </div>
        <p className={cn('text-xs', subtitleColor)}>
          {renderSubtitle()}
          {previousValue != null && !customSubtitle && ` ${previousValueLabel}`}
        </p>
      </CardContent>
    </Card>
  );
}
