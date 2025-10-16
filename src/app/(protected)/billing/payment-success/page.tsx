'use client';

import { MessageComponent } from '@/components/common/message-component';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <MessageComponent
      type="payment-success"
      description="Your subscription has been activated successfully. You now have access to all premium features."
      additionalActions={
        <>
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/settings/billing">
              <Settings className="w-4 h-4 mr-2" />
              View Billing
            </Link>
          </Button>
        </>
      }
    />
  );
}
