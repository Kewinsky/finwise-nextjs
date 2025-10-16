'use client';

import { MessageComponent } from '@/components/common/message-component';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EmailSentPage() {
  return (
    <MessageComponent
      type="email-sent"
      title="Check Your Email"
      description="We've sent you an email with a link. Please check your inbox and click the link to continue."
      additionalActions={
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </Button>
      }
    />
  );
}
