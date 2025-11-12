'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { appConfig, type PlanType } from '@/config/app';

export function PricingPlans() {
  const router = useRouter();

  const handlePlanAction = (planType: PlanType) => {
    if (planType === 'free') {
      router.push('/dashboard');
    } else {
      // Basic or Pro plan
      router.push('/settings/billing');
    }
  };

  const getButtonText = (planType: PlanType) => {
    switch (planType) {
      case 'free':
        return 'Get Started';
      case 'basic':
        return 'Start Free Trial';
      case 'pro':
        return 'Get Pro';
      default:
        return 'Get Started';
    }
  };

  // Convert plans to pricing format using appConfig
  const pricingPlans = Object.entries(appConfig.subscription.plans).map(([key, plan]) => ({
    name: plan.name,
    price: plan.price === 0 ? 'Free' : `${appConfig.settings.currencySymbol}${plan.price}`,
    period: plan.price === 0 ? '' : '/month',
    description: plan.description || 'Perfect for getting started',
    features: plan.features,
    planType: key as PlanType,
    recommended: key === 'basic', // Set basic as recommended instead of pro
  }));

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.recommended
                  ? 'border-2 border-blue-600 dark:border-purple-500 shadow-lg scale-105 ring-2 ring-blue-600/20 dark:ring-purple-500/20'
                  : 'border-border'
              }`}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  Recommended
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  className={`w-full ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : ''
                  }`}
                  variant={plan.recommended ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handlePlanAction(plan.planType)}
                >
                  {getButtonText(plan.planType)}
                </Button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    What&apos;s included
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
