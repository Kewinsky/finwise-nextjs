'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { appConfig } from '@/config/app';

interface ContactUsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactUsModal({ open, onOpenChange }: ContactUsModalProps) {
  const email = appConfig.contact.email || appConfig.contact.generalEmail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl">Contact Us</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-4">
            For all support inquiries, including billing issues, receipts, and general assistance,
            please email{' '}
            <a
              href={`mailto:${email}`}
              className="font-semibold text-blue-600 dark:text-purple-400 hover:underline transition-colors"
            >
              {email}
            </a>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
