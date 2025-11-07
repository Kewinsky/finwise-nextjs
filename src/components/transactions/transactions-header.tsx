import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TransactionsHeaderProps {
  onAddTransaction: () => void;
}

export function TransactionsHeader({ onAddTransaction }: TransactionsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
      <div>
        <h1 className="text-2xl @sm:text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Track your income, expenses, and transfers</p>
      </div>
      <Button onClick={onAddTransaction} className="w-full @sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>
    </div>
  );
}
