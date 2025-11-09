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
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="w-full sm:w-auto [&_button]:w-full [&_button]:sm:w-auto">{children}</div>
      {selectedCount > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={isDeleting}
          className="w-full sm:w-auto"
        >
          {isDeleting ? (
            <LoadingSpinner size="sm" variant="default" message="" inline />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete Selected ({selectedCount})
        </Button>
      )}
    </div>
  );
}
