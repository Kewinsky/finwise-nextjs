import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';

interface TransactionsBulkActionsProps {
  selectedCount: number;
  isDeleting: boolean;
  onBulkDelete: () => void;
  children?: React.ReactNode;
}

export function TransactionsBulkActions({
  selectedCount,
  isDeleting,
  onBulkDelete,
  children,
}: TransactionsBulkActionsProps) {
  if (selectedCount === 0) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center gap-2">
      {children}
      <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={isDeleting}>
        {isDeleting ? (
          <LoadingSpinner size="sm" variant="default" message="" inline />
        ) : (
          <Trash2 className="mr-2 h-4 w-4" />
        )}
        Delete Selected ({selectedCount})
      </Button>
    </div>
  );
}
