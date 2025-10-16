'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import { ExportDataModal } from './export-data-modal';

interface ExportDataCardProps {
  onExportData?: () => Promise<void>;
}

export function ExportDataCard({ onExportData }: ExportDataCardProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleConfirmExport = async () => {
    if (onExportData) {
      await onExportData();
    }
  };

  return (
    <>
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <FileText className="h-5 w-5" />
            Export My Data
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Download a copy of all your personal data in JSON format. This includes your profile,
            preferences, subscription information, and notification settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-start md:justify-end md:flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportClick}
            className="w-full sm:w-auto border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleConfirmExport}
      />
    </>
  );
}
