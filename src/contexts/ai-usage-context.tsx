'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { getAIUsage } from '@/lib/actions/finance-actions';
import type { AIUsageData, UseAIUsageReturn } from '@/hooks/use-ai-usage';

type AIUsageContextValue = UseAIUsageReturn;

export const AIUsageContext = React.createContext<AIUsageContextValue | null>(null);

export function useAIUsageContext() {
  const context = React.useContext(AIUsageContext);
  if (!context) {
    throw new Error('useAIUsageContext must be used within AIUsageProvider');
  }
  return context;
}

interface AIUsageProviderProps {
  children: React.ReactNode;
}

export function AIUsageProvider({ children }: AIUsageProviderProps) {
  const [usage, setUsage] = useState<AIUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAIUsage();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch AI usage');
      }

      if (!('data' in result) || !result.data) {
        throw new Error('No usage data returned');
      }

      // Calculate reset date (first day of next month)
      const now = new Date();
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      setUsage({
        queryCount: result.data.queryCount,
        tokensUsed: result.data.tokensUsed,
        limit: result.data.limit,
        percentage: result.data.percentage,
        resetDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI usage');
      // Set default values on error
      const now = new Date();
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      setUsage({
        queryCount: 0,
        tokensUsed: 0,
        limit: 5,
        percentage: 0,
        resetDate,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const canMakeQuery = usage ? usage.queryCount < usage.limit || usage.limit === Infinity : true;
  const isWarning = usage ? usage.percentage >= 80 && usage.percentage < 100 : false;
  const isLimitReached = usage
    ? usage.queryCount >= usage.limit && usage.limit !== Infinity
    : false;

  const value = React.useMemo<AIUsageContextValue>(
    () => ({
      usage,
      isLoading,
      error,
      refetch: fetchUsage,
      canMakeQuery,
      isWarning,
      isLimitReached,
    }),
    [usage, isLoading, error, fetchUsage, canMakeQuery, isWarning, isLimitReached],
  );

  return <AIUsageContext.Provider value={value}>{children}</AIUsageContext.Provider>;
}
