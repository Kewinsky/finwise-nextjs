'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionFiltersComponent } from '@/components/transactions/transaction-filters';
import { TransactionsHeader } from '@/components/transactions/transactions-header';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { deleteManyTransactions, deleteTransaction } from '@/lib/actions/finance-actions';
import { useTransactions } from '@/hooks/use-transactions';
import { DeleteConfirmationDialog } from '@/components/common/delete-confirmation-dialog';
import type { Transaction } from '@/types/finance.types';

export default function TransactionsPage() {
  const {
    allTransactions,
    accounts,
    isLoading,
    filters,
    selectedRows,
    currentPage,
    itemsPerPage,
    sortConfig,
    filteredTransactions,
    sortedTransactions,
    paginatedTransactions,
    totalPages,
    setFilters,
    clearFilters,
    setSelectedRows,
    setCurrentPage,
    setItemsPerPage,
    setSortConfig,
    handleSelectAll,
    handleSelectRow,
    refetch,
  } = useTransactions();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [defaultTransactionType, setDefaultTransactionType] = useState<
    'expense' | 'income' | 'transfer' | undefined
  >();
  const [editingTransaction, setEditingTransaction] = useState<{
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
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Check for openForm query parameter and open form if present
  useEffect(() => {
    const openForm = searchParams.get('openForm');
    if (openForm && ['expense', 'income', 'transfer'].includes(openForm)) {
      setDefaultTransactionType(openForm as 'expense' | 'income' | 'transfer');
      setShowForm(true);
      // Clean up URL by removing query param
      const url = new URL(window.location.href);
      url.searchParams.delete('openForm');
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  const handleSort = (key: string) => {
    if (key !== 'date' && key !== 'amount') return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting('bulk');
      const result = await deleteManyTransactions(selectedRows);

      if (result.success) {
        notifySuccess(`${selectedRows.length} transactions deleted successfully`);
        setSelectedRows([]);
        await refetch();
      } else {
        notifyError('Failed to delete transactions', {
          description: result.error,
        });
      }
    } catch {
      notifyError('Failed to delete transactions');
    } finally {
      setIsDeleting(null);
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    try {
      setIsDeleting(transactionToDelete);
      const result = await deleteTransaction(transactionToDelete);
      if (result.success) {
        notifySuccess('Transaction deleted successfully');
        await refetch();
      } else {
        notifyError('Failed to delete transaction', {
          description: result.error,
        });
      }
    } catch {
      notifyError('Failed to delete transaction');
    } finally {
      setIsDeleting(null);
      setTransactionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    const mappedTransaction = {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      account: '',
      fromAccountId: transaction.from_account_id || undefined,
      toAccountId: transaction.to_account_id || undefined,
      category: transaction.category,
      date: new Date(transaction.date),
      notes: transaction.notes || undefined,
    };
    setEditingTransaction(mappedTransaction);
    setShowForm(true);
  };

  const handleTransactionSuccess = () => {
    setShowForm(false);
    setEditingTransaction(null);
    refetch();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
    setDefaultTransactionType(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner message="Loading transactions..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <TransactionsHeader onAddTransaction={() => setShowForm(true)} />

      <TransactionFiltersComponent
        accounts={accounts}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      <TransactionsTable
        transactions={paginatedTransactions}
        allTransactions={allTransactions}
        filteredTransactions={filteredTransactions}
        sortedTransactionsLength={sortedTransactions.length}
        accounts={accounts}
        filters={filters}
        selectedRows={selectedRows}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        sortConfig={sortConfig}
        isDeleting={isDeleting}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onSort={handleSort}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteClick}
        onBulkDelete={handleBulkDeleteClick}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onAddTransaction={() => setShowForm(true)}
      />

      {showForm && (
        <TransactionForm
          open={showForm}
          onOpenChange={handleCloseForm}
          onSuccess={handleTransactionSuccess}
          transaction={editingTransaction ?? undefined}
          defaultType={defaultTransactionType}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        isLoading={isDeleting === transactionToDelete}
      />

      <DeleteConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Transactions"
        description={`Are you sure you want to delete ${selectedRows.length} selected transaction${selectedRows.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        isLoading={isDeleting === 'bulk'}
      />
    </div>
  );
}
