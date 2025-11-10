'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useBaseCurrency } from '@/hooks/use-base-currency';

interface TotalBalanceCardProps {
  totalBalance: number;
}

export function TotalBalanceCard({ totalBalance }: TotalBalanceCardProps) {
  const baseCurrency = useBaseCurrency();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Total Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Across all your accounts</p>
        <div className="text-2xl sm:text-3xl font-bold">
          {formatCurrency(totalBalance, baseCurrency)}
        </div>
      </CardContent>
    </Card>
  );
}
