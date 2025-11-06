'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lightbulb, Target, AlertCircle, BarChart3 } from 'lucide-react';
import type { FinancialInsights } from '@/types/finance.types';

export function InsightsGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<FinancialInsights | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Mock insights generation
    setTimeout(() => {
      const mockInsights: FinancialInsights = {
        spendingInsights: [
          'Your spending on Food & Dining has increased by 15% this month compared to last month.',
          'You have 8 recurring subscriptions totaling $120/month.',
          'Your transportation costs are higher than average for your income level.',
        ],
        savingsTips: [
          'Consider canceling unused subscriptions to save $40/month.',
          'Set up automatic transfers of $200/month to your savings account.',
          'Review your dining out expenses - reducing by 20% could save $80/month.',
        ],
        budgetOptimization: [
          'Allocate 50% of income to needs, 30% to wants, and 20% to savings.',
          'Create separate budgets for variable expenses like entertainment.',
          'Track your spending weekly to stay within budget limits.',
        ],
        areasOfConcern: [
          'Your expenses exceed your income by 5% this month.',
          'You have limited emergency fund coverage (less than 1 month).',
        ],
      };

      setInsights(mockInsights);
      setIsGenerating(false);
    }, 2000);
  };

  if (insights) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Generated Insights</h3>
          <Button variant="outline" size="sm" onClick={() => setInsights(null)}>
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
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            variant="outline"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Insights'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
