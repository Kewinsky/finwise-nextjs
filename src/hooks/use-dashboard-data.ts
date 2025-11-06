'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getDashboardData,
  getSimpleFinancialHealthScore,
  generateInsights,
} from '@/lib/actions/finance-actions';
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

interface AIInsights {
  insights: string[];
  recommendations: string[];
  scoreExplanation: string;
}

interface UseDashboardDataResult {
  dashboardData: DashboardMetrics | null;
  financialHealthScore: FinancialHealthScore | null;
  aiInsights: AIInsights | null;
  isLoadingInsights: boolean;
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
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
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

  const loadAIInsights = useCallback(async () => {
    if (!financialHealthScore) return;

    // Check if score is valid (not null and not NaN)
    const isValidScore =
      financialHealthScore &&
      typeof financialHealthScore.overallScore === 'number' &&
      !isNaN(financialHealthScore.overallScore) &&
      financialHealthScore.overallScore >= 0 &&
      financialHealthScore.overallScore <= 100;

    if (!isValidScore) return;

    setIsLoadingInsights(true);
    try {
      const result = await generateInsights();
      if (result.success && 'data' in result) {
        const insights = result.data;
        const score = financialHealthScore.overallScore;

        let scoreExplanation = '';
        if (score >= 80) {
          scoreExplanation =
            'Excellent! Your financial health is in great shape. You have strong savings habits and good financial discipline.';
        } else if (score >= 60) {
          scoreExplanation =
            'Good progress! You have a solid financial foundation with room for improvement in some areas.';
        } else if (score >= 40) {
          scoreExplanation =
            'Fair financial health. Focus on building better savings habits and reducing expenses.';
        } else {
          scoreExplanation =
            'Needs attention. Consider creating a budget and focusing on basic financial fundamentals.';
        }

        setAiInsights({
          insights: insights.spendingInsights || [],
          recommendations: insights.savingsTips || [],
          scoreExplanation,
        });
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [financialHealthScore]);

  useEffect(() => {
    Promise.all([loadDashboardData(), loadFinancialHealthScore()]).catch((error) => {
      console.error('Error loading dashboard data:', error);
    });
  }, [loadDashboardData, loadFinancialHealthScore]);

  useEffect(() => {
    if (financialHealthScore) {
      loadAIInsights();
    }
  }, [financialHealthScore, loadAIInsights]);

  return {
    dashboardData,
    financialHealthScore,
    aiInsights,
    isLoadingInsights,
    error,
    refetch: loadDashboardData,
  };
}
