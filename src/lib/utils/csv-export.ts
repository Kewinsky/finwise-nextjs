/**
 * Utility functions for CSV export functionality
 */

/**
 * Download CSV content as a file
 */
export function downloadCSV(csvContent: string, filename: string) {
  try {
    // Create blob with CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw new Error('Failed to download CSV file');
  }
}

/**
 * Generate filename for CSV export
 */
export function generateCSVFilename(filters?: {
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  type?: string;
}): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format

  let filename = `transactions_${timestamp}`;

  // Add filter indicators to filename
  if (filters?.dateFrom && filters?.dateTo) {
    const fromDate = new Date(filters.dateFrom).toISOString().split('T')[0];
    const toDate = new Date(filters.dateTo).toISOString().split('T')[0];
    filename += `_${fromDate}_to_${toDate}`;
  }

  if (filters?.type) {
    filename += `_${filters.type}`;
  }

  if (filters?.accountId) {
    filename += `_account_${filters.accountId.slice(0, 8)}`;
  }

  return `${filename}.csv`;
}

/**
 * Format CSV content with proper escaping
 */
export function formatCSVContent(data: Array<Record<string, string | number>>): string {
  if (data.length === 0) return '';

  // Get headers from first row
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const headerRow = headers.map((header) => `"${header}"`).join(',');

  // Create data rows
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '""';

        // Escape quotes and wrap in quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(','),
  );

  return [headerRow, ...dataRows].join('\n');
}
