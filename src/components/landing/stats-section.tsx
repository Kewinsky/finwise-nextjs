'use client';

import { Users, Zap, Code, Star } from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  {
    icon: Users,
    value: '50K+',
    label: 'Active Users',
    description: 'Trust Finwise',
  },
  {
    icon: Zap,
    value: '$2M+',
    label: 'Tracked',
    description: 'In transactions',
  },
  {
    icon: Code,
    value: '99.9%',
    label: 'Uptime',
    description: 'Reliable service',
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Rating',
    description: 'User satisfaction',
  },
];

export const StatsSection = () => {
  return (
    <section
      className="py-24 bg-gradient-to-br from-background via-muted/5 to-background dark:from-background dark:via-muted/3 dark:to-background relative overflow-hidden"
      aria-labelledby="stats-heading"
    >
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle line pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(0,0,0,0.03)_50%,transparent_60%)] dark:bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.03)_50%,transparent_60%)]"></div>

        {/* Minimal floating elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-blue-500/6 dark:bg-blue-400/8 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-blue-400/5 dark:bg-blue-300/6 rounded-full blur-2xl"></div>

        {/* Subtle accent lines */}
        <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-blue-200/20 to-transparent dark:from-transparent dark:via-blue-700/20 dark:to-transparent"></div>
        <div className="absolute bottom-0 right-1/4 w-px h-32 bg-gradient-to-t from-transparent via-blue-200/20 to-transparent dark:from-transparent dark:via-blue-700/20 dark:to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 id="stats-heading" className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thousands of Users
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of users who have transformed their financial health with smart tracking
            and AI-powered insights
          </p>
        </motion.div>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.15, rotate: 12 }}
                  aria-hidden="true"
                >
                  <Icon className="w-8 h-8 text-white" aria-label={`${stat.label} icon`} />
                </motion.div>
                <dt className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto]">
                  <motion.span
                    animate={{
                      backgroundPosition: ['0% center', '200% center', '0% center'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="block"
                  >
                    {stat.value}
                  </motion.span>
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </dd>
              </motion.div>
            );
          })}
        </dl>
      </div>
    </section>
  );
};
