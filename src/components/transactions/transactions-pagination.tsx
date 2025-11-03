import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TransactionsPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function TransactionsPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: TransactionsPaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-0 px-2 py-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 lg:gap-8">
        <div className="flex items-center justify-between sm:justify-start space-x-2">
          <p className="text-xs sm:text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              onItemsPerPageChange(Number(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between sm:justify-start space-x-2">
          <p className="text-xs sm:text-sm font-medium whitespace-nowrap">
            Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </p>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-xs sm:text-sm"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
