'use client';

import { AlertCircle, Clock, DollarSign, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

const problems = [
  {
    icon: Clock,
    title: 'Time-Consuming Manual Entry',
    description:
      'Spending hours each month manually entering transactions and categorizing expenses is tedious and error-prone.',
  },
  {
    icon: TrendingDown,
    title: 'Lack of Financial Insights',
    description:
      'Without proper analysis, you miss opportunities to save money and make better financial decisions.',
  },
  {
    icon: DollarSign,
    title: 'Difficulty Tracking Spending',
    description:
      'Multiple accounts and payment methods make it nearly impossible to see the full picture of your finances.',
  },
  {
    icon: AlertCircle,
    title: 'No Proactive Alerts',
    description:
      'Unexpected expenses and budget overruns catch you off guard, leading to financial stress.',
  },
];

export const ProblemSection = () => {
  return (
    <section
      className="py-24 bg-background relative overflow-hidden"
      aria-labelledby="problem-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.08),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 id="problem-heading" className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            The Financial{' '}
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Challenges You Face
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Managing personal finances shouldn&apos;t be complicated. Yet, many of us struggle with
            the same frustrating problems every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-red-500/30 dark:hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-red-600 dark:text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {problem.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
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
