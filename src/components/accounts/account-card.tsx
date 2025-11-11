import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreVertical, LucideIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { formatCurrency } from '@/lib/utils';
import { useBaseCurrency } from '@/hooks/use-base-currency';
import type { Account } from '@/types/finance.types';

interface AccountCardProps {
  account: Account;
  icon: LucideIcon;
  typeLabel: string;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  isDeleting: boolean;
}

export function AccountCard({
  account,
  icon: IconComponent,
  typeLabel,
  onEdit,
  onDelete,
  isDeleting,
}: AccountCardProps) {
  const baseCurrency = useBaseCurrency();

  return (
    <Card key={account.id} className="overflow-hidden p-0">
      <CardHeader
        className="py-3 text-white relative"
        style={{ backgroundColor: account.color || '#3B82F6' }}
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-white/20 flex-shrink-0">
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 min-w-0">
                <span className="truncate">{account.name}</span>
              </h3>
              {account.is_mandatory && (
                <Badge
                  variant="destructive"
                  className="bg-white/20 text-white border-white/30 flex-shrink-0 mr-1"
                >
                  Mandatory
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 mt-1">
                {typeLabel}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20 flex-shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(account)}
                disabled={isDeleting || account.is_mandatory}
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" inline className="mr-2" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {account.is_mandatory ? 'Delete (disabled)' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="py-4 sm:py-6">
        <div className="space-y-3 @md:space-y-4">
          <div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Current Balance</p>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                account.balance >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(Math.abs(account.balance || 0), baseCurrency)}
              {account.balance < 0 && (
                <span className="text-red-500 dark:text-red-400 ml-1">(Overdrawn)</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
