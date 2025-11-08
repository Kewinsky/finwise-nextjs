'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText, ChevronDown, Lock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { exportTransactionsToCSV, exportTransactionsToJSON } from '@/lib/actions/finance-actions';
import { downloadCSV, generateCSVFilename } from '@/lib/utils/csv-export';
import { downloadJSON, generateJSONFilename } from '@/lib/utils/json-export';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { useSubscription } from '@/hooks/use-subscription';
import { PLAN_LIMITS } from '@/config/app';
import { useRouter } from 'next/navigation';
import type { TransactionFilters } from '@/types/finance.types';

interface TransactionsExportButtonProps {
  filters?: TransactionFilters;
  className?: string;
}

export function TransactionsExportButton({
  filters = {},
  className,
}: TransactionsExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { planType, isLoading: isLoadingPlan } = useSubscription();
  const router = useRouter();

  const currentPlan = planType || 'free';
  const planLimits = PLAN_LIMITS[currentPlan];
  const canExportCSV = planLimits.exportCSV;
  const canExportJSON = planLimits.exportJSON;
  const canExport = canExportCSV || canExportJSON;

  const handleUpgradeClick = () => {
    router.push('/settings/billing');
  };

  const handleExportCSV = async () => {
    setIsExporting(true);

    try {
      const result = await exportTransactionsToCSV(filters);

      if (result.success && 'data' in result && result.data) {
        const filename = generateCSVFilename(filters);
        downloadCSV(result.data, filename);
        notifySuccess('Transactions exported successfully', {
          description: 'CSV file downloaded',
        });
      } else {
        notifyError('Export failed', {
          description: result?.error || 'Failed to export transactions',
        });
      }
    } catch (error) {
      notifyError('Export error', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);

    try {
      const result = await exportTransactionsToJSON(filters);

      if (result.success && 'data' in result && result.data) {
        const filename = generateJSONFilename(filters);
        downloadJSON(result.data, filename);
        notifySuccess('Transactions exported successfully', {
          description: 'JSON file downloaded',
        });
      } else {
        notifyError('Export failed', {
          description: result?.error || 'Failed to export transactions',
        });
      }
    } catch (error) {
      notifyError('Export error', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Show upgrade message if user can't export
  if (!isLoadingPlan && !canExport) {
    return (
      <Button variant="outline" size="sm" onClick={handleUpgradeClick} className={className}>
        <Lock className="h-4 w-4 mr-2" />
        Upgrade to Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || isLoadingPlan}
          className={className}
        >
          {isExporting ? (
            <LoadingSpinner size="sm" message="Exporting..." inline className="mr-2" />
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        {canExportCSV ? (
          <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
            <FileText className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleUpgradeClick} disabled={isExporting}>
            <Lock className="h-4 w-4 mr-2" />
            CSV (Upgrade Required)
          </DropdownMenuItem>
        )}
        {canExportJSON ? (
          <DropdownMenuItem onClick={handleExportJSON} disabled={isExporting}>
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleUpgradeClick} disabled={isExporting}>
            <Lock className="h-4 w-4 mr-2" />
            JSON (Upgrade Required)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
