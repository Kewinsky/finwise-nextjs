'use client';

import { useState, useEffect } from 'react';
import { AccountForm } from '@/components/accounts/account-form';
import { BalanceHistoryChartComponent } from '@/components/accounts/balance-history-chart';
import { useAccounts } from '@/hooks/use-accounts';
import {
  AccountsGridSkeleton,
  TotalBalanceSkeleton,
  ChartSkeleton,
} from '@/components/common/skeletons';
import { AccountsHeader } from '@/components/accounts/accounts-header';
import { TotalBalanceCard } from '@/components/accounts/total-balance-card';
import { AccountsGrid } from '@/components/accounts/accounts-grid';
import { ACCOUNT_COLORS } from '@/config/app';
import { getTotalBalance } from '@/lib/actions/finance-actions';
import { DeleteConfirmationDialog } from '@/components/common/delete-confirmation-dialog';
import { ErrorState } from '@/components/common/error-state';
import type { Account } from '@/types/finance.types';

export default function AccountsPage() {
  const { accounts, isLoading, error, refetch, handleDeleteAccount, isDeleting } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Fetch total balance with currency conversion
  useEffect(() => {
    const loadTotalBalance = async () => {
      const result = await getTotalBalance();
      if (result.success && 'data' in result && result.data !== undefined) {
        setTotalBalance(result.data);
      }
    };

    if (!isLoading && accounts !== null) {
      loadTotalBalance();
    }
  }, [accounts, isLoading]);

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

  const handleDeleteClick = (account: Account) => {
    if (account.is_mandatory) {
      return;
    }
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    await handleDeleteAccount(accountToDelete);
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
    // Refresh total balance after account deletion
    const result = await getTotalBalance();
    if (result.success && 'data' in result && result.data !== undefined) {
      setTotalBalance(result.data);
    }
  };

  const handleAccountSuccess = async () => {
    handleCloseForm();
    await refetch();
    // Refresh total balance after account changes
    const result = await getTotalBalance();
    if (result.success && 'data' in result && result.data !== undefined) {
      setTotalBalance(result.data);
    }
  };

  return (
    <div className="flex-1 space-y-4 @md:space-y-6 p-4 @md:p-6">
      <AccountsHeader onAddAccount={handleAddAccount} />

      {error ? (
        <ErrorState
          title="Failed to load accounts"
          description={error}
          onRetry={() => refetch()}
          variant="card"
        />
      ) : isLoading || !accounts ? (
        <>
          <TotalBalanceSkeleton />
          <AccountsGridSkeleton />
          <ChartSkeleton height="h-[400px]" />
        </>
      ) : (
        <>
          <TotalBalanceCard totalBalance={totalBalance} />

          <AccountsGrid
            accounts={accounts}
            onEdit={handleEditAccount}
            onDelete={handleDeleteClick}
            isDeleting={isDeleting}
          />

          <BalanceHistoryChartComponent accounts={accounts} />
        </>
      )}

      {showForm && (
        <AccountForm
          open={showForm}
          onOpenChange={handleCloseForm}
          account={editingAccount || undefined}
          colors={[...ACCOUNT_COLORS]}
          onSuccess={handleAccountSuccess}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        description={
          accountToDelete
            ? `Are you sure you want to delete "${accountToDelete.name}"? This will also delete all associated transactions. This action cannot be undone.`
            : 'Are you sure you want to delete this account? This will also delete all associated transactions. This action cannot be undone.'
        }
        isLoading={accountToDelete ? isDeleting === accountToDelete.id : false}
      />
    </div>
  );
}
