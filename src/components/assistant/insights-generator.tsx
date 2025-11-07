'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lightbulb, Target, AlertCircle, BarChart3 } from 'lucide-react';
import type { FinancialInsights } from '@/types/finance.types';
import { UsageLimitModal } from './usage-limit-modal';
import { generateInsights, getLastInsights } from '@/lib/actions/finance-actions';
import { notifyError } from '@/lib/notifications';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import type { AIUsageData } from '@/hooks/use-ai-usage';
import type { PlanType } from '@/config/app';

interface InsightsGeneratorProps {
  usage: AIUsageData | null;
  canMakeQuery: boolean;
  isLimitReached: boolean;
  refetch: () => Promise<void>;
  planType?: PlanType;
}

export function InsightsGenerator({
  usage,
  canMakeQuery,
  isLimitReached,
  refetch,
  planType,
}: InsightsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<FinancialInsights | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Load last insights on mount
  useEffect(() => {
    const loadLastInsights = async () => {
      setIsLoading(true);
      const result = await getLastInsights();
      if (result.success && 'data' in result && result.data) {
        setInsights(result.data.insights);
        setGeneratedAt(result.data.generatedAt);
      }
      setIsLoading(false);
    };
    loadLastInsights();
  }, []);

  const handleGenerate = async () => {
    // Check limit before generating
    if (!canMakeQuery || isLimitReached) {
      setShowLimitModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateInsights();
      if (!result.success) {
        notifyError(result.error || 'Failed to generate insights');
        setIsGenerating(false);
        return;
      }

      if (!('data' in result) || !result.data) {
        notifyError('Failed to generate insights');
        setIsGenerating(false);
        return;
      }

      setInsights(result.data);
      setGeneratedAt(new Date());

      // Refetch usage to update the counter (shared context will update all components)
      await refetch();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (insights) {
    return (
      <div className="space-y-4">
        {/* Limit Modal */}
        {usage && (
          <UsageLimitModal
            open={showLimitModal}
            onOpenChange={setShowLimitModal}
            queryCount={usage.queryCount}
            limit={usage.limit}
            currentPlan={planType || 'free'}
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Generated Insights</h3>
            {generatedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Last generated: {formatDate(generatedAt)}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInsights(null)}
            disabled={!canMakeQuery || isLimitReached}
          >
            Generate New
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto">
          {/* Spending Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Spending Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.spendingInsights.map((insight, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {insight}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Savings Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Savings Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.savingsTips.map((tip, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {tip}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Optimization */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Budget Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.budgetOptimization.map((optimization, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {optimization}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Areas of Concern */}
          {insights.areasOfConcern.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Areas of Concern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.areasOfConcern.map((concern, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {concern}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Get AI-powered analysis of your financial data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoadingSpinner message="Loading insights..." className="py-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Limit Modal */}
      {usage && (
        <UsageLimitModal
          open={showLimitModal}
          onOpenChange={setShowLimitModal}
          queryCount={usage.queryCount}
          limit={usage.limit}
          currentPlan={planType || 'free'}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Insights
          </CardTitle>
          <CardDescription className="text-xs">
            Get AI-powered analysis of your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <LoadingSpinner
              size="default"
              variant="pinwheel"
              message="Generating insights..."
              className="py-4"
            />
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!canMakeQuery}
              className="w-full"
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Insights
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
