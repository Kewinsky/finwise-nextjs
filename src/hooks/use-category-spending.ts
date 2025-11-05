'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCategorySpendingForMonth } from '@/lib/actions/finance-actions';

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  avgCategory?: number;
}

interface UseCategorySpendingParams {
  year: number;
  month: number; // 1-12
}

interface UseCategorySpendingResult {
  data: CategorySpending[];
  isLoading: boolean;
  error: string | null;
  clearCache: () => void;
}

/**
 * Hook to manage category spending data with caching
 */
export function useCategorySpending({
  year,
  month,
}: UseCategorySpendingParams): UseCategorySpendingResult {
  const [data, setData] = useState<CategorySpending[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, CategorySpending[]>>(new Map());

  const loadData = useCallback(async () => {
    const cacheKey = `${year}-${month}`;

    if (cacheRef.current.has(cacheKey)) {
      setData(cacheRef.current.get(cacheKey)!);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getCategorySpendingForMonth(year, month);
      if (result.success) {
        const categoryData = result.data || [];
        setData(categoryData);
        cacheRef.current.set(cacheKey, categoryData);
        setError(null);
      } else {
        const errorMessage = result.error || 'Failed to load category data';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error loading monthly category data:', error);
      setError('Failed to load category data');
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, clearCache };
}
