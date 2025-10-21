import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate percentage change between two values
 * @param current Current value
 * @param previous Previous value
 * @returns Percentage change (positive or negative)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage change for display
 * @param percentage Percentage change
 * @returns Formatted string with sign and color class
 */
export function formatPercentageChange(percentage: number): { text: string; isPositive: boolean } {
  const rounded = Math.round(percentage * 10) / 10; // Round to 1 decimal place
  const isPositive = rounded >= 0;
  const sign = isPositive ? '+' : '';
  return {
    text: `${sign}${rounded}%`,
    isPositive,
  };
}
