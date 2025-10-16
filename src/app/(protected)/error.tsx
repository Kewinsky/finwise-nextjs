'use client';

import { useEffect } from 'react';
import { MessageComponent } from '@/components/common/message-component';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { log } from '@/lib/logger';

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error({ error, digest: error.digest }, 'Protected route error');
  }, [error]);

  return (
    <MessageComponent
      error={error}
      reset={reset}
      additionalActions={
        <Button variant="outline" asChild className="w-full">
          <Link href="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
        </Button>
      }
      showRetryButton={true}
      showBackButton={true}
    />
  );
}
