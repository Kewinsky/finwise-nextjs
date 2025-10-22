import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  AccountFilters,
  AccountBalance,
  AccountType,
} from '@/types/finance.types';
import { log } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants/errors';

/**
 * AccountService handles all account-related business logic
 *
 * Responsibilities:
 * - Account CRUD operations
 * - Account balance calculations
 * - Account filtering and search
 * - Account type management
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const accountService = new AccountService(supabase);
 *
 * const result = await accountService.getAccounts(userId);
 * if (result.success) {
 *   console.log(`Found ${result.data.length} accounts`);
 * }
 * ```
 */
export class AccountService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Get all accounts for a user
   */
  async getAccounts(userId: string, filters?: AccountFilters): Promise<ServiceResult<Account[]>> {
    try {
      log.info({ userId, filters }, 'Fetching user accounts');

      let query = this.supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.currency) {
        query = query.eq('currency', filters.currency);
      }

      if (filters?.minBalance !== undefined) {
        query = query.gte('balance', filters.minBalance);
      }

      if (filters?.maxBalance !== undefined) {
        query = query.lte('balance', filters.maxBalance);
      }

      const { data, error } = await query;

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch accounts');
        return { success: false, error: error.message };
      }

      log.info({ userId, count: data.length }, 'Accounts retrieved successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error fetching accounts');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get account by ID
   */
  async getAccountById(accountId: string, userId: string): Promise<ServiceResult<Account>> {
    try {
      log.info({ accountId, userId }, 'Fetching account by ID');

      const { data, error } = await this.supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          log.warn({ accountId, userId }, 'Account not found');
          return { success: false, error: ERROR_MESSAGES.DATA_NOT_FOUND };
        }
        log.error({ accountId, userId, error: error.message }, 'Failed to fetch account');
        return { success: false, error: error.message };
      }

      log.info({ accountId, userId }, 'Account retrieved successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error fetching account');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Create a new account
   */
  async createAccount(userId: string, input: CreateAccountInput): Promise<ServiceResult<Account>> {
    try {
      log.info({ userId, accountName: input.name, type: input.type }, 'Creating account');

      const accountData = {
        user_id: userId,
        name: input.name,
        type: input.type,
        balance: input.balance || 0,
        currency: input.currency || 'USD',
        color: input.color || null,
      };

      const { data, error } = await this.supabase
        .from('accounts')
        .insert(accountData)
        .select()
        .single();

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to create account');
        return { success: false, error: error.message };
      }

      log.info({ userId, accountId: data.id }, 'Account created successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error creating account');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Update an account
   */
  async updateAccount(
    accountId: string,
    userId: string,
    input: UpdateAccountInput,
  ): Promise<ServiceResult<Account>> {
    try {
      log.info({ accountId, userId }, 'Updating account');

      // Build update object dynamically to avoid overwriting with undefined
      const updateData: Partial<Account> = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }

      if (input.type !== undefined) {
        updateData.type = input.type;
      }

      if (input.balance !== undefined) {
        updateData.balance = input.balance;
      }

      if (input.currency !== undefined) {
        updateData.currency = input.currency;
      }

      if (input.color !== undefined) {
        updateData.color = input.color;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('accounts')
        .update(updateData)
        .eq('id', accountId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          log.warn({ accountId, userId }, 'Account not found for update');
          return { success: false, error: ERROR_MESSAGES.DATA_NOT_FOUND };
        }
        log.error({ accountId, userId, error: error.message }, 'Failed to update account');
        return { success: false, error: error.message };
      }

      log.info({ accountId, userId }, 'Account updated successfully');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error updating account');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Delete an account
   */
  async deleteAccount(accountId: string, userId: string): Promise<ServiceResult<void>> {
    try {
      log.info({ accountId, userId }, 'Deleting account');

      // First check if account exists and belongs to user
      const accountResult = await this.getAccountById(accountId, userId);
      if (!accountResult.success) {
        return accountResult;
      }

      // Prevent deletion of mandatory accounts (defense-in-depth; DB trigger also enforces)
      const account = accountResult.data;
      if ('is_mandatory' in account && account.is_mandatory === true) {
        return { success: false, error: 'Cannot delete mandatory account' };
      }

      // Check if account has transactions (either as source or destination account)
      const { data: transactions, error: transactionsError } = await this.supabase
        .from('transactions')
        .select('id')
        .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
        .limit(1);

      if (transactionsError) {
        log.error(
          { accountId, userId, error: transactionsError.message },
          'Failed to check transactions',
        );
        return { success: false, error: transactionsError.message };
      }

      if (transactions && transactions.length > 0) {
        return { success: false, error: 'Cannot delete account with existing transactions' };
      }

      const { error } = await this.supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', userId);

      if (error) {
        log.error({ accountId, userId, error: error.message }, 'Failed to delete account');
        return { success: false, error: error.message };
      }

      log.info({ accountId, userId }, 'Account deleted successfully');
      return { success: true, data: undefined };
    } catch (error) {
      log.error(error, 'Error deleting account');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get total balance across all accounts for a user
   */
  async getTotalBalance(userId: string): Promise<ServiceResult<number>> {
    try {
      log.info({ userId }, 'Calculating total balance');

      const { data, error } = await this.supabase
        .from('accounts')
        .select('balance, currency')
        .eq('user_id', userId);

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to calculate total balance');
        return { success: false, error: error.message };
      }

      // For now, we'll sum all balances regardless of currency
      // In a real app, you'd want to convert currencies
      const totalBalance = data.reduce((sum, account) => sum + Number(account.balance), 0);

      log.info({ userId, totalBalance }, 'Total balance calculated');
      return { success: true, data: totalBalance };
    } catch (error) {
      log.error(error, 'Error calculating total balance');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get account balances grouped by account
   */
  async getAccountBalances(userId: string): Promise<ServiceResult<AccountBalance[]>> {
    try {
      log.info({ userId }, 'Fetching account balances');

      const { data, error } = await this.supabase
        .from('accounts')
        .select('id, name, type, balance, currency, color')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        log.error({ userId, error: error.message }, 'Failed to fetch account balances');
        return { success: false, error: error.message };
      }

      const balances: AccountBalance[] = data.map((account) => ({
        accountId: account.id,
        accountName: account.name,
        accountType: account.type as AccountType,
        balance: Number(account.balance),
        currency: account.currency,
        color: account.color || undefined,
      }));

      log.info({ userId, count: balances.length }, 'Account balances retrieved');
      return { success: true, data: balances };
    } catch (error) {
      log.error(error, 'Error fetching account balances');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(userId: string, type: AccountType): Promise<ServiceResult<Account[]>> {
    try {
      log.info({ userId, type }, 'Fetching accounts by type');

      const { data, error } = await this.supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('name');

      if (error) {
        log.error({ userId, type, error: error.message }, 'Failed to fetch accounts by type');
        return { success: false, error: error.message };
      }

      log.info({ userId, type, count: data.length }, 'Accounts by type retrieved');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error fetching accounts by type');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }

  /**
   * Check if account exists and belongs to user
   */
  async accountExists(accountId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('accounts')
        .select('id')
        .eq('id', accountId)
        .eq('user_id', userId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get account count for user
   */
  async getAccountCount(userId: string): Promise<ServiceResult<number>> {
    try {
      const { count, error } = await this.supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

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
   * Search accounts by name
   */
  async searchAccounts(userId: string, searchTerm: string): Promise<ServiceResult<Account[]>> {
    try {
      log.info({ userId, searchTerm }, 'Searching accounts');

      const { data, error } = await this.supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${searchTerm}%`)
        .order('name');

      if (error) {
        log.error({ userId, searchTerm, error: error.message }, 'Failed to search accounts');
        return { success: false, error: error.message };
      }

      log.info({ userId, searchTerm, count: data.length }, 'Account search completed');
      return { success: true, data };
    } catch (error) {
      log.error(error, 'Error searching accounts');
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED,
      };
    }
  }
}
