import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { PricingHeader } from '@/components/pricing/pricing-header';
import { PricingPlans } from '@/components/pricing/pricing-plans';
import { PricingFAQ } from '@/components/pricing/pricing-faq';
import { PricingCTA } from '@/components/pricing/pricing-cta';
import { appConfig } from '@/config/app';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing',
  description: `Choose the perfect plan for your needs. ${appConfig.app.name} offers flexible pricing options to scale with your business.`,
};

/**
 * Main pricing page component
 * Uses Suspense for better perceived performance
 */
export default function PricingPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PricingContent />
    </Suspense>
  );
}

async function PricingContent() {
  return (
    <div className="min-h-screen bg-background">
      <PricingHeader />
      <PricingPlans />
      <PricingFAQ />
      <PricingCTA />
    </div>
  );
}
