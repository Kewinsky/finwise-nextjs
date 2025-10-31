import type { Transaction } from '@/types/finance.types';

export function getTypeBadgeClassName(type: string): string {
  switch (type) {
    case 'income':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
    case 'expense':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
    case 'transfer':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    default:
      return '';
  }
}

export function getAmountClassName(type: string): string {
  switch (type) {
    case 'income':
      return 'text-green-600 dark:text-green-400';
    case 'expense':
      return 'text-red-600 dark:text-red-400';
    case 'transfer':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return '';
  }
}

export function formatTransactionAmount(type: string, amount: number): string {
  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : '';
  return `${prefix}${Math.abs(amount).toFixed(2)}`;
}

export function getAccountName(
  transaction: Transaction,
  accounts: Array<{ id: string; name: string }>,
): string {
  if (transaction.type === 'income') {
    return accounts.find((acc) => acc.id === transaction.to_account_id)?.name || 'Unknown';
  }

  if (transaction.type === 'expense') {
    return accounts.find((acc) => acc.id === transaction.from_account_id)?.name || 'Unknown';
  }

  const fromName =
    accounts.find((acc) => acc.id === transaction.from_account_id)?.name || 'Unknown';
  const toName = accounts.find((acc) => acc.id === transaction.to_account_id)?.name || 'Unknown';
  return `${fromName} → ${toName}`;
}
