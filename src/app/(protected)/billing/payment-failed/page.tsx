'use client';

import { MessageComponent } from '@/components/common/message-component';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreditCard, Mail } from 'lucide-react';

export default function PaymentFailedPage() {
  return (
    <MessageComponent
      type="payment-failed"
      description="There was an issue processing your payment. This could be due to insufficient funds, an incorrect card number, or your bank declining the transaction."
      additionalActions={
        <>
          <Button asChild className="w-full">
            <Link href="/pricing">
              <CreditCard className="w-4 h-4 mr-2" />
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/settings/contact-us">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </Button>
        </>
      }
    />
  );
}
