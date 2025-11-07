'use client';

import { useState, useEffect } from 'react';
import { getAIUsage } from '@/lib/actions/finance-actions';

export interface AIUsageData {
  queryCount: number;
  tokensUsed: number;
  limit: number;
  percentage: number;
  resetDate?: Date;
}

export interface UseAIUsageReturn {
  usage: AIUsageData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  canMakeQuery: boolean;
  isWarning: boolean;
  isLimitReached: boolean;
}

/**
 * Hook to fetch and manage AI usage data
 */
export function useAIUsage(): UseAIUsageReturn {
  const [usage, setUsage] = useState<AIUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
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
  };

  // Fetch once on mount
  useEffect(() => {
    fetchUsage();
  }, []);

  const canMakeQuery = usage ? usage.queryCount < usage.limit || usage.limit === Infinity : true;
  const isWarning = usage ? usage.percentage >= 80 && usage.percentage < 100 : false;
  const isLimitReached = usage
    ? usage.queryCount >= usage.limit && usage.limit !== Infinity
    : false;

  return {
    usage,
    isLoading,
    error,
    refetch: fetchUsage,
    canMakeQuery,
    isWarning,
    isLimitReached,
  };
}
