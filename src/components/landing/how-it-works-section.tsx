'use client';

import { Link2, Brain, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

const steps = [
  {
    icon: Link2,
    title: 'Connect Your Accounts',
    description:
      'Securely link your bank accounts, credit cards, and investment accounts in minutes. Bank-level encryption keeps your data safe.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Brain,
    title: 'AI Analyzes Your Data',
    description:
      'Our AI automatically categorizes transactions, identifies spending patterns, and learns your financial habits to provide personalized insights.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Get Actionable Insights',
    description:
      'Receive real-time alerts, budget recommendations, and predictive analytics to help you make smarter financial decisions.',
    color: 'from-orange-500 to-red-500',
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-blue-600/30 dark:hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
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
