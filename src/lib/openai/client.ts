'use server';

import OpenAI from 'openai';
import { log } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants/errors';
import { isOpenAIConfigured } from './config';

/**
 * Get OpenAI client instance
 * Throws error if API key is not configured
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'sk-your_openai_api_key_here') {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your .env.local file.');
  }

  return new OpenAI({
    apiKey,
  });
}

/**
 * Get the OpenAI model to use
 * Defaults to gpt-4o-mini (cheapest and fastest)
 */
function getModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

/**
 * Call OpenAI API with financial context
 * @param prompt - The user's question or prompt
 * @param context - Financial context data to include
 * @param systemPrompt - Optional custom system prompt
 */
export async function callOpenAI(
  prompt: string,
  context?: {
    monthlySummary?: {
      month: string;
      totalIncome: number;
      totalExpenses: number;
      savings: number;
      netIncome: number;
      transactionCount: number;
      previousMonth?: {
        month: string;
        totalIncome: number;
        totalExpenses: number;
        netIncome: number;
        savings: number;
        transactionCount: number;
      };
    };
    recentTransactions?: Array<{
      description: string;
      amount: number;
      category: string;
      date: string;
      type: string;
      accountName?: string;
    }>;
    accountBalances?: Array<{
      accountName: string;
      balance: number;
      accountType: string;
    }>;
    categorySpending?: Array<{
      category: string;
      amount: number;
      percentage: number;
      transactionCount?: number;
    }>;
    categoryIncome?: Array<{
      category: string;
      amount: number;
      percentage: number;
      transactionCount?: number;
    }>;
    spendingTrends?: Array<{
      date: string;
      amount: number;
      type: string;
      category: string;
    }>;
    metrics?: {
      totalBalance: number;
      accountCount: number;
      avgTransactionAmount: number;
      mostActiveCategory?: string;
      dailyAverage: number;
      weeklyAverage: number;
      savingsRate: number;
    };
  },
  systemPrompt?: string,
): Promise<{ content: string; tokensUsed: number; error?: string }> {
  try {
    if (!isOpenAIConfigured()) {
      log.warn('OpenAI is not configured, returning fallback response');
      return {
        content:
          'AI Assistant is not configured. Please set OPENAI_API_KEY in your environment variables.',
        tokensUsed: 0,
        error: 'OPENAI_API_KEY not configured',
      };
    }

    const client = getOpenAIClient();
    const model = getModel();

    // Build system prompt
    const defaultSystemPrompt = `You are a helpful and knowledgeable AI financial assistant. Your role is to help users understand their finances, provide insights about their spending patterns, offer budgeting advice, and answer questions about their financial data.

Guidelines:
- Be concise, clear, and professional
- Use the provided financial context to give personalized advice
- Always refer to specific numbers and amounts when available
- Provide actionable recommendations
- If you don't have enough context, ask clarifying questions
- Never make up financial data - only use what's provided
- Format numbers as currency (e.g., $1,234.56)
- Be encouraging and supportive`;

    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    // Build comprehensive context string
    let contextString = '';
    if (context) {
      const parts: string[] = [];

      // Monthly Summary
      if (context.monthlySummary) {
        const ms = context.monthlySummary;
        let summaryText = `=== CURRENT MONTH SUMMARY ===\nMonth: ${ms.month}\n- Total Income: $${ms.totalIncome.toFixed(2)}\n- Total Expenses: $${ms.totalExpenses.toFixed(2)}\n- Net Income: $${ms.netIncome.toFixed(2)}\n- Savings: $${ms.savings.toFixed(2)}\n- Transaction Count: ${ms.transactionCount}`;

        if (ms.previousMonth) {
          const pm = ms.previousMonth;
          const incomeChange = ms.totalIncome - pm.totalIncome;
          const expenseChange = ms.totalExpenses - pm.totalExpenses;
          const savingsChange = ms.savings - pm.savings;
          const incomeChangePercent =
            pm.totalIncome > 0 ? (incomeChange / pm.totalIncome) * 100 : 0;
          const expenseChangePercent =
            pm.totalExpenses > 0 ? (expenseChange / pm.totalExpenses) * 100 : 0;
          const savingsChangePercent =
            pm.savings !== 0 ? (savingsChange / Math.abs(pm.savings)) * 100 : 0;

          summaryText += `\n\n=== PREVIOUS MONTH COMPARISON ===\nMonth: ${pm.month}\n- Total Income: $${pm.totalIncome.toFixed(2)} (${incomeChange >= 0 ? '+' : ''}$${incomeChange.toFixed(2)}, ${incomeChangePercent >= 0 ? '+' : ''}${incomeChangePercent.toFixed(1)}%)\n- Total Expenses: $${pm.totalExpenses.toFixed(2)} (${expenseChange >= 0 ? '+' : ''}$${expenseChange.toFixed(2)}, ${expenseChangePercent >= 0 ? '+' : ''}${expenseChangePercent.toFixed(1)}%)\n- Net Income: $${pm.netIncome.toFixed(2)} (${savingsChange >= 0 ? '+' : ''}$${savingsChange.toFixed(2)}, ${savingsChangePercent >= 0 ? '+' : ''}${savingsChangePercent.toFixed(1)}%)\n- Savings: $${pm.savings.toFixed(2)} (${savingsChange >= 0 ? '+' : ''}$${savingsChange.toFixed(2)})\n- Transaction Count: ${pm.transactionCount}`;
        }

        parts.push(summaryText);
      }

      // Top Spending Categories
      if (context.categorySpending && context.categorySpending.length > 0) {
        parts.push(
          `=== TOP SPENDING CATEGORIES (Current Month) ===\n${context.categorySpending
            .slice(0, 10)
            .map(
              (c, i) =>
                `${i + 1}. ${c.category}: $${c.amount.toFixed(2)} (${c.percentage.toFixed(1)}%)${c.transactionCount ? ` - ${c.transactionCount} transactions` : ''}`,
            )
            .join('\n')}`,
        );
      }

      // Top Income Categories
      if (context.categoryIncome && context.categoryIncome.length > 0) {
        parts.push(
          `=== TOP INCOME CATEGORIES (Current Month) ===\n${context.categoryIncome
            .map(
              (c, i) =>
                `${i + 1}. ${c.category}: $${c.amount.toFixed(2)} (${c.percentage.toFixed(1)}%)${c.transactionCount ? ` - ${c.transactionCount} transactions` : ''}`,
            )
            .join('\n')}`,
        );
      }

      // Account Balances
      if (context.accountBalances && context.accountBalances.length > 0) {
        const totalBalance = context.accountBalances.reduce((sum, acc) => sum + acc.balance, 0);
        parts.push(
          `=== ACCOUNT BALANCES ===\nTotal Balance: $${totalBalance.toFixed(2)}\n${context.accountBalances
            .map((acc) => `- ${acc.accountName} (${acc.accountType}): $${acc.balance.toFixed(2)}`)
            .join('\n')}`,
        );
      }

      // Recent Transactions
      if (context.recentTransactions && context.recentTransactions.length > 0) {
        parts.push(
          `=== RECENT TRANSACTIONS (Last ${context.recentTransactions.length}) ===\n${context.recentTransactions
            .slice(0, 15)
            .map(
              (t) =>
                `${t.date}: ${t.description} - $${Math.abs(t.amount).toFixed(2)} (${t.category}, ${t.type})${t.accountName ? ` [${t.accountName}]` : ''}`,
            )
            .join('\n')}`,
        );
      }

      // Spending Trends
      if (context.spendingTrends && context.spendingTrends.length > 0) {
        const expenseTrends = context.spendingTrends.filter((t) => t.type === 'expense');
        if (expenseTrends.length > 0) {
          const totalSpending = expenseTrends.reduce((sum, t) => sum + t.amount, 0);
          const days = expenseTrends.length;
          const dailyAverage = days > 0 ? totalSpending / days : 0;
          const weeklyAverage = dailyAverage * 7;
          const peakDay = expenseTrends.reduce(
            (max, t) => (t.amount > max.amount ? t : max),
            expenseTrends[0],
          );
          const lowestDay = expenseTrends.reduce(
            (min, t) => (t.amount < min.amount ? t : min),
            expenseTrends[0],
          );

          parts.push(
            `=== SPENDING TRENDS (Last 30 Days) ===\n- Daily average: $${dailyAverage.toFixed(2)}\n- Weekly average: $${weeklyAverage.toFixed(2)}\n- Peak spending day: ${peakDay.date} ($${peakDay.amount.toFixed(2)})\n- Lowest spending day: ${lowestDay.date} ($${lowestDay.amount.toFixed(2)})`,
          );
        }
      }

      // Financial Metrics
      if (context.metrics) {
        const m = context.metrics;
        parts.push(
          `=== FINANCIAL METRICS ===\n- Total Accounts: ${m.accountCount}\n- Total Balance: $${m.totalBalance.toFixed(2)}\n- Average Transaction Amount: $${m.avgTransactionAmount.toFixed(2)}\n${m.mostActiveCategory ? `- Most Active Category: ${m.mostActiveCategory}\n` : ''}- Spending Velocity: $${m.dailyAverage.toFixed(2)}/day, $${m.weeklyAverage.toFixed(2)}/week\n- Savings Rate: ${m.savingsRate.toFixed(1)}% of income`,
        );
      }

      if (parts.length > 0) {
        contextString = `\n\nUser's Financial Context:\n\n${parts.join('\n\n')}`;
      }
    }

    // Call OpenAI API
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: finalSystemPrompt,
        },
        {
          role: 'user',
          content: `${prompt}${contextString}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      log.error('OpenAI returned empty response');
      return {
        content: 'I apologize, but I was unable to generate a response. Please try again.',
        tokensUsed: 0,
        error: 'Empty response from OpenAI',
      };
    }

    const tokensUsed = completion.usage?.total_tokens || 0;
    log.info({ model, tokensUsed }, 'OpenAI API call successful');
    return { content, tokensUsed };
  } catch (error) {
    log.error(error, 'Error calling OpenAI API');

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return {
          content: 'AI Assistant is not properly configured. Please check your API key settings.',
          tokensUsed: 0,
          error: 'Invalid API key',
        };
      }
      if (error.message.includes('rate limit')) {
        return {
          content:
            'AI Assistant is temporarily unavailable due to rate limits. Please try again in a moment.',
          tokensUsed: 0,
          error: 'Rate limit exceeded',
        };
      }
      if (error.message.includes('insufficient_quota')) {
        return {
          content:
            'AI Assistant is temporarily unavailable. Please contact support if this issue persists.',
          tokensUsed: 0,
          error: 'Insufficient quota',
        };
      }
    }

    return {
      content:
        'I encountered an error while processing your request. Please try again or rephrase your question.',
      tokensUsed: 0,
      error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
    };
  }
}
