'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { Zap, Target } from 'lucide-react';

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

interface AISuggestionsCardProps {
  financialHealthScore: FinancialHealthScore | null;
  aiInsights: AIInsights | null;
  isLoadingInsights: boolean;
}

export function AISuggestionsCard({
  financialHealthScore,
  aiInsights,
  isLoadingInsights,
}: AISuggestionsCardProps) {
  if (isLoadingInsights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart AI Suggestions
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner message="Generating insights..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiInsights || aiInsights.recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart AI Suggestions
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Target className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No AI suggestions available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add more transaction data to get personalized recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Smart AI Suggestions
        </CardTitle>
        <CardDescription>Personalized recommendations based on your financial data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Financial Health Score */}
          {financialHealthScore && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Financial Health Score</span>
                <span className="text-2xl font-bold text-primary">
                  {financialHealthScore.overallScore}/100
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    financialHealthScore.overallScore >= 80
                      ? 'bg-green-500'
                      : financialHealthScore.overallScore >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${financialHealthScore.overallScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{aiInsights.scoreExplanation}</p>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">AI Recommendations</span>
            </div>
            <div className="space-y-3">
              {aiInsights.recommendations.slice(0, 4).map((recommendation, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          {aiInsights.insights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Key Insights</span>
              </div>
              <div className="space-y-2">
                {aiInsights.insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
