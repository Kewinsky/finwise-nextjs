'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { formatCurrency } from '@/lib/utils';
import { useBaseCurrency } from '@/hooks/use-base-currency';
import {
  getTypeBadgeClassName,
  getAmountClassName,
  getAccountName,
} from '@/lib/utils/transactions';
import type { Transaction, Account } from '@/types/finance.types';

interface TransactionsTableRowProps {
  transaction: Transaction;
  accounts: Account[];
  isSelected: boolean;
  isDeleting: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionsTableRow({
  transaction,
  accounts,
  isSelected,
  isDeleting,
  onSelect,
  onEdit,
  onDelete,
}: TransactionsTableRowProps) {
  const baseCurrency = useBaseCurrency();

  // Get currency from transaction's account
  const getTransactionCurrency = (): string => {
    const accountId = transaction.from_account_id || transaction.to_account_id;
    if (accountId) {
      const account = accounts.find((acc) => acc.id === accountId);
      if (account?.currency) {
        return account.currency;
      }
    }
    return baseCurrency;
  };

  const transactionCurrency = getTransactionCurrency();

  return (
    <TableRow key={transaction.id}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(transaction.id, checked === true)}
        />
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getTypeBadgeClassName(transaction.type)}>
          {transaction.type}
        </Badge>
      </TableCell>
      <TableCell className="font-medium">{transaction.description}</TableCell>
      <TableCell>{transaction.category}</TableCell>
      <TableCell>{getAccountName(transaction, accounts)}</TableCell>
      <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
      <TableCell className={`text-right font-medium ${getAmountClassName(transaction.type)}`}>
        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
        {formatCurrency(Math.abs(transaction.amount), transactionCurrency)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(transaction.id)}>
              {isDeleting ? (
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
  );
}
