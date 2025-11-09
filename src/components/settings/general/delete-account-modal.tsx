'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { notifyError } from '@/lib/notifications';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
  isLoading?: boolean;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  isLoading = false,
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmationValid = confirmationText === 'DELETE';
  const isDisabled = !isConfirmationValid || isDeleting || isLoading;

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;

    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
      setConfirmationText('');
    } catch (error) {
      notifyError('Failed to delete account. Please try again.');
      console.error('Account deletion error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
      setConfirmationText('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            Delete Account
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  What happens when you delete your account:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Your account will be marked for deletion</li>
                  <li>• You will be signed out immediately</li>
                  <li>• All your data will be permanently deleted after 30 days</li>
                  <li>• This action cannot be reversed</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              To confirm, type <span className="font-mono bg-muted px-1 rounded">DELETE</span>{' '}
              below:
            </Label>
            <Input
              id="confirmation"
              type="text"
              placeholder="Type DELETE to confirm"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={isDeleting || isLoading}
              className="font-mono"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Email:</strong> {userEmail}
            </p>
            <p className="mt-1">
              This action is governed by our privacy policy and GDPR compliance. Your data will be
              securely deleted within 30 days.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDisabled}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <LoadingSpinner message="Deleting Account..." inline />
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
