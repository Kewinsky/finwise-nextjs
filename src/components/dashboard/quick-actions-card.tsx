'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown, ArrowRightLeft, Building, Zap } from 'lucide-react';

interface QuickActionsCardProps {
  onAddTransaction: (type: 'income' | 'expense' | 'transfer') => void;
}

export function QuickActionsCard({ onAddTransaction }: QuickActionsCardProps) {
  const router = useRouter();

  const actions = [
    {
      type: 'income' as const,
      label: 'Add Income',
      description: 'Record new income',
      icon: Plus,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      type: 'expense' as const,
      label: 'Add Expense',
      description: 'Track new expense',
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-500',
    },
    {
      type: 'transfer' as const,
      label: 'Transfer Funds',
      description: 'Move between accounts',
      icon: ArrowRightLeft,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      type: 'accounts' as const,
      label: 'Manage Accounts',
      description: 'Add or edit accounts',
      icon: Building,
      gradient: 'from-purple-500 to-indigo-500',
      onClick: () => router.push('/accounts'),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 @sm:gap-3 @lg:gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto min-h-[100px] @sm:min-h-[120px] py-3 @sm:py-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 group"
              onClick={() => {
                if (action.onClick) {
                  action.onClick();
                } else {
                  onAddTransaction(action.type);
                }
              }}
            >
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-center space-y-0.5">
                <p className="font-medium text-md leading-tight">{action.label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
