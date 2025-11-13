'use client';

import { Link2, Brain, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

const steps = [
  {
    icon: Link2,
    title: 'Connect Your Accounts',
    description:
      'Securely link your bank accounts, credit cards, and investment accounts in minutes. Bank-level encryption keeps your data safe.',
  },
  {
    icon: Brain,
    title: 'AI Analyzes Your Data',
    description:
      'Our AI automatically categorizes transactions, identifies spending patterns, and learns your financial habits to provide personalized insights.',
  },
  {
    icon: BarChart3,
    title: 'Get Actionable Insights',
    description:
      'Receive real-time alerts, budget recommendations, and predictive analytics to help you make smarter financial decisions.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-background relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            id="how-it-works-heading"
            className="text-4xl sm:text-5xl font-bold text-foreground mb-6"
          >
            How It{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Getting started with Finwise is simple. Follow these three easy steps to take control of
            your finances.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="rounded-2xl p-4 md:p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-blue-600 dark:text-purple-400 mb-2">
                        Step {index + 1}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
