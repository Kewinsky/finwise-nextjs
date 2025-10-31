'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccounts, deleteAccount } from '@/lib/actions/finance-actions';
import { notifySuccess, notifyError } from '@/lib/notifications';
import type { Account } from '@/types/finance.types';

interface UseAccountsResult {
  accounts: Account[] | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  handleDeleteAccount: (account: Account) => Promise<void>;
  isDeleting: string | null;
}

export function useAccounts(): UseAccountsResult {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAccounts();

      if (result.success && 'data' in result) {
        setAccounts(result.data as Account[]);
      } else {
        notifyError('Failed to load accounts', {
          description: result.error,
        });
      }
    } catch {
      notifyError('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteAccount = useCallback(
    async (account: Account) => {
      if (account.is_mandatory) {
        notifyError('This account cannot be deleted', { description: 'Mandatory account' });
        return;
      }

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
    refetch: loadAccounts,
    handleDeleteAccount,
    isDeleting,
  };
}
