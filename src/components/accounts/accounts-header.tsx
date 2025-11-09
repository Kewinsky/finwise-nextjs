import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AccountsHeaderProps {
  onAddAccount: () => void;
}

export function AccountsHeader({ onAddAccount }: AccountsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
          Accounts
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
          Manage your financial accounts and track balances
        </p>
      </div>
      <Button
        onClick={onAddAccount}
        className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-base"
        size="sm"
      >
        <Plus className="mr-1 sm:mr-2 h-4 w-4 shrink-0" />
        <span className="hidden min-[375px]:inline">Add Account</span>
        <span className="min-[375px]:hidden">Add</span>
      </Button>
    </div>
  );
}
