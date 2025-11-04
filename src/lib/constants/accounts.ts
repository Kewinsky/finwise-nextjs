import { CreditCard, PiggyBank, TrendingUp, Building, LucideIcon } from 'lucide-react';
import type { AccountType } from '@/types/finance.types';

/**
 * Account types with icons
 * Note: Icons are kept here because they're React components and shouldn't be in config
 */
export const ACCOUNT_TYPES: Record<AccountType | 'other', { label: string; icon: LucideIcon }> = {
  checking: { label: 'Checking', icon: CreditCard },
  savings: { label: 'Savings', icon: PiggyBank },
  creditcard: { label: 'Credit Card', icon: CreditCard },
  investment: { label: 'Investment', icon: TrendingUp },
  other: { label: 'Other', icon: Building },
};

// Re-export ACCOUNT_COLORS from config for backward compatibility
export { ACCOUNT_COLORS } from '@/config/app';
