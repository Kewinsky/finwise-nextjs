import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  MonthlySummary,
  SpendingTrends,
  CategorySpending,
  RecentTransaction,
  PaginatedResult,
  PaginationOptions,
  SortOptions,
  TransactionType,
  BalanceHistoryFilters,
  BalanceHistoryChart,
  BalanceHistoryPoint,
} from '@/types/finance.types';
import { log } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants/errors';
import { CurrencyService } from './currency.service';
import { UserPreferencesService } from './user-preferences.service';
import { DEFAULT_CURRENCY } from '@/types/finance.types';

/**
 * TransactionService handles all transaction-related business logic
 *
 * Responsibilities:
 * - Transaction CRUD operations
 * - Transaction filtering, pagination, and search
 * - Data aggregation for dashboard and analytics
 * - Export functionality
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const transactionService = new TransactionService(supabase);
 *
 * const result = await transactionService.getTransactions(userId, { type: 'expense' });
 * if (result.success) {
 *   console.log(`Found ${result.data.length} expense transactions`);
 * }
 * ```
 */
export class TransactionService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Get transactions for a user with optional filters and pagination
   */
  async getTransactions(
    userId: string,
    filters?: TransactionFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions,
  ): Promise<ServiceResult<PaginatedResult<Transaction>>> {
    try {
      log.info({ userId, filters, pagination, sort }, 'Fetching transactions');

      let query = this.supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters?.accountId) {
        query = query.or(
          `from_account_id.eq.${filters.accountId},to_account_id.eq.${filters.accountId}`,
        );
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      if (filters?.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount);
      }

      if (filters?.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount);
      }

      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortField = sort?.field || 'date';
      const sortDirection = sort?.direction || 'desc';
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Apply pagination
      if (pagination?.offset !== undefined && pagination?.limit !== undefined) {
        query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
      } else if (pagination?.page && pagination?.pageSize) {
        const offset = (pagination.page - 1) * pagination.pageSize;
        query = query.range(offset, offset + pagination.pageSize - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch transactions');
        return { success: false, error: error.message };
      }

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || pagination?.limit || 20;
      const total = count || 0;
      const hasMore = page * pageSize < total;

      const result: PaginatedResult<Transaction> = {
        data: data || [],
        total,
        page,
        pageSize,
        hasMore,
      };

      log.info({ userId, count: data.length, total }, 'Transactions retrieved successfully');
      return { success: true, data: result };
    } catch (error) {
      log.error(error, 'Error fetching transactions');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(
    transactionId: string,
    userId: string,
  ): Promise<ServiceResult<Transaction>> {
    try {
      log.info({ transactionId, userId }, 'Fetching transaction by ID');

      const { data, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          log.warn({ transactionId, userId }, 'Transaction not found');
          return { success: false, error: ERROR_MESSAGES.DATA_NOT_FOUND };
        }
        log.error({ transactionId, userId, error: error.message }, 'Failed to fetch transaction');
        return { success: false, error: error.message };
      }

      log.info({ transactionId, userId }, 'Transaction retrieved successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error fetching transaction');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Create a new transaction
   * For transfers between accounts with different currencies, handles currency conversion
   */
  async createTransaction(
    userId: string,
    input: CreateTransactionInput,
  ): Promise<ServiceResult<Transaction>> {
    try {
      log.info({ userId, type: input.type, amount: input.amount }, 'Creating transaction');

      // For transfers, check if currency conversion is needed
      if (input.type === 'transfer' && input.fromAccountId && input.toAccountId) {
        // Get account currencies
        const { data: accounts, error: accountsError } = await this.supabase
          .from('accounts')
          .select('id, currency')
          .in('id', [input.fromAccountId, input.toAccountId])
          .eq('user_id', userId);

        if (accountsError || !accounts || accounts.length !== 2) {
          log.error(
            { userId, error: accountsError?.message },
            'Failed to fetch account currencies',
          );
          return {
            success: false,
            error: accountsError?.message || 'Failed to fetch account currencies',
          };
        }

        const fromAccount = accounts.find((acc) => acc.id === input.fromAccountId);
        const toAccount = accounts.find((acc) => acc.id === input.toAccountId);

        if (!fromAccount || !toAccount) {
          return { success: false, error: 'One or both accounts not found' };
        }

        const fromCurrency = fromAccount.currency || DEFAULT_CURRENCY;
        const toCurrency = toAccount.currency || DEFAULT_CURRENCY;

        // If currencies differ, convert amount for destination account
        if (fromCurrency !== toCurrency) {
          log.info(
            { fromCurrency, toCurrency, amount: input.amount },
            'Transfer between different currencies - converting amount',
          );

          const currencyService = new CurrencyService(this.supabase);
          const conversionResult = await currencyService.convertAmount(
            input.amount,
            fromCurrency,
            toCurrency,
          );

          if (!conversionResult.success || !conversionResult.data) {
            log.error(
              { fromCurrency, toCurrency, amount: input.amount, error: conversionResult.error },
              'Currency conversion failed',
            );
            return {
              success: false,
              error: `Failed to convert ${fromCurrency} to ${toCurrency}: ${conversionResult.error}`,
            };
          }

          const convertedAmount = conversionResult.data;

          // Create transaction with original amount
          const transactionData = {
            user_id: userId,
            from_account_id: input.fromAccountId,
            to_account_id: input.toAccountId,
            type: input.type,
            description: input.description,
            category: input.category,
            amount: input.amount, // Original amount in source currency
            date: input.date,
            notes: input.notes || null,
          };

          const { data, error } = await this.supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();

          if (error) {
            log.error({ userId, error: error.message }, 'Failed to create transaction');
            return { success: false, error: error.message };
          }

          // Trigger already updated balances incorrectly (added original amount to destination)
          // We need to revert the trigger's changes and apply correct conversion

          // Get current balances after trigger
          const { data: currentAccounts, error: fetchError } = await this.supabase
            .from('accounts')
            .select('id, balance')
            .in('id', [input.fromAccountId, input.toAccountId])
            .eq('user_id', userId);

          if (fetchError || !currentAccounts || currentAccounts.length !== 2) {
            log.error({ fetchError: fetchError?.message }, 'Failed to fetch current balances');
            log.warn(
              { transactionId: data.id },
              'Transaction created but balance correction failed',
            );
            return {
              success: true,
              data,
            };
          }

          const currentToAccount = currentAccounts.find((acc) => acc.id === input.toAccountId);
          if (!currentToAccount) {
            log.warn(
              { transactionId: data.id, toAccountId: input.toAccountId },
              'Transaction created but balance correction failed - toAccount not found',
            );
            return {
              success: true,
              data,
            };
          }

          // Calculate correct balance: revert trigger's addition and add converted amount
          const currentBalance = Number(currentToAccount.balance);
          const correctedBalance = currentBalance - input.amount + convertedAmount;

          // Update destination account with corrected balance
          const { error: toBalanceError } = await this.supabase
            .from('accounts')
            .update({ balance: correctedBalance, updated_at: new Date().toISOString() })
            .eq('id', input.toAccountId)
            .eq('user_id', userId);

          if (toBalanceError) {
            log.error(
              { toBalanceError: toBalanceError.message },
              'Failed to update account balances after currency conversion',
            );
            // Transaction was created but balance update failed - return warning
            log.warn(
              { transactionId: data.id },
              'Transaction created but balance update may be incorrect',
            );
            return {
              success: true,
              data,
            };
          }

          log.info(
            {
              userId,
              transactionId: data.id,
              fromCurrency,
              toCurrency,
              originalAmount: input.amount,
              convertedAmount,
            },
            'Transfer with currency conversion completed',
          );

          return { success: true, data };
        }
      }

      // For same currency transfers or non-transfer transactions, use normal flow
      const transactionData = {
        user_id: userId,
        from_account_id: input.fromAccountId || null,
        to_account_id: input.toAccountId || null,
        type: input.type,
        description: input.description,
        category: input.category,
        amount: input.amount,
        date: input.date,
        notes: input.notes || null,
      };

      const { data, error } = await this.supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to create transaction');
        return { success: false, error: error.message };
      }

      log.info({ userId, transactionId: data.id }, 'Transaction created successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error creating transaction');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Update a transaction
   */
  async updateTransaction(
    transactionId: string,
    userId: string,
    input: UpdateTransactionInput,
  ): Promise<ServiceResult<Transaction>> {
    try {
      log.info({ transactionId, userId }, 'Updating transaction');

      // Load current transaction to enforce DB constraints when type changes
      const { data: current, error: loadError } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', userId)
        .single();
      if (loadError) {
        if (loadError.code === 'PGRST116') {
          log.warn({ transactionId, userId }, 'Transaction not found for update');
          return { success: false, error: ERROR_MESSAGES.DATA_NOT_FOUND };
        }
        return { success: false, error: loadError.message };
      }

      // Compute final values given input overrides and existing values
      const finalType = input.type ?? (current.type as TransactionType);
      const currentFrom = 'from_account_id' in current ? current.from_account_id : null;
      const currentTo = 'to_account_id' in current ? current.to_account_id : null;
      let finalFrom = input.fromAccountId ?? currentFrom ?? null;
      let finalTo = input.toAccountId ?? currentTo ?? null;

      if (finalType === 'income') {
        finalFrom = null;
        if (!finalTo) {
          return { success: false, error: 'Income must have a destination account' };
        }
      } else if (finalType === 'expense') {
        finalTo = null;
        if (!finalFrom) {
          return { success: false, error: 'Expense must have a source account' };
        }
      } else if (finalType === 'transfer') {
        if (!finalFrom || !finalTo) {
          return { success: false, error: 'Transfer must have both from and to accounts' };
        }
        if (finalFrom === finalTo) {
          return { success: false, error: 'From and to accounts must be different' };
        }
      }

      // Build update object
      const updateData: Partial<Database['public']['Tables']['transactions']['Update']> = {
        type: finalType,
        from_account_id: finalFrom,
        to_account_id: finalTo,
        updated_at: new Date().toISOString(),
      };

      if (input.description !== undefined) updateData.description = input.description;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.date !== undefined) updateData.date = input.date;
      if (input.notes !== undefined) updateData.notes = input.notes;

      const { data, error } = await this.supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          log.warn({ transactionId, userId }, 'Transaction not found for update');
          return { success: false, error: ERROR_MESSAGES.DATA_NOT_FOUND };
        }
        log.error({ transactionId, userId, error: error.message }, 'Failed to update transaction');
        return { success: false, error: error.message };
      }

      log.info({ transactionId, userId }, 'Transaction updated successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error updating transaction');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(transactionId: string, userId: string): Promise<ServiceResult<void>> {
    try {
      log.info({ transactionId, userId }, 'Deleting transaction');

      const { error } = await this.supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) {
        log.error({ transactionId, userId, error: error.message }, 'Failed to delete transaction');
        return { success: false, error: error.message };
      }

      log.info({ transactionId, userId }, 'Transaction deleted successfully');
      return { success: true, data: undefined };
    } catch (error) {
      log.error(error, 'Error deleting transaction');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Duplicate a transaction
   * Creates a new transaction with the same details but new ID and date
   */
  async duplicateTransaction(
    transactionId: string,
    userId: string,
    newDate?: string,
  ): Promise<ServiceResult<Transaction>> {
    try {
      log.info({ transactionId, userId, newDate }, 'Duplicating transaction');

      // Get the original transaction
      const originalResult = await this.getTransactionById(transactionId, userId);
      if (!originalResult.success || !originalResult.data) {
        return { success: false, error: ERROR_MESSAGES.DATA_NOT_FOUND };
      }

      const original = originalResult.data;

      // Create new transaction with same data but new date (or current date if not provided)
      const transactionData = {
        user_id: userId,
        from_account_id: original.from_account_id,
        to_account_id: original.to_account_id,
        type: original.type,
        description: `${original.description} (Copy)`,
        category: original.category,
        amount: original.amount,
        date: newDate || original.date,
        notes: original.notes,
      };

      const { data, error } = await this.supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        log.error(
          { transactionId, userId, error: error.message },
          'Failed to duplicate transaction',
        );
        return { success: false, error: error.message };
      }

      log.info(
        { transactionId, userId, newTransactionId: data.id },
        'Transaction duplicated successfully',
      );
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error duplicating transaction');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Delete multiple transactions
   */
  async deleteManyTransactions(
    userId: string,
    transactionIds: string[],
  ): Promise<ServiceResult<void>> {
    try {
      log.info({ userId, count: transactionIds.length }, 'Deleting multiple transactions');

      const { error } = await this.supabase
        .from('transactions')
        .delete()
        .eq('user_id', userId)
        .in('id', transactionIds);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to delete transactions');
        return { success: false, error: error.message };
      }

      log.info({ userId, count: transactionIds.length }, 'Transactions deleted successfully');
      return { success: true, data: undefined };
    } catch (error) {
      log.error(error, 'Error deleting transactions');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get recent transactions for dashboard
   */
  async getRecentTransactions(
    userId: string,
    limit = 5,
  ): Promise<ServiceResult<RecentTransaction[]>> {
    try {
      log.info({ userId, limit }, 'Fetching recent transactions');

      const { data, error } = await this.supabase
        .from('transactions')
        .select(
          `
          id,
          description,
          amount,
          type,
          category,
          date,
          to_account:accounts!transactions_to_account_id_fkey(name),
          from_account:accounts!transactions_from_account_id_fkey(name)
        `,
        )
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch recent transactions');
        return { success: false, error: error.message };
      }

      type TransactionWithAccounts = {
        id: string;
        description: string;
        amount: number;
        type: string;
        category: string;
        date: string;
        from_account?: { name: string } | null;
        to_account?: { name: string } | null;
      };

      const recentTransactions: RecentTransaction[] = (data as TransactionWithAccounts[]).map(
        (t) => {
          const type = t.type as TransactionType;
          const fromName = t.from_account?.name;
          const toName = t.to_account?.name;
          let accountName = fromName || toName || '';
          if (type === 'transfer' && fromName && toName) {
            accountName = `${fromName} → ${toName}`;
          }
          return {
            id: t.id,
            description: t.description,
            amount: Number(t.amount),
            type,
            category: t.category,
            date: t.date,
            accountName,
          };
        },
      );

      log.info({ userId, count: recentTransactions.length }, 'Recent transactions retrieved');
      return { success: true, data: recentTransactions };
    } catch (error) {
      log.error(error, 'Error fetching recent transactions');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get spending trends for dashboard charts
   */
  async getSpendingTrends(
    userId: string,
    days = 7,
    dateRange?: { from?: Date; to?: Date },
  ): Promise<ServiceResult<SpendingTrends[]>> {
    try {
      log.info({ userId, days, dateRange }, 'Fetching spending trends');

      let startDate: Date;
      let endDate: Date;

      if (dateRange?.from && dateRange?.to) {
        startDate = dateRange.from;
        endDate = dateRange.to;
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
      }

      const { data, error } = await this.supabase
        .from('transactions')
        .select('date, amount, type, category')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch spending trends');
        return { success: false, error: error.message };
      }

      const trends: SpendingTrends[] = data.map((transaction) => ({
        date: transaction.date,
        amount: Number(transaction.amount),
        type: transaction.type as TransactionType,
        category: transaction.category,
      }));

      log.info({ userId, count: trends.length }, 'Spending trends retrieved');
      return { success: true, data: trends };
    } catch (error) {
      log.error(error, 'Error fetching spending trends');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get monthly summary for dashboard
   */
  async getMonthlySummary(
    userId: string,
    year?: number,
    month?: number,
  ): Promise<ServiceResult<MonthlySummary>> {
    try {
      const targetDate = new Date();
      if (year && month) {
        targetDate.setFullYear(year, month - 1, 1);
      }

      const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      // Previous month dates
      const previousMonthDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
      const startOfPreviousMonth = new Date(
        previousMonthDate.getFullYear(),
        previousMonthDate.getMonth(),
        1,
      );
      const endOfPreviousMonth = new Date(
        previousMonthDate.getFullYear(),
        previousMonthDate.getMonth() + 1,
        0,
      );

      log.info(
        { userId, startOfMonth, endOfMonth, startOfPreviousMonth, endOfPreviousMonth },
        'Fetching monthly summary',
      );

      // Get current month data
      const { data: currentMonthData, error: currentError } = await this.supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (currentError) {
        log.error({ userId, error: currentError.message }, 'Failed to fetch current month summary');
        return { success: false, error: currentError.message };
      }

      // Get previous month data
      const { data: previousMonthData, error: previousError } = await this.supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId)
        .gte('date', startOfPreviousMonth.toISOString().split('T')[0])
        .lte('date', endOfPreviousMonth.toISOString().split('T')[0]);

      if (previousError) {
        log.error(
          { userId, error: previousError.message },
          'Failed to fetch previous month summary',
        );
        return { success: false, error: previousError.message };
      }

      // Calculate current month summary
      let totalIncome = 0;
      let totalExpenses = 0;
      let transactionCount = 0;

      currentMonthData.forEach((transaction) => {
        const amount = Number(transaction.amount);
        transactionCount++;

        if (transaction.type === 'income') {
          totalIncome += amount;
        } else if (transaction.type === 'expense') {
          totalExpenses += amount;
        }
      });

      const netIncome = totalIncome - totalExpenses;
      const savings = netIncome;

      // Calculate previous month summary
      let prevTotalIncome = 0;
      let prevTotalExpenses = 0;
      let prevTransactionCount = 0;

      previousMonthData.forEach((transaction) => {
        const amount = Number(transaction.amount);
        prevTransactionCount++;

        if (transaction.type === 'income') {
          prevTotalIncome += amount;
        } else if (transaction.type === 'expense') {
          prevTotalExpenses += amount;
        }
      });

      const prevNetIncome = prevTotalIncome - prevTotalExpenses;
      const prevSavings = prevNetIncome;

      const summary: MonthlySummary = {
        month: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`,
        totalIncome,
        totalExpenses,
        netIncome,
        savings,
        transactionCount,
        previousMonth: {
          month: `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`,
          totalIncome: prevTotalIncome,
          totalExpenses: prevTotalExpenses,
          netIncome: prevNetIncome,
          savings: prevSavings,
          transactionCount: prevTransactionCount,
        },
      };

      log.info({ userId, summary }, 'Monthly summary calculated with previous month data');
      return { success: true, data: summary };
    } catch (error) {
      log.error(error, 'Error calculating monthly summary');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get category spending breakdown
   * @param userId - User ID
   * @param type - Transaction type (expense or income)
   * @param dateRange - Optional date range filter (from and/or to dates)
   * Converts all amounts to user's base currency for consistent display
   */
  async getCategorySpending(
    userId: string,
    type: 'expense' | 'income' = 'expense',
    dateRange?: { from?: string; to?: string },
  ): Promise<ServiceResult<CategorySpending[]>> {
    try {
      log.info({ userId, type, dateRange }, 'Fetching category spending');

      // Get user's base currency
      const preferencesService = new UserPreferencesService(this.supabase);
      const preferencesResult = await preferencesService.getPreferences(userId);
      const baseCurrency =
        preferencesResult.success && preferencesResult.data.baseCurrency
          ? preferencesResult.data.baseCurrency
          : DEFAULT_CURRENCY;

      // Get account currencies for conversion
      const { data: accounts } = await this.supabase
        .from('accounts')
        .select('id, currency')
        .eq('user_id', userId);
      const accountCurrencyMap = new Map(
        accounts?.map((acc) => [acc.id, acc.currency || DEFAULT_CURRENCY]) || [],
      );

      // Fetch transactions with account IDs
      let query = this.supabase
        .from('transactions')
        .select('category, amount, from_account_id, to_account_id')
        .eq('user_id', userId)
        .eq('type', type);

      // Apply date range filters if provided
      if (dateRange?.from) {
        query = query.gte('date', dateRange.from);
      }

      if (dateRange?.to) {
        query = query.lte('date', dateRange.to);
      }

      const { data, error } = await query;

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch category spending');
        return { success: false, error: error.message };
      }

      // Convert all transactions to base currency
      const currencyService = new CurrencyService(this.supabase);
      const categoryMap = new Map<string, { totalAmount: number; transactionCount: number }>();

      await Promise.all(
        data.map(async (transaction) => {
          // Determine account currency
          const accountId = transaction.from_account_id || transaction.to_account_id;
          const transactionCurrency = accountId
            ? accountCurrencyMap.get(accountId) || DEFAULT_CURRENCY
            : DEFAULT_CURRENCY;

          let amount = Number(transaction.amount);

          // Convert to base currency if needed
          if (transactionCurrency !== baseCurrency) {
            const conversionResult = await currencyService.convertAmount(
              amount,
              transactionCurrency,
              baseCurrency,
            );
            if (conversionResult.success && conversionResult.data !== undefined) {
              amount = conversionResult.data;
            } else {
              log.warn(
                {
                  amount,
                  transactionCurrency,
                  baseCurrency,
                  error: conversionResult.error,
                },
                'Failed to convert transaction amount, using original',
              );
            }
          }

          // Group by category
          const existing = categoryMap.get(transaction.category) || {
            totalAmount: 0,
            transactionCount: 0,
          };
          categoryMap.set(transaction.category, {
            totalAmount: existing.totalAmount + amount,
            transactionCount: existing.transactionCount + 1,
          });
        }),
      );

      const totalSpending = Array.from(categoryMap.values()).reduce(
        (sum, cat) => sum + cat.totalAmount,
        0,
      );

      const categorySpending: CategorySpending[] = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          totalAmount: data.totalAmount,
          transactionCount: data.transactionCount,
          percentage: totalSpending > 0 ? (data.totalAmount / totalSpending) * 100 : 0,
        }),
      );

      // Sort by total amount descending
      categorySpending.sort((a, b) => b.totalAmount - a.totalAmount);

      log.info(
        { userId, count: categorySpending.length, baseCurrency },
        'Category spending retrieved with currency conversion',
      );
      return { success: true, data: categorySpending };
    } catch (error) {
      log.error(error, 'Error fetching category spending');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get transaction count for user
   */
  async getTransactionCount(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<ServiceResult<number>> {
    try {
      let query = this.supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.accountId) {
        query = query.or(
          `from_account_id.eq.${filters.accountId},to_account_id.eq.${filters.accountId}`,
        );
      }

      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      const { count, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: count || 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Search transactions by description, notes, or amount
   * Supports both text search and amount search
   */
  async searchTransactions(
    userId: string,
    searchTerm: string,
  ): Promise<ServiceResult<Transaction[]>> {
    try {
      log.info({ userId, searchTerm }, 'Searching transactions');

      let query = this.supabase.from('transactions').select('*').eq('user_id', userId);

      // Check if searchTerm is a number (amount search)
      const searchAmount = parseFloat(searchTerm);
      const isAmountSearch = !isNaN(searchAmount) && isFinite(searchAmount);

      if (isAmountSearch) {
        // For amount search: fetch transactions that match either the amount or the text
        // We'll use a range query for amount (with tolerance) and text search, then filter client-side
        const tolerance = 0.01;
        // First try to get transactions matching amount (with tolerance range)
        query = query.or(
          `amount.gte.${searchAmount - tolerance},amount.lte.${searchAmount + tolerance}`,
        );
      } else {
        // Text search only
        query = query.or(`description.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('date', { ascending: false }).limit(200);

      if (error) {
        log.error({ userId, searchTerm, error: error.message }, 'Failed to search transactions');
        return { success: false, error: error.message };
      }

      // Filter results client-side for better precision
      let filteredData: Transaction[] = [];

      if (isAmountSearch && data) {
        // For amount search, also check text matches and combine with amount matches
        const amountMatches = data.filter((transaction) => {
          const amount = Number(transaction.amount);
          return Math.abs(amount - searchAmount) < 0.01;
        });

        // Also search for text matches if the search term appears in description/notes
        const textMatches = data.filter(
          (transaction) =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.notes &&
              transaction.notes.toLowerCase().includes(searchTerm.toLowerCase())),
        );

        // Combine and deduplicate
        const allMatches = [...amountMatches, ...textMatches];
        const uniqueMatches = Array.from(new Map(allMatches.map((t) => [t.id, t])).values());
        filteredData = uniqueMatches;
      } else if (data) {
        // For text-only searches, data is already filtered by query
        filteredData = data;
      }

      // Sort by date (most recent first) and limit to 50 results
      filteredData = filteredData
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 50);

      log.info({ userId, searchTerm, count: filteredData.length }, 'Transaction search completed');
      return { success: true, data: filteredData };
    } catch (error) {
      log.error(error, 'Error searching transactions');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get balance history for accounts
   */
  async getBalanceHistory(
    userId: string,
    filters: BalanceHistoryFilters,
  ): Promise<ServiceResult<BalanceHistoryChart[]>> {
    try {
      log.info({ userId, filters }, 'Getting balance history');

      const { data: transactions, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', filters.startDate.toISOString().split('T')[0])
        .lte('date', filters.endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        log.error(error, 'Error fetching transactions for balance history');
        return { success: false, error: error.message };
      }

      if (!transactions || transactions.length === 0) {
        return { success: true, data: [] };
      }

      // Get user's base currency for conversion
      const preferencesService = new UserPreferencesService(this.supabase);
      const preferencesResult = await preferencesService.getPreferences(userId);
      const baseCurrency =
        preferencesResult.success && preferencesResult.data.baseCurrency
          ? preferencesResult.data.baseCurrency
          : DEFAULT_CURRENCY;

      // Get current account balances with currencies
      const { data: accounts } = await this.supabase
        .from('accounts')
        .select('id, balance, currency')
        .eq('user_id', userId)
        .in('id', filters.accountIds);

      if (!accounts) {
        return { success: true, data: [] };
      }

      const accountMap = new Map(
        accounts.map((acc) => [
          acc.id,
          { balance: acc.balance, currency: acc.currency || DEFAULT_CURRENCY },
        ]),
      );
      const currencyService = new CurrencyService(this.supabase);

      // Group transactions by account and period
      const groupedTransactions = this.groupTransactionsByPeriod(transactions, filters.period);

      // Calculate balance history for each account
      const balanceHistory: BalanceHistoryChart[] = [];

      for (const accountId of filters.accountIds) {
        const accountData = accountMap.get(accountId);
        if (!accountData) continue;

        const accountCurrency = accountData.currency;
        let currentBalance = Number(accountData.balance);
        const accountTransactions = groupedTransactions[accountId] || [];

        // Convert current balance to base currency if needed
        if (accountCurrency !== baseCurrency) {
          const conversionResult = await currencyService.convertAmount(
            currentBalance,
            accountCurrency,
            baseCurrency,
          );
          if (conversionResult.success && conversionResult.data !== undefined) {
            currentBalance = conversionResult.data;
          } else {
            log.warn(
              { accountId, accountCurrency, baseCurrency, error: conversionResult.error },
              'Failed to convert current balance, using original',
            );
          }
        }

        // Calculate balance for each period by working backwards from current balance
        const balanceData: BalanceHistoryPoint[] = [];
        let runningBalance = currentBalance;

        // Process periods in reverse order to calculate historical balances
        const periods = this.getPeriodsInRange(filters.startDate, filters.endDate, filters.period);

        for (let i = periods.length - 1; i >= 0; i--) {
          const period = periods[i];
          const periodTransactions = accountTransactions[period] || [];

          // Calculate net change for this period (convert amounts to base currency)
          let netChange = 0;
          await Promise.all(
            periodTransactions.map(async (transaction) => {
              let amount = Number(transaction.amount);
              // Determine transaction currency based on account involved
              const transactionCurrency = accountCurrency;

              // Convert to base currency if needed
              if (transactionCurrency !== baseCurrency) {
                const conversionResult = await currencyService.convertAmount(
                  amount,
                  transactionCurrency,
                  baseCurrency,
                );
                if (conversionResult.success && conversionResult.data !== undefined) {
                  amount = conversionResult.data;
                }
              }

              if (transaction.from_account_id === accountId) {
                netChange -= amount; // Money going out
              } else if (transaction.to_account_id === accountId) {
                netChange += amount; // Money coming in
              }
            }),
          );

          // Calculate balance at the end of this period
          const periodEndBalance = runningBalance - netChange;

          balanceData.unshift({
            period: period,
            balance: Math.max(0, periodEndBalance), // Ensure non-negative
            month: this.getMonthFromPeriod(period, filters.period),
          });

          runningBalance = periodEndBalance;
        }

        balanceHistory.push({
          accountId,
          data: balanceData,
        });
      }

      log.info({ userId, accountCount: balanceHistory.length }, 'Balance history retrieved');
      return { success: true, data: balanceHistory };
    } catch (error) {
      log.error(error, 'Error getting balance history');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get periods in a date range
   */
  private getPeriodsInRange(
    startDate: Date,
    endDate: Date,
    period: 'daily' | 'weekly' | 'monthly',
  ): string[] {
    const periods: string[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      let periodKey: string;

      if (period === 'daily') {
        periodKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
      } else if (period === 'weekly') {
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        current.setDate(current.getDate() + 7);
      } else {
        // monthly
        periodKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
      }

      periods.push(periodKey);
    }

    return periods;
  }

  /**
   * Get month number from period string
   */
  private getMonthFromPeriod(period: string, periodType: 'daily' | 'weekly' | 'monthly'): number {
    if (periodType === 'monthly') {
      return parseInt(period.split('-')[1]);
    }

    const date = new Date(period);
    return date.getMonth() + 1;
  }

  /**
   * Export transactions to CSV format
   * Optionally converts all amounts to user's base currency
   */
  async exportTransactionsToCSV(
    userId: string,
    filters: TransactionFilters = {},
    options?: { convertToBaseCurrency?: boolean },
  ): Promise<ServiceResult<string>> {
    try {
      log.info({ userId, filters, options }, 'Starting CSV export');

      // Get user's base currency if conversion is requested
      let baseCurrency: string | undefined;
      let currencyService: CurrencyService | undefined;
      let accountCurrencyMap: Map<string, string> | undefined;

      if (options?.convertToBaseCurrency) {
        const preferencesService = new UserPreferencesService(this.supabase);
        const preferencesResult = await preferencesService.getPreferences(userId);
        baseCurrency =
          preferencesResult.success && preferencesResult.data.baseCurrency
            ? preferencesResult.data.baseCurrency
            : DEFAULT_CURRENCY;
        currencyService = new CurrencyService(this.supabase);

        // Get account currencies for conversion
        const { data: accounts } = await this.supabase
          .from('accounts')
          .select('id, currency')
          .eq('user_id', userId);
        accountCurrencyMap = new Map(
          accounts?.map((acc) => [acc.id, acc.currency || DEFAULT_CURRENCY]) || [],
        );
      }

      // Get transactions with filters
      const transactionsResult = await this.getTransactions(userId, filters);
      if (!transactionsResult.success) {
        return { success: false, error: transactionsResult.error };
      }

      const transactions = transactionsResult.data?.data || [];

      if (transactions.length === 0) {
        const headers = baseCurrency
          ? `Date,Description,Amount (${baseCurrency}),Original Amount,Original Currency,Type,Category,Account,From Account,To Account,Notes\n`
          : 'Date,Description,Amount,Type,Category,Account,From Account,To Account,Notes\n';
        return { success: true, data: headers };
      }

      // Get account names for better CSV data
      const { data: accounts } = await this.supabase
        .from('accounts')
        .select('id, name, currency')
        .eq('user_id', userId);

      const accountMap = new Map(accounts?.map((acc) => [acc.id, acc.name]) || []);

      // Generate CSV content with optional currency conversion
      const csvHeaders = baseCurrency
        ? `Date,Description,Amount (${baseCurrency}),Original Amount,Original Currency,Type,Category,Account,From Account,To Account,Notes\n`
        : 'Date,Description,Amount,Type,Category,Account,From Account,To Account,Notes\n';

      const csvRows = await Promise.all(
        transactions.map(async (transaction) => {
          const date = new Date(transaction.date).toLocaleDateString();
          const description = `"${transaction.description.replace(/"/g, '""')}"`;
          const type = transaction.type;
          const category = `"${transaction.category || ''}"`;
          const account = `"${accountMap.get(transaction.from_account_id || transaction.to_account_id || '') || 'Unknown'}"`;
          const fromAccount = transaction.from_account_id
            ? `"${accountMap.get(transaction.from_account_id) || 'Unknown'}"`
            : '';
          const toAccount = transaction.to_account_id
            ? `"${accountMap.get(transaction.to_account_id) || 'Unknown'}"`
            : '';
          const notes = `"${(transaction.notes || '').replace(/"/g, '""')}"`;

          if (baseCurrency && currencyService && accountCurrencyMap) {
            // Get transaction currency
            const accountId = transaction.from_account_id || transaction.to_account_id;
            const transactionCurrency = accountId
              ? accountCurrencyMap.get(accountId) || DEFAULT_CURRENCY
              : DEFAULT_CURRENCY;

            // Convert to base currency
            const conversionResult = await currencyService.convertAmount(
              transaction.amount,
              transactionCurrency,
              baseCurrency,
            );

            const convertedAmount = conversionResult.success
              ? conversionResult.data || transaction.amount
              : transaction.amount;
            const originalAmount = transaction.amount.toFixed(2);

            return `${date},${description},${convertedAmount.toFixed(2)},${originalAmount},${transactionCurrency},${type},${category},${account},${fromAccount},${toAccount},${notes}`;
          } else {
            const amount = transaction.amount.toFixed(2);
            return `${date},${description},${amount},${type},${category},${account},${fromAccount},${toAccount},${notes}`;
          }
        }),
      );

      const csvContent = csvHeaders + csvRows.join('\n');

      log.info(
        { userId, transactionCount: transactions.length, baseCurrency },
        'CSV export completed',
      );
      return { success: true, data: csvContent };
    } catch (error) {
      log.error(error, 'Error exporting transactions to CSV');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Export transactions to JSON format
   * Optionally converts all amounts to user's base currency
   */
  async exportTransactionsToJSON(
    userId: string,
    filters: TransactionFilters = {},
    options?: { convertToBaseCurrency?: boolean },
  ): Promise<ServiceResult<string>> {
    try {
      log.info({ userId, filters, options }, 'Starting JSON export');

      // Get user's base currency if conversion is requested
      let baseCurrency: string | undefined;
      let currencyService: CurrencyService | undefined;

      if (options?.convertToBaseCurrency) {
        const preferencesService = new UserPreferencesService(this.supabase);
        const preferencesResult = await preferencesService.getPreferences(userId);
        baseCurrency =
          preferencesResult.success && preferencesResult.data.baseCurrency
            ? preferencesResult.data.baseCurrency
            : DEFAULT_CURRENCY;
        currencyService = new CurrencyService(this.supabase);
      }

      // Get transactions with filters
      const transactionsResult = await this.getTransactions(userId, filters);
      if (!transactionsResult.success) {
        return { success: false, error: transactionsResult.error };
      }

      const transactions = transactionsResult.data?.data || [];

      // Get account names
      const { data: accounts } = await this.supabase
        .from('accounts')
        .select('id, name, currency')
        .eq('user_id', userId);

      const accountMap = new Map(accounts?.map((acc) => [acc.id, acc.name]) || []);
      const accountCurrencyDataMap = new Map(
        accounts?.map((acc) => [acc.id, acc.currency || DEFAULT_CURRENCY]) || [],
      );

      // Convert transactions with optional currency conversion
      const exportData = {
        exportDate: new Date().toISOString(),
        dateRange: {
          from: filters.dateFrom || null,
          to: filters.dateTo || null,
        },
        baseCurrency: baseCurrency || null,
        transactionCount: transactions.length,
        transactions: await Promise.all(
          transactions.map(async (transaction) => {
            const accountId = transaction.from_account_id || transaction.to_account_id;
            const transactionCurrency = accountId
              ? accountCurrencyDataMap.get(accountId) || DEFAULT_CURRENCY
              : DEFAULT_CURRENCY;

            let convertedAmount: number | null = null;
            if (baseCurrency && currencyService && transactionCurrency !== baseCurrency) {
              const conversionResult = await currencyService.convertAmount(
                transaction.amount,
                transactionCurrency,
                baseCurrency,
              );
              convertedAmount = conversionResult.success ? conversionResult.data || null : null;
            }

            return {
              id: transaction.id,
              date: transaction.date,
              description: transaction.description,
              type: transaction.type,
              category: transaction.category,
              amount: transaction.amount,
              currency: transactionCurrency,
              ...(convertedAmount !== null && {
                convertedAmount: convertedAmount,
                convertedCurrency: baseCurrency,
              }),
              fromAccount: transaction.from_account_id
                ? {
                    id: transaction.from_account_id,
                    name: accountMap.get(transaction.from_account_id) || 'Unknown',
                  }
                : null,
              toAccount: transaction.to_account_id
                ? {
                    id: transaction.to_account_id,
                    name: accountMap.get(transaction.to_account_id) || 'Unknown',
                  }
                : null,
              notes: transaction.notes,
              createdAt: transaction.created_at,
              updatedAt: transaction.updated_at,
            };
          }),
        ),
      };

      const jsonContent = JSON.stringify(exportData, null, 2);

      log.info(
        { userId, transactionCount: transactions.length, baseCurrency },
        'JSON export completed',
      );
      return { success: true, data: jsonContent };
    } catch (error) {
      log.error(error, 'Error exporting transactions to JSON');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Group transactions by account and period
   */
  private groupTransactionsByPeriod(
    transactions: Transaction[],
    period: 'daily' | 'weekly' | 'monthly',
  ): Record<string, Record<string, Transaction[]>> {
    const grouped: Record<string, Record<string, Transaction[]>> = {};

    transactions.forEach((transaction) => {
      const accountId = transaction.from_account_id || transaction.to_account_id;
      if (!accountId) return;

      if (!grouped[accountId]) {
        grouped[accountId] = {};
      }

      const date = new Date(transaction.date);
      let periodKey: string;

      if (period === 'daily') {
        periodKey = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
      } else {
        // monthly
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[accountId][periodKey]) {
        grouped[accountId][periodKey] = [];
      }

      grouped[accountId][periodKey].push(transaction);
    });

    return grouped;
  }
}
