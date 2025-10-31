import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';

interface EmptyAccountsStateProps {
  onAddAccount: () => void;
}

export function EmptyAccountsState({ onAddAccount }: EmptyAccountsStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Building className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
        <p className="text-muted-foreground text-center mb-4">
          Get started by adding your first account to track your finances.
        </p>
        <Button onClick={onAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Account
        </Button>
      </CardContent>
    </Card>
  );
}
