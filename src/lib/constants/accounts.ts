import { CreditCard, PiggyBank, TrendingUp, Building, LucideIcon } from 'lucide-react';
import type { AccountType } from '@/types/finance.types';

export const ACCOUNT_TYPES: Record<AccountType | 'other', { label: string; icon: LucideIcon }> = {
  checking: { label: 'Checking', icon: CreditCard },
  savings: { label: 'Savings', icon: PiggyBank },
  creditcard: { label: 'Credit Card', icon: CreditCard },
  investment: { label: 'Investment', icon: TrendingUp },
  other: { label: 'Other', icon: Building },
};

export const ACCOUNT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
];
