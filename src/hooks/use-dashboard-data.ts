'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDashboardData, getSimpleFinancialHealthScore } from '@/lib/actions/finance-actions';
import { notifyError } from '@/lib/notifications';
import type { DashboardMetrics } from '@/types/finance.types';

interface FinancialHealthScore {
  overallScore: number;
  breakdown: {
    savingsRate: { score: number; weight: number };
    emergencyFund: { score: number; weight: number };
    debtManagement: { score: number; weight: number };
    consistency: { score: number; weight: number };
  };
}

interface UseDashboardDataResult {
  dashboardData: DashboardMetrics | null;
  financialHealthScore: FinancialHealthScore | null;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage dashboard data, financial health score, and AI insights
 */
export function useDashboardData(): UseDashboardDataResult {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [financialHealthScore, setFinancialHealthScore] = useState<FinancialHealthScore | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const result = await getDashboardData();
      if (result.success && 'data' in result) {
        setDashboardData(result.data as DashboardMetrics);
      } else {
        const errorMessage = result.error || 'Unknown error occurred';
        setError(errorMessage);
        notifyError('Failed to load dashboard data', {
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      const errorMessage = 'Please try refreshing the page';
      setError(errorMessage);
      notifyError('Failed to load dashboard data', {
        description: errorMessage,
      });
    }
  }, []);

  const loadFinancialHealthScore = useCallback(async () => {
    try {
      const healthResult = await getSimpleFinancialHealthScore();
      if (healthResult.success) {
        setFinancialHealthScore(healthResult.data || null);
      }
    } catch (error) {
      console.error('Failed to load financial health score:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadDashboardData(), loadFinancialHealthScore()]).catch((error) => {
      console.error('Error loading dashboard data:', error);
    });
  }, [loadDashboardData, loadFinancialHealthScore]);

  return {
    dashboardData,
    financialHealthScore,
    error,
    refetch: loadDashboardData,
  };
}
