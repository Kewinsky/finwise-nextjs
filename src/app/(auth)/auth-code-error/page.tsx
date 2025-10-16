'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageComponent } from '@/components/common/message-component';
import { RefreshCw, Home } from 'lucide-react';

export default function AuthCodeError() {
  return (
    <MessageComponent
      type="auth-error"
      additionalActions={
        <>
          <Button asChild className="w-full">
            <Link href="/login">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
        </>
      }
    >
      <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-sm mx-auto">
        <li>• The authentication link has expired</li>
        <li>• The link has already been used</li>
        <li>• There was a network error</li>
      </ul>
    </MessageComponent>
  );
}
