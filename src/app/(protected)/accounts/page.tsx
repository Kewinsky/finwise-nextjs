'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  CreditCard,
  Building,
  PiggyBank,
  TrendingUp,
  Wallet,
  Trash2,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { AccountForm } from '@/components/accounts/account-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { getAccounts, deleteAccount } from '@/lib/actions/finance-actions';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import type { Account } from '@/types/finance.types';

const accountTypes = {
  checking: { label: 'Checking', icon: CreditCard },
  savings: { label: 'Savings', icon: PiggyBank },
  creditcard: { label: 'Credit Card', icon: CreditCard },
  investment: { label: 'Investment', icon: TrendingUp },
};

const ACCOUNT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const result = await getAccounts();

      if (result.success && 'data' in result) {
        setAccounts(result.data as Account[]);
      } else {
        notifyError('Failed to load accounts', {
          description: result.error,
        });
      }
    } catch {
      notifyError('Failed to load accounts');
    }
  };

  const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleAccountSuccess = (newAccount?: Account, updatedAccount?: Account) => {
    if (newAccount) {
      setAccounts((prev) => (prev ? [...prev, newAccount] : [newAccount]));
    } else if (updatedAccount) {
      setAccounts((prev) =>
        prev ? prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc)) : null,
      );
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    if (account.is_mandatory) {
      notifyError('This account cannot be deleted', { description: 'Mandatory account' });
      return;
    }
    try {
      setIsDeleting(account.id);
      const previous = accounts;
      setAccounts((prev) => prev?.filter((a) => a.id !== account.id) || null);
      const result = await deleteAccount(account.id);

      if (result.success) {
        notifySuccess('Account deleted successfully');
      } else {
        notifyError('Failed to delete account', {
          description: result.error,
        });
        setAccounts(previous);
      }
    } catch {
      notifyError('Failed to delete account');
      await loadAccounts();
    } finally {
      setIsDeleting(null);
    }
  };

  if (!accounts) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner message="Loading accounts..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts and track balances</p>
        </div>
        <Button onClick={handleAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Total Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mt-1">Across all your accounts</p>
          <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
        </CardContent>
      </Card>

      {/* Account List */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first account to track your finances.
            </p>
            <Button onClick={handleAddAccount}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const IconComponent =
              accountTypes[account.type as keyof typeof accountTypes]?.icon || Building;
            const typeLabel =
              accountTypes[account.type as keyof typeof accountTypes]?.label || 'Other';

            return (
              <Card key={account.id} className="overflow-hidden p-0">
                <CardHeader
                  className="py-3 text-white relative"
                  style={{ backgroundColor: account.color || '#3B82F6' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/20">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {account.name}
                          {account.is_mandatory && (
                            <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-white/20 text-white border border-white/30">
                              Mandatory
                            </span>
                          )}
                        </h3>
                        <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                          {typeLabel}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteAccount(account)}
                          disabled={isDeleting === account.id || account.is_mandatory}
                        >
                          {isDeleting === account.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          {account.is_mandatory ? 'Delete (disabled)' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Current Balance</p>
                      <p
                        className={`text-2xl font-bold ${
                          account.balance >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {account.currency === 'USD' ? '$' : account.currency}{' '}
                        {Math.abs(account.balance || 0).toFixed(2)}
                        {account.balance < 0 && (
                          <span className="text-red-500 dark:text-red-400 ml-1">(Overdrawn)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Account Form */}
      {showForm && (
        <AccountForm
          open={showForm}
          onOpenChange={handleCloseForm}
          account={editingAccount || undefined}
          colors={ACCOUNT_COLORS}
          onSuccess={handleAccountSuccess}
        />
      )}
    </div>
  );
}
