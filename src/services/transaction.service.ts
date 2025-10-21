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
} from '@/types/finance.types';
import { log } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants/errors';

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
   */
  async createTransaction(
    userId: string,
    input: CreateTransactionInput,
  ): Promise<ServiceResult<Transaction>> {
    try {
      log.info({ userId, type: input.type, amount: input.amount }, 'Creating transaction');

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
  async getSpendingTrends(userId: string, days = 7): Promise<ServiceResult<SpendingTrends[]>> {
    try {
      log.info({ userId, days }, 'Fetching spending trends');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

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

      log.info({ userId, startOfMonth, endOfMonth }, 'Fetching monthly summary');

      const { data, error } = await this.supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch monthly summary');
        return { success: false, error: error.message };
      }

      let totalIncome = 0;
      let totalExpenses = 0;
      let transactionCount = 0;

      data.forEach((transaction) => {
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

      const summary: MonthlySummary = {
        month: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`,
        totalIncome,
        totalExpenses,
        netIncome,
        savings,
        transactionCount,
      };

      log.info({ userId, summary }, 'Monthly summary calculated');
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
   */
  async getCategorySpending(
    userId: string,
    type: 'expense' | 'income' = 'expense',
  ): Promise<ServiceResult<CategorySpending[]>> {
    try {
      log.info({ userId, type }, 'Fetching category spending');

      const { data, error } = await this.supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', userId)
        .eq('type', type);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch category spending');
        return { success: false, error: error.message };
      }

      // Group by category and calculate totals
      const categoryMap = new Map<string, { totalAmount: number; transactionCount: number }>();

      data.forEach((transaction) => {
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

      log.info({ userId, count: categorySpending.length }, 'Category spending retrieved');
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
   * Search transactions by description or notes
   */
  async searchTransactions(
    userId: string,
    searchTerm: string,
  ): Promise<ServiceResult<Transaction[]>> {
    try {
      log.info({ userId, searchTerm }, 'Searching transactions');

      const { data, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .or(`description.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order('date', { ascending: false })
        .limit(50);

      if (error) {
        log.error({ userId, searchTerm, error: error.message }, 'Failed to search transactions');
        return { success: false, error: error.message };
      }

      log.info({ userId, searchTerm, count: data.length }, 'Transaction search completed');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error searching transactions');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }
}
