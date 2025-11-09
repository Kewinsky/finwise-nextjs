import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AccountsHeaderProps {
  onAddAccount: () => void;
}

export function AccountsHeader({ onAddAccount }: AccountsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
      <div>
        <h1 className="text-2xl @sm:text-3xl font-bold tracking-tight">Accounts</h1>
        <p className="text-muted-foreground">Manage your financial accounts and track balances</p>
      </div>
      <Button
        onClick={onAddAccount}
        className="w-full @sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Account
      </Button>
    </div>
  );
}
