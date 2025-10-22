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

/**
 * Get financial health score
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
