/**
 * Utility functions for JSON export functionality
 */

/**
 * Download JSON content as a file
 */
export function downloadJSON(jsonContent: string, filename: string) {
  try {
    // Create blob with JSON content
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

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
    console.error('Error downloading JSON:', error);
    throw new Error('Failed to download JSON file');
  }
}

/**
 * Generate filename for JSON export
 */
export function generateJSONFilename(filters?: {
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

  return `${filename}.json`;
}
