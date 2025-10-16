'use client';

import { useEffect } from 'react';
import { MessageComponent } from '@/components/common/message-component';
import { log } from '@/lib/logger';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error({ error, digest: error.digest }, 'Auth error');
  }, [error]);

  return (
    <MessageComponent error={error} reset={reset} showRetryButton={true} showHomeButton={true} />
  );
}
