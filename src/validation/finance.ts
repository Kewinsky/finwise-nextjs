/**
 * Zod validation schemas for Finwise financial management
 */

import { z } from 'zod';

// =============================================================================
// ENUM VALIDATION
// =============================================================================

export const accountTypeSchema = z.enum(['checking', 'savings', 'investment', 'creditcard']);
export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer']);

// =============================================================================
// ACCOUNT SCHEMAS
// =============================================================================

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters')
    .trim(),
  type: accountTypeSchema,
  balance: z
    .number()
    .min(0, 'Balance cannot be negative')
    .max(999999999.99, 'Balance is too large')
    .optional()
    .default(0),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional(),
});

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters')
    .trim()
    .optional(),
  type: accountTypeSchema.optional(),
  balance: z
    .number()
    .min(0, 'Balance cannot be negative')
    .max(999999999.99, 'Balance is too large')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional(),
});

export const accountFiltersSchema = z.object({
  type: accountTypeSchema.optional(),
  minBalance: z.number().min(0).optional(),
  maxBalance: z.number().min(0).optional(),
});

// =============================================================================
// TRANSACTION SCHEMAS
// =============================================================================

const baseTransactionSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters')
    .trim(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters')
    .trim(),
  amount: z.number().positive('Amount must be positive').max(999999999.99, 'Amount is too large'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
    .refine(
      (date) => {
        const transactionDate = new Date(date);
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
        return transactionDate <= maxFutureDate;
      },
      {
        message: 'Transaction date cannot be more than 1 year in the future',
      },
    ),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val === '' ? null : val)),
});

export const createTransactionSchema = baseTransactionSchema
  .extend({
    type: transactionTypeSchema,
    fromAccountId: z.string().uuid('Invalid from account ID').nullable().optional(),
    toAccountId: z.string().uuid('Invalid to account ID').nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'income' && !data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Income must have a destination account',
        path: ['toAccountId'],
      });
    }
    if (data.type === 'expense' && !data.fromAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expense must have a source account',
        path: ['fromAccountId'],
      });
    }
    if (data.type === 'transfer') {
      if (!data.fromAccountId || !data.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Transfer must have both from and to accounts',
          path: ['fromAccountId'],
        });
      } else if (data.fromAccountId === data.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'From and to accounts must be different',
          path: ['toAccountId'],
        });
      }
    }
  });

export const updateTransactionSchema = z.object({
  type: transactionTypeSchema.optional(),
  fromAccountId: z.string().uuid('Invalid from account ID').nullable().optional(),
  toAccountId: z.string().uuid('Invalid to account ID').nullable().optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters')
    .trim()
    .optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters')
    .trim()
    .optional(),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large')
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
    .optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').trim().nullable().optional(),
});

// =============================================================================
// TRANSACTION FORM SCHEMA
// =============================================================================

export const transactionFormSchema = z
  .object({
    type: transactionTypeSchema,
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
      }),
    description: z.string().min(1, 'Description is required'),
    category: z.string().optional(),
    date: z.date(),
    notes: z.string().optional(),
    fromAccount: z.string().optional(),
    toAccount: z.string().optional(),
  })
  .refine(
    (data) => {
      // For transfers, category is optional (will be auto-set to 'transfer')
      if (data.type === 'transfer') {
        return true; // Always allow transfers, category will be auto-set
      }
      // For other types, category is required
      if (!data.category || data.category.length === 0) {
        return false;
      }
      return true;
    },
    {
      message: 'Category is required',
      path: ['category'],
    },
  )
  .refine(
    (data) => {
      if (data.type === 'income' && !data.toAccount) {
        return false;
      }
      return true;
    },
    {
      message: 'To account is required for income',
      path: ['toAccount'],
    },
  )
  .refine(
    (data) => {
      if (data.type === 'expense' && !data.fromAccount) {
        return false;
      }
      return true;
    },
    {
      message: 'From account is required for expenses',
      path: ['fromAccount'],
    },
  )
  .refine(
    (data) => {
      if (data.type === 'transfer' && !data.fromAccount) {
        return false;
      }
      return true;
    },
    {
      message: 'From account is required for transfers',
      path: ['fromAccount'],
    },
  )
  .refine(
    (data) => {
      if (data.type === 'transfer' && !data.toAccount) {
        return false;
      }
      return true;
    },
    {
      message: 'To account is required for transfers',
      path: ['toAccount'],
    },
  )
  .refine(
    (data) => {
      if (
        data.type === 'transfer' &&
        data.fromAccount &&
        data.toAccount &&
        data.fromAccount === data.toAccount
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'From and to accounts must be different',
      path: ['toAccount'],
    },
  );

export const transactionFiltersSchema = z
  .object({
    accountId: z.string().uuid('Invalid account ID').optional(),
    type: transactionTypeSchema.optional(),
    category: z.string().max(50).optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional(),
    search: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        const from = new Date(data.dateFrom);
        const to = new Date(data.dateTo);
        return from <= to;
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateTo'],
    },
  );

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const sortSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// =============================================================================
// AI SCHEMAS
// =============================================================================

export const aiQuestionSchema = z.object({
  message: z
    .string()
    .min(1, 'Question is required')
    .max(500, 'Question must be less than 500 characters')
    .trim(),
});

// =============================================================================
// EXPORT SCHEMAS
// =============================================================================

export const exportFiltersSchema = z
  .object({
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    accountIds: z.array(z.string().uuid()).optional(),
    types: z.array(transactionTypeSchema).optional(),
    categories: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const from = new Date(data.dateFrom);
      const to = new Date(data.dateTo);
      return from <= to;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateTo'],
    },
  );

// =============================================================================
// BULK OPERATIONS SCHEMAS
// =============================================================================

export const bulkDeleteTransactionsSchema = z.object({
  transactionIds: z
    .array(z.string().uuid())
    .min(1, 'At least one transaction ID is required')
    .max(100, 'Cannot delete more than 100 transactions at once'),
});

// =============================================================================
// TYPE INFERENCE
// =============================================================================

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountFilters = z.infer<typeof accountFiltersSchema>;

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFormData = z.infer<typeof transactionFormSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;

export type PaginationOptions = z.infer<typeof paginationSchema>;
export type SortOptions = z.infer<typeof sortSchema>;

export type AIQuestionInput = z.infer<typeof aiQuestionSchema>;
export type ExportFilters = z.infer<typeof exportFiltersSchema>;
export type BulkDeleteTransactionsInput = z.infer<typeof bulkDeleteTransactionsSchema>;
