'use client';

import React from 'react';
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

export const MetricCard = React.memo(function MetricCard({
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

    // Handle case when there are no transactions in current month and no previous data
    if (value === 0 && (previousValue === undefined || previousValue === null)) {
      return <span className="text-muted-foreground">No transactions this month</span>;
    }

    // Handle case when current value is 0 but previous value existed (show friendly message instead of -100%)
    if (value === 0 && previousValue !== undefined && previousValue !== null && previousValue > 0) {
      return <span className="text-muted-foreground">None this month {previousValueLabel}</span>;
    }

    // Handle case when both are 0
    if (previousValue === 0 && value === 0) {
      return <span className="text-muted-foreground">No change {previousValueLabel}</span>;
    }

    // Handle case when there's no previous data but current value exists
    if ((previousValue === undefined || previousValue === null) && value !== 0) {
      return <span className="text-muted-foreground">No previous data</span>;
    }

    // Normal percentage comparison (when both values exist and at least one is non-zero)
    const percentage = calculatePercentageChange(value, previousValue || 0);

    // Special case: when previous was 0 and current is positive, show as "new" instead of percentage
    if (previousValue === 0 && value > 0) {
      return (
        <span className="text-green-600 dark:text-green-400">
          New this month {previousValueLabel}
        </span>
      );
    }

    const { text, isPositive } = formatPercentageChange(percentage);
    const isGood = reverseComparison ? !isPositive : isPositive;

    return (
      <span
        className={isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
      >
        {text}
        {previousValue != null && ` ${previousValueLabel}`}
      </span>
    );
  };

  return (
    <Card
      className={cn(
        'bg-gradient-to-br shadow-lg flex flex-col',
        gradientFrom,
        gradientTo,
        borderColor,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn('text-sm font-medium truncate', textColor)}>{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent className="flex flex-col justify-end flex-1 mt-auto">
        <div className={cn('text-xl sm:text-2xl font-bold', valueColor)}>
          <NumberTicker
            value={value}
            decimalPlaces={decimalPlaces}
            delay={delay}
            className={cn('truncate', valueColor)}
          />
        </div>
        <p className={cn('text-xs truncate', subtitleColor)}>{renderSubtitle()}</p>
      </CardContent>
    </Card>
  );
});
