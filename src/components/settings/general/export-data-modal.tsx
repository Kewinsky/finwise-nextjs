'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ExportDataModal({ isOpen, onClose, onConfirm }: ExportDataModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Your Data
          </DialogTitle>
          <DialogDescription>
            This will generate a JSON file containing all your personal data, including:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
              <li>Profile information (name, email, avatar)</li>
              <li>Account preferences (theme, language, fonts)</li>
              <li>Notification settings</li>
              <li>Subscription details</li>
              <li>Account creation and activity dates</li>
            </ul>
            <p>The file will be downloaded automatically once ready.</p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <LoadingSpinner message="Preparing Export..." inline />
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
