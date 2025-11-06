import { TableCell, TableRow } from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';
import { NoDataState } from '@/components/common/no-data-state';

interface EmptyTransactionsStateProps {
  hasTransactions: boolean;
}

export function EmptyTransactionsState({ hasTransactions }: EmptyTransactionsStateProps) {
  const icon = hasTransactions ? Search : Plus;
  const title = hasTransactions ? 'No transactions found' : 'No transactions yet';
  const description = hasTransactions
    ? "Try adjusting your filters to find what you're looking for"
    : 'Get started by adding your first transaction';

  return (
    <TableRow>
      <TableCell colSpan={8} className="p-0">
        <NoDataState icon={icon} title={title} description={description} variant="inline" />
      </TableCell>
    </TableRow>
  );
}
