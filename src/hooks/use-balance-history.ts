'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getBalanceHistory } from '@/lib/actions/finance-actions';
import { notifyError } from '@/lib/notifications';
import type { Account, BalanceHistoryChart, BalanceHistoryFilters } from '@/types/finance.types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CURRENT_YEAR = new Date().getFullYear();

interface UseBalanceHistoryParams {
  accounts: Account[];
}

interface UseBalanceHistoryResult {
  allBalanceHistory: BalanceHistoryChart[];
  selectedAccounts: Set<string>;
  selectedYear: number;
  isLoading: boolean;
  error: string | null;
  chartData: Array<Record<string, string | number>>;
  chartConfig: Record<string, { label: string; color: string }>;
  setSelectedAccounts: (accounts: Set<string>) => void;
  setSelectedYear: (year: number) => void;
  years: number[];
}

export function useBalanceHistory({ accounts }: UseBalanceHistoryParams): UseBalanceHistoryResult {
  const [allBalanceHistory, setAllBalanceHistory] = useState<BalanceHistoryChart[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i), []);

  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.size === 0) {
      setSelectedAccounts(new Set(accounts.map((account) => account.id)));
    }
  }, [accounts, selectedAccounts.size]);

  const loadBalanceHistory = useCallback(async () => {
    if (accounts.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const filters: BalanceHistoryFilters = {
        accountIds: accounts.map((account) => account.id),
        startDate: new Date(selectedYear, 0, 1),
        endDate: new Date(selectedYear, 11, 31),
        period: 'monthly',
      };

      const result = await getBalanceHistory(filters);

      if (result.success && 'data' in result && Array.isArray(result.data)) {
        setAllBalanceHistory(result.data);
        setError(null);
      } else {
        const errorMessage = 'error' in result ? result.error : 'Unknown error occurred';
        setError(errorMessage);
        notifyError('Failed to load balance history', {
          description: errorMessage,
        });
      }
    } catch {
      const errorMessage = 'Failed to load balance history';
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accounts, selectedYear]);

  useEffect(() => {
    loadBalanceHistory();
  }, [loadBalanceHistory]);

  const balanceHistory = useMemo(() => {
    return allBalanceHistory.filter((history) => selectedAccounts.has(history.accountId));
  }, [allBalanceHistory, selectedAccounts]);

  const chartData = useMemo(() => {
    const data = MONTHS.map((month, index) => {
      const monthData: Record<string, string | number> = {
        month: month.substring(0, 3),
        fullMonth: month,
      };

      Array.from(selectedAccounts).forEach((accountId) => {
        const historyPoint = balanceHistory.find((h) => h.accountId === accountId);
        const monthBalance = historyPoint?.data.find((d) => d.month === index + 1);
        monthData[accountId] = monthBalance?.balance || 0;
      });

      return monthData;
    });

    return data;
  }, [balanceHistory, selectedAccounts]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};

    Array.from(selectedAccounts).forEach((accountId) => {
      const account = accounts.find((acc) => acc.id === accountId);
      if (account) {
        config[accountId] = {
          label: account.name,
          color: account.color || '#3B82F6',
        };
      }
    });

    return config;
  }, [accounts, selectedAccounts]);

  return {
    allBalanceHistory,
    selectedAccounts,
    selectedYear,
    isLoading,
    error,
    chartData,
    chartConfig,
    setSelectedAccounts,
    setSelectedYear,
    years,
  };
}
