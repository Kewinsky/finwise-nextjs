'use client';

import { useState } from 'react';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionFiltersComponent } from '@/components/transactions/transaction-filters';
import { TransactionsHeader } from '@/components/transactions/transactions-header';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { deleteManyTransactions, deleteTransaction } from '@/lib/actions/finance-actions';
import { useTransactions } from '@/hooks/use-transactions';
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

  const [showForm, setShowForm] = useState(false);
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

  const handleSort = (key: string) => {
    if (key !== 'date' && key !== 'amount') return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const result = await deleteTransaction(id);
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
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
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
        />
      )}
    </div>
  );
}
