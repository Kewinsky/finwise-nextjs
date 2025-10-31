import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';

interface EmptyTransactionsStateProps {
  hasTransactions: boolean;
  onAddTransaction: () => void;
}

export function EmptyTransactionsState({
  hasTransactions,
  onAddTransaction,
}: EmptyTransactionsStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={8} className="h-64 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          {!hasTransactions ? (
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
              <Button onClick={onAddTransaction} size="sm">
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
  );
}
