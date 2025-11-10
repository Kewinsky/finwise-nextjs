'use client';

import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function EmailSentPage() {
  return (
    <AuthCard>
      <div className="flex justify-center py-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
          <Mail className="size-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>If you don&apos;t see the email, check your spam folder.</p>
        <p>The link will expire in 1 hour.</p>
      </div>
      <Button asChild variant="outline" className="w-full transition-all hover:scale-[1.02]">
        <Link href="/login">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
      </Button>
    </AuthCard>
  );
}
