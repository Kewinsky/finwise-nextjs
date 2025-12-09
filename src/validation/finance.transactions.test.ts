import { describe, it, expect } from 'vitest';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFormSchema,
} from '@/validation/finance';

describe('transaction Zod validation', () => {
  it('allows valid income transaction with destination account', () => {
    const parsed = createTransactionSchema.parse({
      description: 'Salary',
      category: 'salary',
      amount: 5000,
      date: '2025-01-01',
      notes: null,
      type: 'income',
      fromAccountId: null,
      // Valid UUID (version 4, variant 8) to satisfy stricter pattern
      toAccountId: '11111111-1111-4111-8111-111111111111',
    });

    expect(parsed.type).toBe('income');
    expect(parsed.toAccountId).toBeDefined();
  });

  it('rejects income transaction without destination account', () => {
    const result = createTransactionSchema.safeParse({
      description: 'Broken income',
      category: 'salary',
      amount: 1000,
      date: '2025-01-01',
      notes: null,
      type: 'income',
      fromAccountId: null,
      toAccountId: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Income must have a destination account');
    }
  });

  it('rejects transfer when from and to accounts are the same', () => {
    const id = '22222222-2222-4222-8222-222222222222';
    const result = createTransactionSchema.safeParse({
      description: 'Self transfer',
      category: 'transfer',
      amount: 100,
      date: '2025-01-01',
      notes: null,
      type: 'transfer',
      fromAccountId: id,
      toAccountId: id,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('From and to accounts must be different');
    }
  });

  it('transactionFormSchema requires category for non-transfer types', () => {
    const baseData = {
      amount: '10',
      date: new Date('2025-01-01'),
      notes: '',
      fromAccount: 'from-acc',
      toAccount: 'to-acc',
    } as const;

    const result = transactionFormSchema.safeParse({
      ...baseData,
      type: 'expense',
      description: 'Coffee',
      category: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Category is required');
    }
  });

  it('updateTransactionSchema accepts partial updates', () => {
    const parsed = updateTransactionSchema.parse({
      description: 'Updated description',
    });

    expect(parsed.description).toBe('Updated description');
  });

  it('updateTransactionSchema validates date format', () => {
    const result = updateTransactionSchema.safeParse({
      date: '2025/01/01',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Date must be in YYYY-MM-DD format');
    }
  });
});
