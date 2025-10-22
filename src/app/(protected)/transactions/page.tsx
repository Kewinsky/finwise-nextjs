'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, ArrowUpDown, MoreHorizontal, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionFiltersComponent } from '@/components/transactions/transaction-filters';
import { CSVExportButton } from '@/components/transactions/csv-export-button';
import { format } from 'date-fns';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { formatCurrency } from '@/lib/utils';
import {
  getTransactions,
  deleteManyTransactions,
  getAccounts,
  deleteTransaction,
} from '@/lib/actions/finance-actions';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import type {
  Transaction as TransactionType,
  Account,
  TransactionFilters,
} from '@/types/finance.types';

export default function TransactionsPage() {
  const [allTransactions, setAllTransactions] = useState<TransactionType[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
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
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load data on component mount - ONCE
  useEffect(() => {
    loadData(true);
  }, []);

  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      }

      // Load ALL transactions without filters - get everything
      const [transactionsResult, accountsResult] = await Promise.all([
        getTransactions(), // No filters - get all data
        getAccounts(),
      ]);

      if (transactionsResult.success && 'data' in transactionsResult) {
        setAllTransactions(transactionsResult.data.data);
      } else {
        notifyError('Failed to load transactions', {
          description: transactionsResult.error,
        });
      }

      if (accountsResult.success && 'data' in accountsResult) {
        setAccounts(accountsResult.data);
      } else {
        notifyError('Failed to load accounts', {
          description: accountsResult.error,
        });
      }
    } catch {
      notifyError('Failed to load data');
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  };

  // Client-side filtering - INSTANT results like pure React!
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          transaction.description.toLowerCase().includes(searchLower) ||
          (transaction.notes && transaction.notes.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      // Account filter
      if (filters.accountId) {
        const matchesAccount =
          transaction.from_account_id === filters.accountId ||
          transaction.to_account_id === filters.accountId;
        if (!matchesAccount) return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.date);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const transactionDate = new Date(transaction.date);
        const toDate = new Date(filters.dateTo);
        if (transactionDate > toDate) return false;
      }

      // Amount range filter
      if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) {
        return false;
      }

      if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }, [allTransactions, filters]);

  // Client-side sorting
  const sortedTransactions = useMemo(() => {
    if (!sortConfig) return filteredTransactions;

    return [...filteredTransactions].sort((a, b) => {
      let aValue: string | number | null, bValue: string | number | null;

      if (sortConfig.key === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortConfig.key === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortConfig.key === 'description') {
        aValue = a.description.toLowerCase();
        bValue = b.description.toLowerCase();
      } else {
        aValue = a[sortConfig.key as keyof TransactionType];
        bValue = b[sortConfig.key as keyof TransactionType];
      }

      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredTransactions, sortConfig]);

  // Client-side pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Filter handlers - NO server calls, just local state updates
  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const getTypeBadgeClassName = (type: string) => {
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
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedTransactions.map((t) => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting('bulk');
      const result = await deleteManyTransactions(selectedRows);

      if (result.success) {
        notifySuccess(`${selectedRows.length} transactions deleted successfully`);
        setSelectedRows([]);
        setAllTransactions((prev) => prev.filter((t) => !selectedRows.includes(t.id)));
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

  const handleSort = (key: string) => {
    if (key !== 'date' && key !== 'amount') return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEditTransaction = (transaction: TransactionType) => {
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

  const handleTransactionSuccess = (
    newTransaction?: TransactionType,
    updatedTransaction?: TransactionType,
  ) => {
    if (newTransaction) {
      setAllTransactions((prev) => [...prev, newTransaction]);
    } else if (updatedTransaction) {
      setAllTransactions((prev) =>
        prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)),
      );
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner message="Loading transactions..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track your income, expenses, and transfers</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Advanced Filters */}
      <TransactionFiltersComponent
        accounts={accounts}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <>
                  <CSVExportButton filters={filters} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isDeleting === 'bulk'}
                  >
                    {isDeleting === 'bulk' ? (
                      <LoadingSpinner size="sm" variant="default" message="" inline />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete Selected ({selectedRows.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedRows.length === paginatedTransactions.length &&
                        paginatedTransactions.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('date')}
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        {allTransactions.length === 0 ? (
                          <>
                            <div className="rounded-full bg-muted p-3">
                              <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">No transactions yet</p>
                              <p className="text-sm text-muted-foreground">
                                Get started by adding your first transaction
                              </p>
                            </div>
                            <Button onClick={() => setShowForm(true)} size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Transaction
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="rounded-full bg-muted p-3">
                              <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">No transactions found</p>
                              <p className="text-sm text-muted-foreground">
                                Try adjusting your filters to find what you&apos;re looking for
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(transaction.id)}
                          onCheckedChange={(checked: boolean) =>
                            handleSelectRow(transaction.id, checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getTypeBadgeClassName(transaction.type)}
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        {transaction.type === 'income'
                          ? accounts.find((acc) => acc.id === transaction.to_account_id)?.name ||
                            'Unknown'
                          : transaction.type === 'expense'
                            ? accounts.find((acc) => acc.id === transaction.from_account_id)
                                ?.name || 'Unknown'
                            : (() => {
                                const fromName =
                                  accounts.find((acc) => acc.id === transaction.from_account_id)
                                    ?.name || 'Unknown';
                                const toName =
                                  accounts.find((acc) => acc.id === transaction.to_account_id)
                                    ?.name || 'Unknown';
                                return `${fromName} → ${toName}`;
                              })()}
                      </TableCell>
                      <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : transaction.type === 'expense'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {transaction.type === 'income'
                          ? '+'
                          : transaction.type === 'expense'
                            ? '-'
                            : ''}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  setIsDeleting(transaction.id);
                                  const result = await deleteTransaction(transaction.id);
                                  if (result.success) {
                                    notifySuccess('Transaction deleted successfully');
                                    setAllTransactions((prev) =>
                                      prev.filter((t) => t.id !== transaction.id),
                                    );
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
                              }}
                            >
                              {isDeleting === transaction.id ? (
                                <LoadingSpinner size="sm" variant="default" message="" inline />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(startIndex + itemsPerPage, sortedTransactions.length)} of{' '}
                {sortedTransactions.length} results
              </p>
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Form */}
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
