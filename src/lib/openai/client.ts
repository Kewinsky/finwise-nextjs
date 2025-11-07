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
      totalIncome: number;
      totalExpenses: number;
      savings: number;
      transactionCount: number;
    };
    recentTransactions?: Array<{
      description: string;
      amount: number;
      category: string;
      date: string;
      type: string;
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
    }>;
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

    // Build context string
    let contextString = '';
    if (context) {
      const parts: string[] = [];

      if (context.monthlySummary) {
        const ms = context.monthlySummary;
        parts.push(
          `Monthly Summary:\n- Total Income: $${ms.totalIncome.toFixed(2)}\n- Total Expenses: $${ms.totalExpenses.toFixed(2)}\n- Savings: $${ms.savings.toFixed(2)}\n- Transaction Count: ${ms.transactionCount}`,
        );
      }

      if (context.categorySpending && context.categorySpending.length > 0) {
        parts.push(
          `Top Spending Categories:\n${context.categorySpending
            .slice(0, 5)
            .map((c) => `- ${c.category}: $${c.amount.toFixed(2)} (${c.percentage.toFixed(1)}%)`)
            .join('\n')}`,
        );
      }

      if (context.accountBalances && context.accountBalances.length > 0) {
        const totalBalance = context.accountBalances.reduce((sum, acc) => sum + acc.balance, 0);
        parts.push(
          `Account Balances:\n- Total Balance: $${totalBalance.toFixed(2)}\n${context.accountBalances
            .map((acc) => `- ${acc.accountName} (${acc.accountType}): $${acc.balance.toFixed(2)}`)
            .join('\n')}`,
        );
      }

      if (context.recentTransactions && context.recentTransactions.length > 0) {
        parts.push(
          `Recent Transactions:\n${context.recentTransactions
            .slice(0, 5)
            .map(
              (t) =>
                `- ${t.date}: ${t.description} - $${t.amount.toFixed(2)} (${t.category}, ${t.type})`,
            )
            .join('\n')}`,
        );
      }

      if (parts.length > 0) {
        contextString = `\n\nUser's Financial Context:\n${parts.join('\n\n')}`;
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
