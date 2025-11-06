import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type {
  FinancialInsights,
  AIQuestionResponse,
  MonthlySummary,
  CategorySpending,
  SpendingTrends,
  AccountBalance,
  RecentTransaction,
} from '@/types/finance.types';
import { log } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants/errors';
import { TransactionService } from './transaction.service';
import { AccountService } from './account.service';
import { callOpenAI } from '@/lib/openai/client';
import { isOpenAIConfigured } from '@/lib/openai/config';

/**
 * AIAssistantService handles AI-powered financial insights and analysis
 *
 * Responsibilities:
 * - Generate financial insights based on transaction data
 * - Provide AI-powered recommendations
 * - Answer financial questions
 * - Analyze spending patterns and trends
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const aiService = new AIAssistantService(supabase);
 *
 * const result = await aiService.generateInsights(userId);
 * if (result.success) {
 *   console.log('Spending insights:', result.data.spendingInsights);
 * }
 * ```
 */
export class AIAssistantService {
  private transactionService: TransactionService;
  private accountService: AccountService;

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.transactionService = new TransactionService(supabase);
    this.accountService = new AccountService(supabase);
  }

  /**
   * Generate comprehensive financial insights for a user
   */
  async generateInsights(userId: string): Promise<ServiceResult<FinancialInsights>> {
    try {
      log.info({ userId }, 'Generating financial insights');

      // Gather data for analysis
      const [
        monthlySummaryResult,
        categorySpendingResult,
        spendingTrendsResult,
        accountBalancesResult,
      ] = await Promise.all([
        this.transactionService.getMonthlySummary(userId),
        this.transactionService.getCategorySpending(userId, 'expense'),
        this.transactionService.getSpendingTrends(userId, 30),
        this.accountService.getAccountBalances(userId),
      ]);

      // Check if we have enough data
      if (!monthlySummaryResult.success || !categorySpendingResult.success) {
        return { success: false, error: 'Unable to gather financial data for analysis' };
      }

      const monthlySummary = monthlySummaryResult.data;
      const categorySpending = categorySpendingResult.data;
      const spendingTrends = spendingTrendsResult.success ? spendingTrendsResult.data : [];
      const accountBalances = accountBalancesResult.success ? accountBalancesResult.data : [];

      // Try to use AI for insights if configured, otherwise use rule-based analysis
      let insights: FinancialInsights;

      if (isOpenAIConfigured()) {
        try {
          log.info({ userId }, 'Using OpenAI API for insights generation');
          const aiInsights = await this.generateAIInsights({
            monthlySummary,
            categorySpending,
            spendingTrends,
            accountBalances,
          });

          if (aiInsights) {
            insights = aiInsights;
          } else {
            // Fallback to rule-based if AI fails
            log.warn({ userId }, 'AI insights generation failed, using rule-based fallback');
            insights = this.analyzeFinancialData({
              monthlySummary,
              categorySpending,
              spendingTrends,
              accountBalances,
            });
          }
        } catch (error) {
          log.error(error, 'Error generating AI insights, using rule-based fallback');
          insights = this.analyzeFinancialData({
            monthlySummary,
            categorySpending,
            spendingTrends,
            accountBalances,
          });
        }
      } else {
        // Use rule-based analysis
        log.info({ userId }, 'OpenAI not configured, using rule-based insights');
        insights = this.analyzeFinancialData({
          monthlySummary,
          categorySpending,
          spendingTrends,
          accountBalances,
        });
      }

      log.info({ userId }, 'Financial insights generated successfully');
      return { success: true, data: insights };
    } catch (error) {
      log.error(error, 'Error generating financial insights');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Answer a financial question using transaction data
   */
  async askQuestion(userId: string, message: string): Promise<ServiceResult<AIQuestionResponse>> {
    try {
      log.info({ userId, messageLength: message.length }, 'Processing AI question');

      // Gather financial context
      const [
        monthlySummaryResult,
        categorySpendingResult,
        recentTransactionsResult,
        accountBalancesResult,
      ] = await Promise.all([
        this.transactionService.getMonthlySummary(userId),
        this.transactionService.getCategorySpending(userId, 'expense'),
        this.transactionService.getRecentTransactions(userId, 10),
        this.accountService.getAccountBalances(userId),
      ]);

      // Build context for AI
      const context = {
        monthlySummary: monthlySummaryResult.success
          ? {
              totalIncome: monthlySummaryResult.data.totalIncome,
              totalExpenses: monthlySummaryResult.data.totalExpenses,
              savings: monthlySummaryResult.data.savings,
              transactionCount: monthlySummaryResult.data.transactionCount,
            }
          : undefined,
        categorySpending: categorySpendingResult.success
          ? categorySpendingResult.data.slice(0, 5).map((c) => ({
              category: c.category,
              amount: c.totalAmount || 0,
              percentage: c.percentage || 0,
            }))
          : undefined,
        recentTransactions: recentTransactionsResult.success
          ? recentTransactionsResult.data.map((t) => ({
              description: t.description,
              amount: t.amount,
              category: t.category,
              date: t.date,
              type: t.type,
            }))
          : undefined,
        accountBalances: accountBalancesResult.success
          ? accountBalancesResult.data.map((acc) => ({
              accountName: acc.accountName,
              balance: acc.balance,
              accountType: acc.accountType,
            }))
          : undefined,
      };

      // Try OpenAI first, fallback to mock if not configured
      let answer: string;
      const suggestions: string[] = [];
      const relatedData: {
        transactions?: RecentTransaction[];
        accounts?: AccountBalance[];
      } = {};

      if (isOpenAIConfigured()) {
        // Use real OpenAI API
        log.info({ userId }, 'Using OpenAI API for question');
        const aiResponse = await callOpenAI(message, context);

        if (aiResponse.error) {
          log.warn({ userId, error: aiResponse.error }, 'OpenAI API error, using fallback');
          // Fallback to mock response
          const mockResponse = await this.generateMockResponse(userId, message);
          answer = mockResponse.answer;
          if (mockResponse.suggestions) {
            suggestions.push(...mockResponse.suggestions);
          }
        } else {
          answer = aiResponse.content;
          // Generate suggestions based on context
          if (context.monthlySummary) {
            suggestions.push('Show me my spending by category');
            suggestions.push('What are my biggest expenses this month?');
          }
          if (context.accountBalances && context.accountBalances.length > 0) {
            suggestions.push('Show me my account details');
          }
          suggestions.push('How can I save more money?');
          suggestions.push('What should I budget for?');
        }
      } else {
        // Fallback to mock response
        log.info({ userId }, 'OpenAI not configured, using mock response');
        const mockResponse = await this.generateMockResponse(userId, message);
        answer = mockResponse.answer;
        if (mockResponse.suggestions) {
          suggestions.push(...mockResponse.suggestions);
        }
      }

      // Add related data
      if (recentTransactionsResult.success) {
        relatedData.transactions = recentTransactionsResult.data;
      }
      if (accountBalancesResult.success) {
        relatedData.accounts = accountBalancesResult.data;
      }

      log.info({ userId }, 'AI question processed successfully');
      return {
        success: true,
        data: {
          answer,
          suggestions,
          relatedData,
        },
      };
    } catch (error) {
      log.error(error, 'Error processing AI question');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Generate insights using AI (when OpenAI is configured)
   */
  private async generateAIInsights(data: {
    monthlySummary: MonthlySummary;
    categorySpending: CategorySpending[];
    spendingTrends: SpendingTrends[];
    accountBalances: AccountBalance[];
  }): Promise<FinancialInsights | null> {
    try {
      const { monthlySummary, categorySpending, accountBalances } = data;

      // Build comprehensive prompt for AI
      const prompt = `Analyze the following financial data and provide insights:

Monthly Summary:
- Total Income: $${monthlySummary.totalIncome.toFixed(2)}
- Total Expenses: $${monthlySummary.totalExpenses.toFixed(2)}
- Savings: $${monthlySummary.savings.toFixed(2)}
- Transaction Count: ${monthlySummary.transactionCount}

Top Spending Categories:
${categorySpending
  .slice(0, 5)
  .map((c) => `- ${c.category}: $${(c.totalAmount || 0).toFixed(2)} (${c.percentage.toFixed(1)}%)`)
  .join('\n')}

Account Balances:
${accountBalances.map((acc) => `- ${acc.accountName} (${acc.accountType}): $${acc.balance.toFixed(2)}`).join('\n')}

Please provide:
1. 3-4 spending insights (what patterns you notice)
2. 3-4 savings tips (actionable advice)
3. 2-3 budget optimization suggestions
4. 2-3 areas of concern (if any)

Format your response as a JSON object with these exact keys:
{
  "spendingInsights": ["insight1", "insight2", ...],
  "savingsTips": ["tip1", "tip2", ...],
  "budgetOptimization": ["suggestion1", "suggestion2", ...],
  "areasOfConcern": ["concern1", "concern2", ...]
}

Be concise, specific, and use actual numbers from the data.`;

      const systemPrompt = `You are a financial advisor AI. Analyze user financial data and provide clear, actionable insights. Always format responses as valid JSON.`;

      const aiResponse = await callOpenAI(
        prompt,
        {
          monthlySummary: {
            totalIncome: monthlySummary.totalIncome,
            totalExpenses: monthlySummary.totalExpenses,
            savings: monthlySummary.savings,
            transactionCount: monthlySummary.transactionCount,
          },
          categorySpending: categorySpending.slice(0, 5).map((c) => ({
            category: c.category,
            amount: c.totalAmount || 0,
            percentage: c.percentage || 0,
          })),
          accountBalances: accountBalances.map((acc) => ({
            accountName: acc.accountName,
            balance: acc.balance,
            accountType: acc.accountType,
          })),
        },
        systemPrompt,
      );

      if (aiResponse.error || !aiResponse.content) {
        return null;
      }

      // Try to parse JSON response
      try {
        // Extract JSON from response (sometimes AI wraps it in markdown)
        const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          log.warn('Could not extract JSON from AI response');
          return null;
        }

        const parsed = JSON.parse(jsonMatch[0]) as FinancialInsights;

        // Validate structure
        if (
          Array.isArray(parsed.spendingInsights) &&
          Array.isArray(parsed.savingsTips) &&
          Array.isArray(parsed.budgetOptimization) &&
          Array.isArray(parsed.areasOfConcern)
        ) {
          return parsed;
        }

        log.warn('AI response structure invalid');
        return null;
      } catch (parseError) {
        log.error(parseError, 'Failed to parse AI response as JSON');
        return null;
      }
    } catch (error) {
      log.error(error, 'Error in generateAIInsights');
      return null;
    }
  }

  /**
   * Analyze financial data and generate insights
   */
  private analyzeFinancialData(data: {
    monthlySummary: MonthlySummary;
    categorySpending: CategorySpending[];
    spendingTrends: SpendingTrends[];
    accountBalances: AccountBalance[];
  }): FinancialInsights {
    const { monthlySummary, categorySpending, spendingTrends, accountBalances } = data;

    const spendingInsights: string[] = [];
    const savingsTips: string[] = [];
    const budgetOptimization: string[] = [];
    const areasOfConcern: string[] = [];

    // Spending Insights
    if (monthlySummary.totalExpenses > monthlySummary.totalIncome) {
      spendingInsights.push(
        "You're spending more than you earn this month. Consider reviewing your expenses.",
      );
    }

    if (categorySpending.length > 0) {
      const topCategory = categorySpending[0];
      spendingInsights.push(
        `Your highest spending category is ${topCategory.category} (${topCategory.percentage.toFixed(1)}% of expenses).`,
      );
    }

    if (monthlySummary.transactionCount > 50) {
      spendingInsights.push(
        'You have many transactions this month. Consider consolidating smaller purchases.',
      );
    }

    // Savings Tips
    if (monthlySummary.savings < 0) {
      savingsTips.push(
        "You're currently spending more than you earn. Focus on reducing expenses or increasing income.",
      );
    } else if (monthlySummary.savings < monthlySummary.totalIncome * 0.1) {
      savingsTips.push('Consider increasing your savings rate to at least 10% of your income.');
    } else {
      savingsTips.push('Great job maintaining a healthy savings rate!');
    }

    savingsTips.push(
      'Set up automatic transfers to your savings account to build wealth consistently.',
    );
    savingsTips.push('Review your subscriptions regularly and cancel unused services.');

    // Budget Optimization
    if (categorySpending.length > 0) {
      const topCategories = categorySpending.slice(0, 3);
      budgetOptimization.push(
        `Focus on optimizing your top spending categories: ${topCategories.map((c) => c.category).join(', ')}.`,
      );
    }

    budgetOptimization.push(
      'Use the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings.',
    );
    budgetOptimization.push('Track your variable expenses weekly to stay within budget.');

    // Areas of Concern
    if (monthlySummary.totalExpenses > monthlySummary.totalIncome * 1.2) {
      areasOfConcern.push(
        'Your expenses exceed your income by more than 20%. This is unsustainable long-term.',
      );
    }

    if (accountBalances.some((account) => account.balance < 0)) {
      areasOfConcern.push('You have accounts with negative balances. Address this immediately.');
    }

    if (spendingTrends.length > 0) {
      const recentSpending = spendingTrends.slice(-7).reduce((sum, trend) => sum + trend.amount, 0);
      const avgDailySpending = recentSpending / 7;
      if (avgDailySpending > (monthlySummary.totalExpenses / 30) * 1.5) {
        areasOfConcern.push(
          'Your recent daily spending is significantly higher than your monthly average.',
        );
      }
    }

    return {
      spendingInsights,
      savingsTips,
      budgetOptimization,
      areasOfConcern,
    };
  }

  /**
   * Generate mock response for AI questions (fallback when OpenAI is not configured)
   */
  private async generateMockResponse(userId: string, message: string): Promise<AIQuestionResponse> {
    const lowerMessage = message.toLowerCase();

    // Get recent data for context
    const recentTransactionsResult = await this.transactionService.getRecentTransactions(
      userId,
      10,
    );
    const monthlySummaryResult = await this.transactionService.getMonthlySummary(userId);

    let answer = '';
    const suggestions: string[] = [];
    const relatedData: {
      transactions?: RecentTransaction[];
      accounts?: AccountBalance[];
    } = {};

    if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
      answer = 'Based on your recent transactions, I can help you analyze your spending patterns. ';

      if (monthlySummaryResult.success) {
        const summary = monthlySummaryResult.data;
        answer += `This month you've spent $${summary.totalExpenses.toFixed(2)} across ${summary.transactionCount} transactions. `;

        if (summary.totalExpenses > summary.totalIncome) {
          answer +=
            "I notice you're spending more than you earn this month. Consider reviewing your expenses.";
        } else {
          answer += 'Your spending looks manageable relative to your income.';
        }
      }

      suggestions.push('Show me my spending by category');
      suggestions.push('What are my biggest expenses this month?');
      suggestions.push('How can I reduce my spending?');
    } else if (lowerMessage.includes('saving') || lowerMessage.includes('budget')) {
      answer = 'Let me help you with savings and budgeting strategies. ';

      if (monthlySummaryResult.success) {
        const summary = monthlySummaryResult.data;
        answer += `This month you've saved $${summary.savings.toFixed(2)}. `;

        if (summary.savings > 0) {
          answer +=
            'Great job maintaining positive savings! Consider setting up automatic transfers to build wealth consistently.';
        } else {
          answer +=
            "You're currently spending more than you earn. Focus on reducing expenses or increasing income.";
        }
      }

      suggestions.push('How much should I save each month?');
      suggestions.push("What's the 50/30/20 rule?");
      suggestions.push('Show me my monthly budget breakdown');
    } else if (lowerMessage.includes('balance') || lowerMessage.includes('account')) {
      answer = 'Let me check your account balances. ';

      const accountBalancesResult = await this.accountService.getAccountBalances(userId);
      if (accountBalancesResult.success) {
        const balances = accountBalancesResult.data;
        const totalBalance = balances.reduce((sum, account) => sum + account.balance, 0);
        answer += `Your total balance across all accounts is $${totalBalance.toFixed(2)}. `;

        if (balances.length > 1) {
          answer += `You have ${balances.length} accounts. Consider consolidating if you have too many.`;
        }
      }

      suggestions.push('Show me my account details');
      suggestions.push('How can I optimize my account structure?');
      suggestions.push("What's my net worth?");
    } else {
      answer =
        'I can help you with questions about your spending, savings, budgeting, and account management. ';
      answer += 'Try asking about your recent transactions, monthly spending, or savings goals.';

      suggestions.push('What are my spending patterns?');
      suggestions.push('How much am I saving?');
      suggestions.push('Show me my recent transactions');
      suggestions.push('What should I budget for?');
    }

    if (recentTransactionsResult.success) {
      relatedData.transactions = recentTransactionsResult.data;
    }

    return {
      answer,
      suggestions,
      relatedData,
    };
  }

  /**
   * Get spending pattern analysis
   */
  async getSpendingPatterns(userId: string): Promise<
    ServiceResult<{
      patterns: string[];
      recommendations: string[];
    }>
  > {
    try {
      log.info({ userId }, 'Analyzing spending patterns');

      const [categorySpendingResult, spendingTrendsResult] = await Promise.all([
        this.transactionService.getCategorySpending(userId, 'expense'),
        this.transactionService.getSpendingTrends(userId, 30),
      ]);

      if (!categorySpendingResult.success) {
        return { success: false, error: 'Unable to analyze spending patterns' };
      }

      const categorySpending = categorySpendingResult.data;
      const spendingTrends = spendingTrendsResult.success ? spendingTrendsResult.data : [];

      const patterns: string[] = [];
      const recommendations: string[] = [];

      // Analyze category patterns
      if (categorySpending.length > 0) {
        const topCategory = categorySpending[0];
        patterns.push(
          `You spend most on ${topCategory.category} (${topCategory.percentage.toFixed(1)}% of expenses)`,
        );

        if (topCategory.percentage > 40) {
          recommendations.push(
            `Consider diversifying your spending - ${topCategory.category} represents a large portion of your budget`,
          );
        }
      }

      // Analyze trend patterns
      if (spendingTrends.length > 7) {
        const recentWeek = spendingTrends.slice(-7);
        const previousWeek = spendingTrends.slice(-14, -7);

        const recentTotal = recentWeek.reduce((sum, trend) => sum + trend.amount, 0);
        const previousTotal = previousWeek.reduce((sum, trend) => sum + trend.amount, 0);

        const changePercent = ((recentTotal - previousTotal) / previousTotal) * 100;

        if (Math.abs(changePercent) > 20) {
          patterns.push(
            `Your spending ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}% compared to last week`,
          );
        }
      }

      // General recommendations
      recommendations.push('Track your variable expenses weekly to identify spending patterns');
      recommendations.push('Set spending limits for discretionary categories');
      recommendations.push('Review and optimize your recurring subscriptions monthly');

      log.info({ userId }, 'Spending patterns analyzed successfully');
      return { success: true, data: { patterns, recommendations } };
    } catch (error) {
      log.error(error, 'Error analyzing spending patterns');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get financial health score
   */
  async getFinancialHealthScore(userId: string): Promise<
    ServiceResult<{
      score: number;
      factors: string[];
      recommendations: string[];
    }>
  > {
    try {
      log.info({ userId }, 'Calculating financial health score');

      const [monthlySummaryResult, accountBalancesResult] = await Promise.all([
        this.transactionService.getMonthlySummary(userId),
        this.accountService.getAccountBalances(userId),
      ]);

      if (!monthlySummaryResult.success || !accountBalancesResult.success) {
        return { success: false, error: 'Unable to calculate financial health score' };
      }

      const monthlySummary = monthlySummaryResult.data;
      const accountBalances = accountBalancesResult.data;

      let score = 0;
      const factors: string[] = [];
      const recommendations: string[] = [];

      // Income vs Expenses (40% of score)
      if (monthlySummary.totalIncome > 0) {
        const expenseRatio = monthlySummary.totalExpenses / monthlySummary.totalIncome;
        if (expenseRatio <= 0.5) {
          score += 40;
          factors.push('Excellent expense-to-income ratio (≤50%)');
        } else if (expenseRatio <= 0.7) {
          score += 30;
          factors.push('Good expense-to-income ratio (≤70%)');
        } else if (expenseRatio <= 0.9) {
          score += 20;
          factors.push('Moderate expense-to-income ratio (≤90%)');
        } else {
          score += 0;
          factors.push('High expense-to-income ratio (>90%)');
          recommendations.push('Reduce expenses or increase income to improve financial health');
        }
      }

      // Savings Rate (30% of score)
      if (monthlySummary.totalIncome > 0) {
        const savingsRate = monthlySummary.savings / monthlySummary.totalIncome;
        if (savingsRate >= 0.2) {
          score += 30;
          factors.push('Excellent savings rate (≥20%)');
        } else if (savingsRate >= 0.1) {
          score += 20;
          factors.push('Good savings rate (≥10%)');
        } else if (savingsRate >= 0) {
          score += 10;
          factors.push('Positive savings rate');
        } else {
          score += 0;
          factors.push('Negative savings rate');
          recommendations.push('Focus on reducing expenses to achieve positive savings');
        }
      }

      // Account Diversity (20% of score)
      const accountCount = accountBalances.length;
      if (accountCount >= 3) {
        score += 20;
        factors.push('Good account diversification');
      } else if (accountCount >= 2) {
        score += 15;
        factors.push('Moderate account diversification');
      } else {
        score += 5;
        factors.push('Limited account diversification');
        recommendations.push(
          'Consider opening additional accounts for better financial organization',
        );
      }

      // Transaction Activity (10% of score)
      if (monthlySummary.transactionCount >= 10 && monthlySummary.transactionCount <= 50) {
        score += 10;
        factors.push('Healthy transaction activity');
      } else if (monthlySummary.transactionCount > 50) {
        score += 5;
        factors.push('High transaction activity');
        recommendations.push('Consider consolidating smaller transactions');
      } else {
        score += 5;
        factors.push('Low transaction activity');
      }

      // Additional recommendations based on score
      if (score < 50) {
        recommendations.push('Focus on basic financial fundamentals: spend less than you earn');
        recommendations.push('Create a monthly budget and track your expenses');
      } else if (score < 80) {
        recommendations.push('Continue building good financial habits');
        recommendations.push('Consider increasing your savings rate');
      } else {
        recommendations.push(
          'Excellent financial health! Consider long-term investment strategies',
        );
        recommendations.push('Maintain your current financial discipline');
      }

      log.info({ userId, score }, 'Financial health score calculated');
      return { success: true, data: { score, factors, recommendations } };
    } catch (error) {
      log.error(error, 'Error calculating financial health score');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }
}
