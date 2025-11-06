'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccounts, deleteAccount } from '@/lib/actions/finance-actions';
import { notifySuccess, notifyError } from '@/lib/notifications';
import type { Account } from '@/types/finance.types';

interface UseAccountsResult {
  accounts: Account[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleDeleteAccount: (account: Account) => Promise<void>;
  isDeleting: string | null;
}

export function useAccounts(): UseAccountsResult {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadAccounts = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }
      const result = await getAccounts();

      if (result.success && 'data' in result) {
        setAccounts(result.data as Account[]);
        setError(null);
      } else {
        const errorMessage = result.error || 'Failed to load accounts';
        if (!silent) {
          setError(errorMessage);
          notifyError('Failed to load accounts', {
            description: result.error,
          });
        }
      }
    } catch {
      const errorMessage = 'Failed to load accounts';
      if (!silent) {
        setError(errorMessage);
        notifyError(errorMessage);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleDeleteAccount = useCallback(
    async (account: Account) => {
      if (account.is_mandatory) {
        notifyError('This account cannot be deleted', { description: 'Mandatory account' });
        return;
      }

      // This function now just performs the deletion
      // The confirmation should be handled in the component that uses this hook
      try {
        setIsDeleting(account.id);
        const previous = accounts;
        setAccounts((prev) => prev?.filter((a) => a.id !== account.id) || null);
        const result = await deleteAccount(account.id);

        if (result.success) {
          notifySuccess('Account deleted successfully');
        } else {
          notifyError('Failed to delete account', {
            description: result.error,
          });
          setAccounts(previous);
        }
      } catch {
        notifyError('Failed to delete account');
        await loadAccounts();
      } finally {
        setIsDeleting(null);
      }
    },
    [accounts, loadAccounts],
  );

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    isLoading,
    error,
    refetch: () => loadAccounts(true), // Silent refetch - doesn't show loading spinner
    handleDeleteAccount,
    isDeleting,
  };
}
