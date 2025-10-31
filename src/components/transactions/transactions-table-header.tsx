import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown } from 'lucide-react';

interface TransactionsTableHeaderProps {
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSort: (key: string) => void;
}

export function TransactionsTableHeader({
  allSelected,
  onSelectAll,
  onSort,
}: TransactionsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(checked === true)}
          />
        </TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Account</TableHead>
        <TableHead>
          <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => onSort('date')}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="text-right">
          <Button
            variant="ghost"
            className="h-auto p-0 font-medium"
            onClick={() => onSort('amount')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="w-12"></TableHead>
      </TableRow>
    </TableHeader>
  );
}
