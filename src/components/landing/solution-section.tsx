'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const solutions = [
  {
    title: 'AI-Powered Automation',
    description:
      'Our intelligent system automatically categorizes transactions, identifies patterns, and provides actionable insights.',
    icon: Sparkles,
  },
  {
    title: 'Real-Time Sync',
    description:
      'Connect all your accounts in one place. See your complete financial picture updated in real-time.',
    icon: CheckCircle2,
  },
  {
    title: 'Smart Budgeting',
    description:
      'Set budgets that adapt to your spending patterns. Get alerts before you overspend, not after.',
    icon: CheckCircle2,
  },
  {
    title: 'Predictive Analytics',
    description:
      'AI analyzes your financial behavior to predict future expenses and help you plan ahead.',
    icon: Sparkles,
  },
];

export const SolutionSection = () => {
  return (
    <section
      className="py-24 bg-gradient-to-br from-background via-muted/20 to-blue-50/30 dark:from-background dark:via-muted/10 dark:to-blue-950/5 relative overflow-hidden"
      aria-labelledby="solution-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 id="solution-heading" className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            The{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Finwise Solution
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We&apos;ve built an intelligent financial platform that solves these problems with
            cutting-edge AI and beautiful design.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
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
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {solution.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {solution.description}
                      </p>
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
