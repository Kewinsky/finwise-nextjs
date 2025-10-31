'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getTransactions, getAccounts } from '@/lib/actions/finance-actions';
import { notifyError } from '@/lib/notifications';
import type { Transaction, Account, TransactionFilters } from '@/types/finance.types';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface UseTransactionsResult {
  allTransactions: Transaction[];
  accounts: Account[];
  isLoading: boolean;
  filters: TransactionFilters;
  selectedRows: string[];
  currentPage: number;
  itemsPerPage: number;
  sortConfig: SortConfig | null;
  filteredTransactions: Transaction[];
  sortedTransactions: Transaction[];
  paginatedTransactions: Transaction[];
  totalPages: number;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  setSelectedRows: (rows: string[]) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setSortConfig: (config: SortConfig | null) => void;
  handleSelectAll: (checked: boolean) => void;
  handleSelectRow: (id: string, checked: boolean) => void;
  refetch: () => Promise<void>;
}

export function useTransactions(): UseTransactionsResult {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [transactionsResult, accountsResult] = await Promise.all([
        getTransactions(),
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          transaction.description.toLowerCase().includes(searchLower) ||
          (transaction.notes && transaction.notes.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (filters.type && transaction.type !== filters.type) {
        return false;
      }

      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      if (filters.accountId) {
        const matchesAccount =
          transaction.from_account_id === filters.accountId ||
          transaction.to_account_id === filters.accountId;
        if (!matchesAccount) return false;
      }

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

      if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) {
        return false;
      }

      if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }, [allTransactions, filters]);

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
        aValue = a[sortConfig.key as keyof Transaction];
        bValue = b[sortConfig.key as keyof Transaction];
      }

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

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(paginatedTransactions.map((t) => t.id));
      } else {
        setSelectedRows([]);
      }
    },
    [paginatedTransactions],
  );

  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedRows((prev) => {
      if (checked) {
        return [...prev, id];
      }
      return prev.filter((rowId) => rowId !== id);
    });
  }, []);

  const handleFiltersChange = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return {
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
    setFilters: handleFiltersChange,
    clearFilters,
    setSelectedRows,
    setCurrentPage,
    setItemsPerPage,
    setSortConfig,
    handleSelectAll,
    handleSelectRow,
    refetch: loadData,
  };
}
