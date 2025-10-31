'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMonthlyCashFlowTrend, getDailyCashFlowTrend } from '@/lib/actions/finance-actions';
import { notifyError } from '@/lib/notifications';
import type { DashboardMetrics } from '@/types/finance.types';

export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';
export type SeriesType = 'balance' | 'income' | 'expenses' | 'savings';

interface ChartDataItem {
  date?: string;
  month?: string;
  income: number;
  expenses: number;
}

export interface AreaChartDataPoint {
  date: string;
  label: string;
  value: number;
}

interface UseAreaChartParams {
  timeRange: TimeRange;
  series: SeriesType;
  dashboardData: DashboardMetrics | null;
}

interface UseAreaChartResult {
  data: AreaChartDataPoint[];
  isLoading: boolean;
  clearCache: () => void;
}

/**
 * Calculate date range based on time range selection
 */
function getDateRange(timeRange: TimeRange): { from: Date; to: Date } {
  const now = new Date();
  let from: Date;

  switch (timeRange) {
    case '1W':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3M':
      from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case '6M':
      from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      break;
    case '1Y':
      from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }

  let to = now;
  if (timeRange === '3M' || timeRange === '6M' || timeRange === '1Y') {
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return { from, to };
}

/**
 * Format label based on time range and data type
 * Parses YYYY-MM-DD dates as local dates to avoid timezone shifts
 */
function formatLabel(
  item: ChartDataItem,
  timeRange: TimeRange,
  index: number,
): { label: string; date: string } {
  if (timeRange === '1W' || timeRange === '1M') {
    const dateString = item.date?.split('T')[0] || '';
    if (dateString) {
      const [year, month, day] = dateString.split('-').map(Number);
      const dayDate = new Date(year, month - 1, day);
      const label = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label, date: dateString };
    }
    const fallbackDate = new Date();
    const label = fallbackDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label, date: dateString };
  }

  const label = item.month || `Month ${index + 1}`;
  const date = item.month || `Month ${index + 1}`;
  return { label, date };
}

/**
 * Transform data for balance series (cumulative from current balance backwards)
 */
function transformBalanceData(
  data: ChartDataItem[],
  currentBalance: number,
  timeRange: TimeRange,
): AreaChartDataPoint[] {
  let runningBalance = currentBalance;
  const balanceData: AreaChartDataPoint[] = [];

  for (let i = data.length - 1; i >= 0; i--) {
    const item = data[i];
    const netChange = (item.income || 0) - (item.expenses || 0);
    runningBalance -= netChange;

    const { label, date } = formatLabel(item, timeRange, i);
    balanceData.unshift({
      date,
      label,
      value: Math.max(0, runningBalance),
    });
  }

  return balanceData;
}

/**
 * Transform data for income, expenses, or savings series
 */
function transformSeriesData(
  data: ChartDataItem[],
  series: SeriesType,
  timeRange: TimeRange,
): AreaChartDataPoint[] {
  let cumulativeSavings = 0;

  return data.map((item, index) => {
    const { label, date } = formatLabel(item, timeRange, index);
    let value = 0;

    if (series === 'income') {
      value = item.income || 0;
    } else if (series === 'expenses') {
      value = item.expenses || 0;
    } else if (series === 'savings') {
      const periodSavings = (item.income || 0) - (item.expenses || 0);
      cumulativeSavings += periodSavings;
      value = cumulativeSavings;
    }

    return {
      date,
      label,
      value: series === 'savings' ? value : Math.max(0, value),
    };
  });
}

/**
 * Hook to manage area chart data with caching
 */
export function useAreaChart({
  timeRange,
  series,
  dashboardData,
}: UseAreaChartParams): UseAreaChartResult {
  const [data, setData] = useState<AreaChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<string, AreaChartDataPoint[]>>(new Map());

  const loadData = useCallback(async () => {
    if (!dashboardData) return;

    const cacheKey = `${timeRange}-${series}`;

    if (cacheRef.current.has(cacheKey)) {
      setData(cacheRef.current.get(cacheKey)!);
      return;
    }

    setIsLoading(true);
    try {
      const { from, to } = getDateRange(timeRange);
      const useDailyAggregation = timeRange === '1W' || timeRange === '1M';

      const result = useDailyAggregation
        ? await getDailyCashFlowTrend({ from, to })
        : await getMonthlyCashFlowTrend({ from, to });

      if (result.success) {
        const rawData = (result.data || []) as ChartDataItem[];
        let transformedData: AreaChartDataPoint[];

        if (series === 'balance') {
          transformedData = transformBalanceData(rawData, dashboardData.totalBalance, timeRange);
        } else {
          transformedData = transformSeriesData(rawData, series, timeRange);
        }

        setData(transformedData);
        cacheRef.current.set(cacheKey, transformedData);
      }
    } catch (error) {
      console.error('Error loading area chart data:', error);
      notifyError('Failed to load area chart data');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, series, dashboardData]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, clearCache };
}
