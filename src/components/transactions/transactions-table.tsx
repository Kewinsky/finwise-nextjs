import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { TransactionsTableHeader } from './transactions-table-header';
import { TransactionsTableRow } from './transactions-table-row';
import { EmptyTransactionsState } from './empty-transactions-state';
import { TransactionsPagination } from './transactions-pagination';
import { TransactionsBulkActions } from './transactions-bulk-actions';
import { TransactionsExportButton } from './transactions-export-button';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import type { Transaction, Account, TransactionFilters } from '@/types/finance.types';

interface TransactionsTableProps {
  transactions: Transaction[];
  totalTransactions: number;
  accounts: Account[];
  filters: TransactionFilters;
  selectedRows: string[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  isDeleting: string | null;
  isLoading?: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onSort: (key: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onAddTransaction?: () => void;
}

export function TransactionsTable({
  transactions,
  totalTransactions,
  accounts,
  filters,
  selectedRows,
  currentPage,
  itemsPerPage,
  totalPages,
  isDeleting,
  isLoading = false,
  onSelectAll,
  onSelectRow,
  onSort,
  onEdit,
  onDelete,
  onBulkDelete,
  onPageChange,
  onItemsPerPageChange,
}: TransactionsTableProps) {
  const allSelected = selectedRows.length === transactions.length && transactions.length > 0;
  const hasAnyTransactions = totalTransactions > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl">Transactions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''} found
                </>
              )}
            </CardDescription>
          </div>
          <div className="shrink-0">
            <TransactionsBulkActions
              selectedCount={selectedRows.length}
              isDeleting={isDeleting === 'bulk'}
              onBulkDelete={onBulkDelete}
            >
              <TransactionsExportButton filters={filters} />
            </TransactionsBulkActions>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && transactions.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <LoadingSpinner message="Loading transactions..." />
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TransactionsTableHeader
                  allSelected={allSelected}
                  onSelectAll={onSelectAll}
                  onSort={onSort}
                />
                <TableBody>
                  {transactions.length === 0 ? (
                    <EmptyTransactionsState hasTransactions={hasAnyTransactions} />
                  ) : (
                    transactions.map((transaction) => (
                      <TransactionsTableRow
                        key={transaction.id}
                        transaction={transaction}
                        accounts={accounts}
                        isSelected={selectedRows.includes(transaction.id)}
                        isDeleting={isDeleting === transaction.id}
                        onSelect={onSelectRow}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <TransactionsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
