import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Account } from '@/types/finance.types';

interface BalanceHistoryFiltersProps {
  accounts: Account[];
  selectedYear: number;
  selectedAccounts: Set<string>;
  years: number[];
  onYearChange: (year: number) => void;
  onAccountsChange: (accounts: Set<string>) => void;
}

export function BalanceHistoryFilters({
  accounts,
  selectedYear,
  selectedAccounts,
  years,
  onYearChange,
  onAccountsChange,
}: BalanceHistoryFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Year:</span>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => onYearChange(parseInt(value))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Accounts:</span>
        <Select
          value={selectedAccounts.size === accounts.length ? 'all' : 'custom'}
          onValueChange={(value) => {
            if (value === 'all') {
              onAccountsChange(new Set(accounts.map((account) => account.id)));
            } else {
              const accountId = value;
              const newSelected = new Set(selectedAccounts);
              if (newSelected.has(accountId)) {
                newSelected.delete(accountId);
              } else {
                newSelected.add(accountId);
              }
              onAccountsChange(newSelected);
            }
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {selectedAccounts.size === accounts.length
                ? 'All Accounts'
                : `${selectedAccounts.size} Account${selectedAccounts.size > 1 ? 's' : ''}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((account) => {
              const isSelected = selectedAccounts.has(account.id);
              return (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full border ${
                        isSelected ? '' : 'bg-transparent border-foreground dark:border-white'
                      }`}
                      style={
                        isSelected ? { backgroundColor: account.color || '#3B82F6' } : undefined
                      }
                    />
                    {account.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
