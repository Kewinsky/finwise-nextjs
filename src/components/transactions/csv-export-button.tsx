'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { exportTransactionsToCSV } from '@/lib/actions/finance-actions';
import { downloadCSV, generateCSVFilename } from '@/lib/utils/csv-export';
import type { TransactionFilters } from '@/types/finance.types';

interface CSVExportButtonProps {
  filters?: TransactionFilters;
  className?: string;
}

export function CSVExportButton({ filters = {}, className }: CSVExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Call the server action to get CSV content
      const result = await exportTransactionsToCSV(filters);

      if (result.success && 'data' in result && result.data) {
        // Generate filename based on filters
        const filename = generateCSVFilename(filters);

        // Download the CSV file
        downloadCSV(result.data, filename);
      } else {
        console.error('Export failed:', result.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Export error:', error);
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
}
