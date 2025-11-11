import { AccountCard } from './account-card';
import { ACCOUNT_TYPES } from '@/lib/constants/accounts';
import type { Account } from '@/types/finance.types';

interface AccountsGridProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  isDeleting: string | null;
}

export function AccountsGrid({ accounts, onEdit, onDelete, isDeleting }: AccountsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 @md:gap-6 @2xl:grid-cols-2 @3xl:grid-cols-3">
      {accounts.map((account) => {
        const accountTypeConfig =
          ACCOUNT_TYPES[account.type as keyof typeof ACCOUNT_TYPES] || ACCOUNT_TYPES.other;
        const IconComponent = accountTypeConfig.icon;
        const typeLabel = accountTypeConfig.label;

        return (
          <AccountCard
            key={account.id}
            account={account}
            icon={IconComponent}
            typeLabel={typeLabel}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting === account.id}
          />
        );
      })}
    </div>
  );
}
