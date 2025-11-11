'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { DeleteAccountModal } from './delete-account-modal';

interface AccountActionsCardProps {
  onDeleteAccount?: () => Promise<void>;
  userEmail: string;
}

export function AccountActionsCard({ onDeleteAccount, userEmail }: AccountActionsCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (onDeleteAccount) {
      await onDeleteAccount();
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-start @md:justify-end @md:flex-shrink-0">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            className="w-full @md:w-auto"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        userEmail={userEmail}
      />
    </>
  );
}
