'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { AccountForm } from '@/components/accounts/account-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
}

// Mock data
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Checking Account',
    type: 'checking',
    balance: 5420.5,
    currency: 'USD',
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Savings Account',
    type: 'savings',
    balance: 10000.0,
    currency: 'USD',
    color: '#10B981',
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit',
    balance: -250.75,
    currency: 'USD',
    color: '#EF4444',
  },
  {
    id: '4',
    name: 'Investment Portfolio',
    type: 'investment',
    balance: 15000.0,
    currency: 'USD',
    color: '#8B5CF6',
  },
];

const accountTypes = {
  checking: { label: 'Checking', icon: CreditCard },
  savings: { label: 'Savings', icon: PiggyBank },
  credit: { label: 'Credit Card', icon: CreditCard },
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
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);

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

  const handleDeleteAccount = (account: Account) => {
    // In a real app, this would make an API call to delete the account
    console.log('Deleting account:', account.name);
    // For now, just log the action
  };

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockAccounts.map((account) => {
          const IconComponent =
            accountTypes[account.type as keyof typeof accountTypes]?.icon || Building;
          const typeLabel =
            accountTypes[account.type as keyof typeof accountTypes]?.label || 'Other';

          return (
            <Card key={account.id} className="overflow-hidden p-0">
              <CardHeader
                className="py-3 text-white relative"
                style={{ backgroundColor: account.color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{account.name}</h3>
                      <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                        {typeLabel}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteAccount(account)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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

      {/* Account Form */}
      {showForm && (
        <AccountForm
          open={showForm}
          onOpenChange={handleCloseForm}
          account={editingAccount || undefined}
          colors={ACCOUNT_COLORS}
        />
      )}
    </div>
  );
}
