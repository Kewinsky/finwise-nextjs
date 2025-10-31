'use client';

import { useState, useMemo } from 'react';
import { AccountForm } from '@/components/accounts/account-form';
import { BalanceHistoryChartComponent } from '@/components/accounts/balance-history-chart';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { useAccounts } from '@/hooks/use-accounts';
import { AccountsHeader } from '@/components/accounts/accounts-header';
import { TotalBalanceCard } from '@/components/accounts/total-balance-card';
import { AccountsGrid } from '@/components/accounts/accounts-grid';
import { EmptyAccountsState } from '@/components/accounts/empty-accounts-state';
import { ACCOUNT_COLORS } from '@/lib/constants/accounts';
import type { Account } from '@/types/finance.types';

export default function AccountsPage() {
  const { accounts, isLoading, refetch, handleDeleteAccount, isDeleting } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const totalBalance = useMemo(
    () => accounts?.reduce((sum, account) => sum + account.balance, 0) || 0,
    [accounts],
  );

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleAccountSuccess = () => {
    handleCloseForm();
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner message="Loading accounts..." />
      </div>
    );
  }

  if (!accounts) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <AccountsHeader onAddAccount={handleAddAccount} />

      <TotalBalanceCard totalBalance={totalBalance} />

      {accounts.length === 0 ? (
        <EmptyAccountsState onAddAccount={handleAddAccount} />
      ) : (
        <AccountsGrid
          accounts={accounts}
          onEdit={handleEditAccount}
          onDelete={handleDeleteAccount}
          isDeleting={isDeleting}
        />
      )}

      {accounts.length > 0 && <BalanceHistoryChartComponent accounts={accounts} />}

      {showForm && (
        <AccountForm
          open={showForm}
          onOpenChange={handleCloseForm}
          account={editingAccount || undefined}
          colors={ACCOUNT_COLORS}
          onSuccess={handleAccountSuccess}
        />
      )}
    </div>
  );
}
