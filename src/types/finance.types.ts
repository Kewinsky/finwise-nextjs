/**
 * Account-related types for Finwise financial management
 */

import type { Database } from './database.types';

// =============================================================================
// ENUMS
// =============================================================================

export type AccountType = 'checking' | 'savings' | 'investment' | 'creditcard';
export type TransactionType = 'income' | 'expense' | 'transfer';

// =============================================================================
// DATABASE TYPES
// =============================================================================

export type Account = Database['public']['Tables']['accounts']['Row'];
export type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
export type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

// =============================================================================
// SERVICE INPUT TYPES
// =============================================================================

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
  color?: string;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  color?: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  date: string; // ISO date string
  notes?: string;
  fromAccountId?: string;
  toAccountId?: string;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  description?: string;
  category?: string;
  amount?: number;
  date?: string; // ISO date string
  notes?: string;
  fromAccountId?: string;
  toAccountId?: string;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface AccountFilters {
  type?: AccountType;
  currency?: string;
  minBalance?: number;
  maxBalance?: number;
}

export interface TransactionFilters {
  accountId?: string;
  type?: TransactionType;
  category?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  minAmount?: number;
  maxAmount?: number;
  search?: string; // Search in description and notes
}

// =============================================================================
// AGGREGATION TYPES
// =============================================================================

export interface MonthlySummary {
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savings: number;
  transactionCount: number;
  // Previous month data for comparison
  previousMonth?: {
    month: string;
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    savings: number;
    transactionCount: number;
  };
}

export interface SpendingTrends {
  date: string; // ISO date string
  amount: number;
  type: TransactionType;
  category: string;
}

export interface CategorySpending {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number; // Percentage of total spending
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  color?: string;
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

export interface DashboardMetrics {
  monthlySummary: MonthlySummary;
  recentTransactions: RecentTransaction[];
  spendingTrends: SpendingTrends[];
  totalBalance: number;
  accountCount: number;
  previousMonthBalance?: number;
}

export interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  accountName: string;
}

// =============================================================================
// AI INSIGHTS TYPES
// =============================================================================

export interface FinancialInsights {
  spendingInsights: string[];
  savingsTips: string[];
  budgetOptimization: string[];
  areasOfConcern: string[];
}

export interface AIQuestionResponse {
  answer: string;
  suggestions?: string[];
  relatedData?: {
    transactions?: RecentTransaction[];
    accounts?: AccountBalance[];
  };
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export interface TransactionExport {
  transactions: Transaction[];
  accounts: Account[];
  exportDate: string;
  dateRange: {
    from: string;
    to: string;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const ACCOUNT_TYPES: AccountType[] = ['checking', 'savings', 'investment', 'creditcard'];
export const TRANSACTION_TYPES: TransactionType[] = ['income', 'expense', 'transfer'];

export const DEFAULT_CURRENCY = 'USD';
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export const COMMON_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other'],
  expense: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
  ],
  transfer: ['Transfer', 'Payment', 'Refund', 'Other'],
};

// =============================================================================
// FORM PROPS TYPES
// =============================================================================

export interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newTransaction?: Transaction, updatedTransaction?: Transaction) => void;
  defaultType?: TransactionType;
  transaction?: {
    id: string;
    type: string;
    amount: number;
    description: string;
    fromAccountId?: string | null;
    toAccountId?: string | null;
    account?: string;
    category: string;
    date: Date;
    notes?: string;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

// =============================================================================
// BALANCE HISTORY TYPES
// =============================================================================

export interface BalanceHistoryPoint {
  period: string;
  balance: number;
  month: number;
}

export interface BalanceHistoryChart {
  accountId: string;
  data: BalanceHistoryPoint[];
}

export interface BalanceHistoryFilters {
  accountIds: string[];
  startDate: Date;
  endDate: Date;
  period: 'daily' | 'weekly' | 'monthly';
}
