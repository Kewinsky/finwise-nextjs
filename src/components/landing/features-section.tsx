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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated floating orbs */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-500/8 to-purple-500/8 dark:from-blue-400/12 dark:to-purple-400/12 rounded-full blur-2xl"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-500/6 to-blue-500/6 dark:from-purple-400/10 dark:to-blue-400/10 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-blue-400/5 to-purple-400/5 dark:from-blue-300/8 dark:to-purple-300/8 rounded-full blur-lg"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(147,51,234,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(147,51,234,0.12),transparent_50%)]" />
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
                <Card className="bg-muted/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-border/50 hover:border-blue-600/30 dark:hover:border-purple-500/30 shadow-lg group h-full relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <CardHeader className="pb-4 relative z-10">
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      aria-hidden="true"
                    >
                      <Icon className="h-7 w-7 text-white" aria-label={`${feature.title} icon`} />
                    </motion.div>
                    <CardTitle className="text-xl font-semibold group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
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
