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
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
      borderGradient: 'border-green-200/50 dark:border-green-800/30',
      hoverGradient:
        'hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40',
    },
    {
      type: 'expense' as const,
      label: 'Add Expense',
      description: 'Track new expense',
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
      borderGradient: 'border-red-200/50 dark:border-red-800/30',
      hoverGradient:
        'hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/40 dark:hover:to-rose-900/40',
    },
    {
      type: 'transfer' as const,
      label: 'Transfer Funds',
      description: 'Move between accounts',
      icon: ArrowRightLeft,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
      borderGradient: 'border-blue-200/50 dark:border-blue-800/30',
      hoverGradient:
        'hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/40 dark:hover:to-cyan-900/40',
    },
    {
      type: 'accounts' as const,
      label: 'Manage Accounts',
      description: 'Add or edit accounts',
      icon: Building,
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30',
      borderGradient: 'border-purple-200/50 dark:border-purple-800/30',
      hoverGradient:
        'hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/40 dark:hover:to-indigo-900/40',
      onClick: () => router.push('/accounts'),
    },
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 @md:gap-4 @lg:gap-5 h-full">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              data-testid={
                action.type === 'accounts'
                  ? 'quick-action-manage-accounts'
                  : `quick-action-${action.type}`
              }
              className={`relative h-full py-4 @sm:py-5 flex flex-col items-center justify-center gap-3 transition-transform duration-200 group overflow-hidden border-2 ${action.borderGradient} bg-gradient-to-br ${action.bgGradient} ${action.hoverGradient} shadow-sm hover:shadow-lg hover:scale-[1.02]`}
              onClick={() => {
                if (action.onClick) {
                  action.onClick();
                } else {
                  onAddTransaction(action.type);
                }
              }}
            >
              {/* Animated background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Icon with enhanced styling */}
              <div
                className={`relative p-3 rounded-xl bg-gradient-to-r ${action.gradient} shadow-md group-hover:shadow-lg transition-all duration-300`}
              >
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
              </div>

              {/* Text content */}
              <div className="text-center space-y-1 relative z-10">
                <p className="font-semibold text-sm sm:text-base leading-tight text-foreground group-hover:text-foreground transition-colors">
                  {action.label}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight group-hover:text-foreground/70 transition-colors">
                  {action.description}
                </p>
              </div>

              {/* Decorative corner accent */}
              <div
                className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-300`}
              />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
