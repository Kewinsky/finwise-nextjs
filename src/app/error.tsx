'use client';

import { MessageComponent } from '@/components/common/message-component';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <MessageComponent error={error} reset={reset} />;
}
