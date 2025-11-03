import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { TransactionsTableHeader } from './transactions-table-header';
import { TransactionsTableRow } from './transactions-table-row';
import { EmptyTransactionsState } from './empty-transactions-state';
import { TransactionsPagination } from './transactions-pagination';
import { TransactionsBulkActions } from './transactions-bulk-actions';
import { TransactionsExportButton } from './transactions-export-button';
import type { Transaction, Account, TransactionFilters } from '@/types/finance.types';

interface TransactionsTableProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  filteredTransactions: Transaction[];
  sortedTransactionsLength: number;
  accounts: Account[];
  filters: TransactionFilters;
  selectedRows: string[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  isDeleting: string | null;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onSort: (key: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onAddTransaction: () => void;
}

export function TransactionsTable({
  transactions,
  allTransactions,
  filteredTransactions,
  sortedTransactionsLength,
  accounts,
  filters,
  selectedRows,
  currentPage,
  itemsPerPage,
  totalPages,
  isDeleting,
  onSelectAll,
  onSelectRow,
  onSort,
  onEdit,
  onDelete,
  onBulkDelete,
  onPageChange,
  onItemsPerPageChange,
  onAddTransaction,
}: TransactionsTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const allSelected = selectedRows.length === transactions.length && transactions.length > 0;

  return (
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
          <TransactionsBulkActions
            selectedCount={selectedRows.length}
            isDeleting={isDeleting === 'bulk'}
            onBulkDelete={onBulkDelete}
          >
            <TransactionsExportButton filters={filters} />
          </TransactionsBulkActions>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TransactionsTableHeader
              allSelected={allSelected}
              onSelectAll={onSelectAll}
              onSort={onSort}
            />
            <TableBody>
              {transactions.length === 0 ? (
                <EmptyTransactionsState
                  hasTransactions={allTransactions.length > 0}
                  onAddTransaction={onAddTransaction}
                />
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
          startIndex={startIndex}
          totalItems={sortedTransactionsLength}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </CardContent>
    </Card>
  );
}
