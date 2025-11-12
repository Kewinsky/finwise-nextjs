'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { appConfig, type PlanType } from '@/config/app';

export default function PricingPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-blue-50/30 dark:from-background dark:via-muted/10 dark:to-blue-950/5 relative overflow-hidden">
      {/* Single background for entire page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Simple, Transparent{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Choose the perfect plan for your financial tracking needs. Start free and upgrade as
                you grow.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Plans Section */}
        <section className="py-12 pb-24 px-4">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    className={`relative h-full ${
                      plan.recommended
                        ? 'border-2 border-blue-600 dark:border-purple-500 shadow-xl scale-105 ring-2 ring-blue-600/20 dark:ring-purple-500/20'
                        : 'border-border'
                    }`}
                  >
                    {plan.recommended && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full">
                      <ul className="space-y-4 flex-1">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full mt-6 ${
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
