'use server';

import { createClientForServer } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { AccountService, TransactionService, AIAssistantService } from '@/services';
import {
  createAccountSchema,
  updateAccountSchema,
  createTransactionSchema,
  updateTransactionSchema,
  bulkDeleteTransactionsSchema,
  aiQuestionSchema,
} from '@/validation/finance';
import { z } from 'zod';
import { ERROR_MESSAGES } from '@/lib/constants/errors';
import { handleActionError, handleValidationError } from '@/lib/utils/error-handler';
import type {
  CreateTransactionInput as ServiceCreateTransactionInput,
  UpdateTransactionInput as ServiceUpdateTransactionInput,
} from '@/types/finance.types';
import type {
  TransactionFilters,
  PaginationOptions,
  SortOptions,
  AccountFilters,
  BalanceHistoryFilters,
} from '@/types/finance.types';

// =============================================================================
// ACCOUNT ACTIONS
// =============================================================================

/**
 * Create a new account
 */
export async function createAccount(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      balance: formData.get('balance') ? Number(formData.get('balance')) : undefined,
      currency: formData.get('currency') as string,
      color: formData.get('color') as string,
    };

    const validatedData = createAccountSchema.parse(rawData);

    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const accountService = new AccountService(supabase);
    const result = await accountService.createAccount(user.id, validatedData);

    if (result.success) {
      revalidatePath('/accounts');
      revalidatePath('/dashboard');
    }

    return result;
  } catch (error) {
    return handleActionError(error, 'createAccount');
  }
}

/**
 * Update an account
 */
export async function updateAccount(accountId: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      balance: formData.get('balance') ? Number(formData.get('balance')) : undefined,
      currency: formData.get('currency') as string,
      color: formData.get('color') as string,
    };

    const validatedData = updateAccountSchema.parse(rawData);

    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const accountService = new AccountService(supabase);
    const result = await accountService.updateAccount(accountId, user.id, validatedData);

    if (result.success) {
      revalidatePath('/accounts');
      revalidatePath('/dashboard');
    }

    return result;
  } catch (error) {
    return handleActionError(error, 'updateAccount');
  }
}

/**
 * Delete an account
 */
export async function deleteAccount(accountId: string) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const accountService = new AccountService(supabase);
    const result = await accountService.deleteAccount(accountId, user.id);

    if (result.success) {
      revalidatePath('/accounts');
      revalidatePath('/dashboard');
    }

    return result;
  } catch (error) {
    return handleActionError(error, 'deleteAccount');
  }
}

/**
 * Get accounts for a user
 */
export async function getAccounts(filters?: AccountFilters) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const accountService = new AccountService(supabase);
    return await accountService.getAccounts(user.id, filters);
  } catch (error) {
    return handleActionError(error, 'getAccounts');
  }
}

/**
 * Get account by ID
 */
export async function getAccountById(accountId: string) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const accountService = new AccountService(supabase);
    return await accountService.getAccountById(accountId, user.id);
  } catch (error) {
    return handleActionError(error, 'getAccountById');
  }
}

/**
 * Get balance history for accounts
 */
export async function getBalanceHistory(filters: BalanceHistoryFilters) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    return await transactionService.getBalanceHistory(user.id, filters);
  } catch (error) {
    return handleActionError(error, 'getBalanceHistory');
  }
}

// =============================================================================
// TRANSACTION ACTIONS
// =============================================================================

/**
 * Create a new transaction
 */
export async function createTransaction(formData: FormData) {
  try {
    const rawData = {
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      notes: formData.get('notes') as string | null,
      fromAccountId: formData.get('fromAccountId') as string | null,
      toAccountId: formData.get('toAccountId') as string | null,
    };

    const parsed = createTransactionSchema.safeParse(rawData);
    if (!parsed.success) {
      return handleValidationError(parsed.error, 'createTransaction', { type: rawData.type });
    }
    const validatedData = parsed.data as ServiceCreateTransactionInput;

    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const result = await transactionService.createTransaction(user.id, validatedData);

    if (result.success) {
      revalidatePath('/transactions');
      revalidatePath('/dashboard');
      revalidatePath('/accounts');
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, 'createTransaction');
    }
    return handleActionError(error, 'createTransaction');
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(transactionId: string, formData: FormData) {
  try {
    const rawData = {
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      amount: formData.get('amount') ? Number(formData.get('amount')) : undefined,
      date: formData.get('date') as string,
      notes: formData.get('notes') as string | null,
      fromAccountId: formData.get('fromAccountId') as string | null,
      toAccountId: formData.get('toAccountId') as string | null,
    };

    const parsed = updateTransactionSchema.safeParse(rawData);
    if (!parsed.success) {
      return handleValidationError(parsed.error, 'updateTransaction', { id: transactionId });
    }
    const validatedData = parsed.data as ServiceUpdateTransactionInput;

    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const result = await transactionService.updateTransaction(
      transactionId,
      user.id,
      validatedData,
    );

    if (result.success) {
      revalidatePath('/transactions');
      revalidatePath('/dashboard');
      revalidatePath('/accounts');
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, 'updateTransaction');
    }
    return handleActionError(error, 'updateTransaction');
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: string) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const result = await transactionService.deleteTransaction(transactionId, user.id);

    if (result.success) {
      revalidatePath('/transactions');
      revalidatePath('/dashboard');
      revalidatePath('/accounts');
    }

    return result;
  } catch (error) {
    return handleActionError(error, 'deleteTransaction');
  }
}

/**
 * Delete multiple transactions
 */
export async function deleteManyTransactions(transactionIds: string[]) {
  try {
    const validatedData = bulkDeleteTransactionsSchema.parse({ transactionIds });

    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const result = await transactionService.deleteManyTransactions(
      user.id,
      validatedData.transactionIds,
    );

    if (result.success) {
      revalidatePath('/transactions');
      revalidatePath('/dashboard');
      revalidatePath('/accounts');
    }

    return result;
  } catch (error) {
    return handleActionError(error, 'deleteManyTransactions');
  }
}

/**
 * Get transactions for a user
 */
export async function getTransactions(
  filters?: TransactionFilters,
  pagination?: PaginationOptions,
  sort?: SortOptions,
) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    return await transactionService.getTransactions(user.id, filters, pagination, sort);
  } catch (error) {
    return handleActionError(error, 'getTransactions');
  }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    return await transactionService.getTransactionById(transactionId, user.id);
  } catch (error) {
    return handleActionError(error, 'getTransactionById');
  }
}

// =============================================================================
// DASHBOARD ACTIONS
// =============================================================================

/**
 * Get dashboard data
 */
export async function getDashboardData(dateRange?: { from?: Date; to?: Date }) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const accountService = new AccountService(supabase);

    const [
      monthlySummaryResult,
      recentTransactionsResult,
      spendingTrendsResult,
      totalBalanceResult,
      accountCountResult,
    ] = await Promise.all([
      transactionService.getMonthlySummary(user.id),
      transactionService.getRecentTransactions(user.id, 5),
      transactionService.getSpendingTrends(user.id, 7, dateRange),
      accountService.getTotalBalance(user.id),
      accountService.getAccountCount(user.id),
    ]);

    if (!monthlySummaryResult.success) {
      return { success: false, error: monthlySummaryResult.error };
    }

    const currentBalance = totalBalanceResult.success ? totalBalanceResult.data : 0;
    const monthlySummary = monthlySummaryResult.data;

    // Calculate previous month balance by subtracting current month's net income
    // This is a simplified approach - in a real system you'd want historical balance tracking
    const previousMonthBalance = monthlySummary.previousMonth
      ? currentBalance - monthlySummary.netIncome
      : undefined;

    const dashboardData = {
      monthlySummary: monthlySummaryResult.data,
      recentTransactions: recentTransactionsResult.success ? recentTransactionsResult.data : [],
      spendingTrends: spendingTrendsResult.success ? spendingTrendsResult.data : [],
      totalBalance: currentBalance,
      accountCount: accountCountResult.success ? accountCountResult.data : 0,
      previousMonthBalance,
    };

    return { success: true, data: dashboardData };
  } catch (error) {
    return handleActionError(error, 'getDashboardData');
  }
}

/**
 * Get financial summary for header display
 */
export async function getFinancialSummary() {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const accountService = new AccountService(supabase);

    const [monthlySummaryResult, totalBalanceResult, accountCountResult, transactionCountResult] =
      await Promise.all([
        transactionService.getMonthlySummary(user.id),
        accountService.getTotalBalance(user.id),
        accountService.getAccountCount(user.id),
        transactionService.getTransactionCount(user.id),
      ]);

    const totalBalance = totalBalanceResult.success ? totalBalanceResult.data : 0;
    const accountCount = accountCountResult.success ? accountCountResult.data : 0;
    const transactionCount = transactionCountResult.success ? transactionCountResult.data : 0;
    const monthlyChange = monthlySummaryResult.success ? monthlySummaryResult.data.netIncome : 0;

    // Calculate savings rate (simplified - income vs expenses)
    const monthlySummary = monthlySummaryResult.success ? monthlySummaryResult.data : null;
    const savingsRate =
      monthlySummary && monthlySummary.totalIncome > 0
        ? (monthlySummary.netIncome / monthlySummary.totalIncome) * 100
        : 0;

    const financialSummary = {
      totalBalance,
      netWorth: totalBalance, // Simplified - in real app this would include assets/debts
      monthlyChange,
      accountsCount: accountCount,
      transactionsCount: transactionCount,
      savingsRate,
      // Add actual income/expense data
      totalIncome: monthlySummary ? monthlySummary.totalIncome : 0,
      totalExpenses: monthlySummary ? monthlySummary.totalExpenses : 0,
    };

    return { success: true, data: financialSummary };
  } catch (error) {
    return handleActionError(error, 'getFinancialSummary');
  }
}

/**
 * Get account balance distribution for pie chart
 */
export async function getAccountDistribution() {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const accountService = new AccountService(supabase);
    const result = await accountService.getAccountBalances(user.id);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const distribution = result.data.map((account) => ({
      name: account.accountName,
      type: account.accountType,
      value: account.balance,
      color: account.color || '#3b82f6', // Use account color or default blue
    }));

    return { success: true, data: distribution };
  } catch (error) {
    return handleActionError(error, 'getAccountDistribution');
  }
}

/**
 * Get monthly cash flow trend data
 */
export async function getMonthlyCashFlowTrend(dateRange: {
  from: Date | undefined;
  to: Date | undefined;
}) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    if (!dateRange.from || !dateRange.to) {
      return { success: false, error: 'Date range is required' };
    }

    const transactionService = new TransactionService(supabase);
    const trendData = [];

    // Simple approach: iterate month by month from start to end
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);

    // Set to first day of month for consistency
    startDate.setDate(1);
    endDate.setDate(1);

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const result = await transactionService.getMonthlySummary(
        user.id,
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
      );

      if (result.success) {
        const monthData = result.data;
        trendData.push({
          month: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: monthData.totalIncome,
          expenses: monthData.totalExpenses,
        });
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return { success: true, data: trendData };
  } catch (error) {
    return handleActionError(error, 'getMonthlyCashFlowTrend');
  }
}

/**
 * Get daily cash flow trend data
 */
export async function getDailyCashFlowTrend(dateRange: {
  from: Date | undefined;
  to: Date | undefined;
}) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    if (!dateRange.from || !dateRange.to) {
      return { success: false, error: 'Date range is required' };
    }

    const trendData = [];

    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', dayStart.toISOString())
        .lte('date', dayEnd.toISOString())
        .order('date', { ascending: true });

      if (transactions) {
        const income = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const expenses = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        trendData.push({
          date: currentDate.toISOString(),
          income,
          expenses,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { success: true, data: trendData };
  } catch (error) {
    return handleActionError(error, 'getDailyCashFlowTrend');
  }
}

/**
 * Get weekly cash flow trend data
 */
export async function getWeeklyCashFlowTrend(dateRange: {
  from: Date | undefined;
  to: Date | undefined;
}) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    if (!dateRange.from || !dateRange.to) {
      return { success: false, error: 'Date range is required' };
    }

    const trendData = [];

    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);

    // Start from the beginning of the week
    const currentDate = new Date(startDate);
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = (dayOfWeek + 6) % 7;
    currentDate.setDate(currentDate.getDate() - daysToMonday);
    currentDate.setHours(0, 0, 0, 0);

    let weekNumber = 1;

    while (currentDate <= endDate) {
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(currentDate.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', currentDate.toISOString())
        .lte('date', weekEnd.toISOString())
        .order('date', { ascending: true });

      if (transactions) {
        const income = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const expenses = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        trendData.push({
          week: `Week ${weekNumber}`,
          income,
          expenses,
        });

        weekNumber++;
      }

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return { success: true, data: trendData };
  } catch (error) {
    return handleActionError(error, 'getWeeklyCashFlowTrend');
  }
}

/**
 * Get yearly cash flow trend data
 */
export async function getYearlyCashFlowTrend(years = 3) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const trendData = [];

    for (let i = years - 1; i >= 0; i--) {
      const targetYear = new Date().getFullYear() - i;

      // Get yearly summary by aggregating all months in the year
      const monthlyData = [];
      for (let month = 1; month <= 12; month++) {
        const result = await transactionService.getMonthlySummary(user.id, targetYear, month);
        if (result.success) {
          monthlyData.push(result.data);
        }
      }

      if (monthlyData.length > 0) {
        const yearlyIncome = monthlyData.reduce((sum, month) => sum + month.totalIncome, 0);
        const yearlyExpenses = monthlyData.reduce((sum, month) => sum + month.totalExpenses, 0);
        const yearlyNet = yearlyIncome - yearlyExpenses;

        trendData.push({
          year: targetYear.toString(),
          income: yearlyIncome,
          expenses: yearlyExpenses,
          net: yearlyNet,
        });
      }
    }

    return { success: true, data: trendData };
  } catch (error) {
    return handleActionError(error, 'getYearlyCashFlowTrend');
  }
}

/**
 * Get category spending breakdown
 */
export async function getCategorySpendingBreakdown() {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const result = await transactionService.getCategorySpending(user.id, 'expense');

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const totalExpenses = result.data.reduce((sum, item) => sum + item.totalAmount, 0);

    const breakdown = result.data
      .map((item) => ({
        category: item.category,
        amount: item.totalAmount,
        percentage: totalExpenses > 0 ? Math.round((item.totalAmount / totalExpenses) * 100) : 0,
        transactionCount: item.transactionCount,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { success: true, data: breakdown };
  } catch (error) {
    return handleActionError(error, 'getCategorySpendingBreakdown');
  }
}

/**
 * Get category spending breakdown for a specific month
 */
export async function getCategorySpendingForMonth(year: number, month: number) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    // Create date range for the specific month
    const startDate = new Date(year, month - 1, 1); // month is 1-based, Date constructor is 0-based
    const endDate = new Date(year, month, 0); // Last day of the month

    // Get transactions for the specific month
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) {
      return { success: false, error: error.message };
    }

    // Group by category and calculate totals
    const categoryMap = new Map<string, { totalAmount: number; transactionCount: number }>();

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      const existing = categoryMap.get(transaction.category) || {
        totalAmount: 0,
        transactionCount: 0,
      };
      categoryMap.set(transaction.category, {
        totalAmount: existing.totalAmount + amount,
        transactionCount: existing.transactionCount + 1,
      });
    });

    const totalExpenses = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.totalAmount,
      0,
    );

    const breakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.totalAmount,
        percentage: totalExpenses > 0 ? Math.round((data.totalAmount / totalExpenses) * 100) : 0,
        transactionCount: data.transactionCount,
        avgCategory: Math.round(data.totalAmount * 0.8), // Placeholder - 80% of current amount as "average"
      }))
      .sort((a, b) => b.amount - a.amount);

    return { success: true, data: breakdown };
  } catch (error) {
    return handleActionError(error, 'getCategorySpendingForMonth');
  }
}

/**
 * Get top merchants/spending locations
 */
export async function getTopMerchants(limit = 5) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    // Get recent transactions and group by description/merchant
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('description, amount, category, date')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
      .order('date', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Group by merchant name (simplified - in real app you'd have merchant normalization)
    const merchantMap = new Map();

    transactions.forEach((transaction) => {
      const merchant = transaction.description.split(' ')[0]; // Simple merchant extraction
      if (merchantMap.has(merchant)) {
        const existing = merchantMap.get(merchant);
        existing.amount += transaction.amount;
        existing.transactionCount += 1;
      } else {
        merchantMap.set(merchant, {
          name: merchant,
          amount: transaction.amount,
          transactionCount: 1,
          category: transaction.category,
        });
      }
    });

    const topMerchants = Array.from(merchantMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit)
      .map((merchant) => ({
        ...merchant,
        avgTransaction: Math.round(merchant.amount / merchant.transactionCount),
      }));

    return { success: true, data: topMerchants };
  } catch (error) {
    return handleActionError(error, 'getTopMerchants');
  }
}

/**
 * Calculate simple financial health score for dashboard
 */
export async function getSimpleFinancialHealthScore() {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const accountService = new AccountService(supabase);

    const [monthlySummaryResult, totalBalanceResult] = await Promise.all([
      transactionService.getMonthlySummary(user.id),
      accountService.getTotalBalance(user.id),
    ]);

    if (!monthlySummaryResult.success) {
      return { success: false, error: monthlySummaryResult.error };
    }

    const monthlySummary = monthlySummaryResult.data;
    const totalBalance = totalBalanceResult.success ? totalBalanceResult.data : 0;

    // Calculate different health metrics
    const savingsRate =
      monthlySummary.totalIncome > 0
        ? Math.round((monthlySummary.netIncome / monthlySummary.totalIncome) * 100)
        : 0;

    // Simplified health score calculation
    const savingsRateScore = Math.min(Math.max(savingsRate, 0), 100);
    const emergencyFundScore =
      totalBalance > monthlySummary.totalExpenses * 3
        ? 100
        : Math.round((totalBalance / (monthlySummary.totalExpenses * 3)) * 100);
    const debtScore =
      monthlySummary.totalExpenses > 0
        ? Math.max(
            0,
            100 - Math.round((monthlySummary.totalExpenses / monthlySummary.totalIncome) * 100),
          )
        : 100;
    const consistencyScore = monthlySummary.netIncome > 0 ? 80 : 40; // Simplified

    const overallScore = Math.round(
      savingsRateScore * 0.3 +
        emergencyFundScore * 0.25 +
        debtScore * 0.25 +
        consistencyScore * 0.2,
    );

    const healthScore = {
      overallScore,
      breakdown: {
        savingsRate: { score: savingsRateScore, weight: 30 },
        emergencyFund: { score: emergencyFundScore, weight: 25 },
        debtManagement: { score: debtScore, weight: 25 },
        consistency: { score: consistencyScore, weight: 20 },
      },
    };

    return { success: true, data: healthScore };
  } catch (error) {
    return handleActionError(error, 'getSimpleFinancialHealthScore');
  }
}

/**
 * Get AI-powered financial health score for assistant
 */
export async function getFinancialHealthScore() {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const aiService = new AIAssistantService(supabase);
    return await aiService.getFinancialHealthScore(user.id);
  } catch (error) {
    return handleActionError(error, 'getFinancialHealthScore');
  }
}

// =============================================================================
// AI ASSISTANT ACTIONS
// =============================================================================

/**
 * Generate financial insights
 */
export async function generateInsights() {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const aiService = new AIAssistantService(supabase);
    return await aiService.generateInsights(user.id);
  } catch (error) {
    return handleActionError(error, 'generateInsights');
  }
}

/**
 * Ask AI a question
 */
export async function askAIQuestion(formData: FormData) {
  try {
    const rawData = {
      message: formData.get('message') as string,
    };

    const validatedData = aiQuestionSchema.parse(rawData);

    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const aiService = new AIAssistantService(supabase);
    return await aiService.askQuestion(user.id, validatedData.message);
  } catch (error) {
    return handleActionError(error, 'askAIQuestion');
  }
}

/**
 * Get spending patterns analysis
 */
export async function getSpendingPatterns() {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const aiService = new AIAssistantService(supabase);
    return await aiService.getSpendingPatterns(user.id);
  } catch (error) {
    return handleActionError(error, 'getSpendingPatterns');
  }
}

// =============================================================================
// EXPORT ACTIONS
// =============================================================================

/**
 * Export transactions to CSV
 */
export async function exportTransactions(filters?: TransactionFilters) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const accountService = new AccountService(supabase);

    // Get all transactions (no pagination for export)
    const transactionsResult = await transactionService.getTransactions(user.id, filters, {
      limit: 10000,
    });
    const accountsResult = await accountService.getAccounts(user.id);

    if (!transactionsResult.success) {
      return { success: false, error: transactionsResult.error };
    }

    const exportData = {
      transactions: transactionsResult.data.data,
      accounts: accountsResult.success ? accountsResult.data : [],
      exportDate: new Date().toISOString(),
      dateRange: {
        from:
          filters?.dateFrom || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        to: filters?.dateTo || new Date().toISOString().split('T')[0],
      },
    };

    return { success: true, data: exportData };
  } catch (error) {
    return handleActionError(error, 'exportTransactions');
  }
}

/**
 * Export transactions to CSV format
 */
export async function exportTransactionsToCSV(filters: TransactionFilters = {}) {
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED };
    }

    const transactionService = new TransactionService(supabase);
    const result = await transactionService.exportTransactionsToCSV(user.id, filters);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error, 'exportTransactionsToCSV');
  }
}
