'use client';

import { Zap, Shield, Users, Code, Smartphone, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';

const features = [
  {
    icon: Zap,
    title: 'Smart AI Insights',
    description:
      'Get personalized financial insights powered by AI. Understand your spending patterns and discover opportunities to save.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description:
      'Your financial data is protected with enterprise-grade security. End-to-end encryption and secure cloud storage.',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Share financial insights with family or business partners. Collaborate on budgets and financial goals together.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    icon: Code,
    title: 'Automated Tracking',
    description:
      'Connect your bank accounts and credit cards for automatic transaction import. No more manual data entry.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description:
      'Track expenses on the go with our mobile-first design. Add transactions instantly, anywhere, anytime.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20',
  },
  {
    icon: Palette,
    title: 'Beautiful Analytics',
    description:
      'Visualize your financial health with intuitive charts and reports. Make data-driven decisions with confidence.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
];

export const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-br from-background via-muted/10 to-blue-50/20 dark:from-background dark:via-muted/5 dark:to-blue-950/10"
      aria-labelledby="features-heading"
    >
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-blue-500/10 dark:bg-blue-400/15 rounded-lg rotate-12 blur-sm"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-blue-400/8 dark:bg-blue-300/12 rounded-full blur-sm"></div>
        <div className="absolute top-1/2 left-10 w-8 h-8 bg-blue-300/6 dark:bg-blue-200/10 rounded-md blur-sm"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 id="features-heading" className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Master Your Finances
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Powerful tools and AI insights to help you track expenses, analyze income, and make
            smarter financial decisions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-muted/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg group h-full">
                  <CardHeader className="pb-4">
                    <motion.div
                      className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      aria-hidden="true"
                    >
                      <Icon
                        className={`h-6 w-6 ${feature.color}`}
                        aria-label={`${feature.title} icon`}
                      />
                    </motion.div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
