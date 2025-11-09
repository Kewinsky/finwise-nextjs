'use client';

import { ArrowRight, Rocket, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export const CTASection = () => {
  return (
    <section
      className="py-24 bg-gradient-to-br from-background via-muted/20 to-blue-50/30 dark:from-background dark:via-muted/10 dark:to-blue-950/5 relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_40%,rgba(0,0,0,0.02)_50%,transparent_60%)] dark:bg-[linear-gradient(30deg,transparent_40%,rgba(255,255,255,0.02)_50%,transparent_60%)]"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/15 to-blue-600/10 dark:from-blue-500/20 dark:to-purple-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-600/12 to-blue-700/8 dark:from-purple-500/18 dark:to-indigo-500/12 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-blue-400/8 to-blue-500/6 dark:from-blue-400/12 dark:to-purple-400/8 rounded-full blur-2xl"></div>

        {/* Subtle accent lines */}
        <div className="absolute top-20 left-20 w-32 h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent dark:from-transparent dark:via-blue-600/30 dark:to-transparent"></div>
        <div className="absolute bottom-20 right-20 w-32 h-px bg-gradient-to-l from-transparent via-blue-300/30 to-transparent dark:from-transparent dark:via-blue-600/30 dark:to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 backdrop-blur-sm border border-blue-600/20 dark:border-purple-500/20 rounded-full px-6 py-3 text-blue-700 dark:text-purple-300 font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Rocket className="w-5 h-5 mr-2 text-blue-600 dark:text-purple-500" />
              </motion.div>
              Ready to Get Started?
            </motion.div>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="cta-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
          >
            <span className="block">Take Control of Your</span>
            <motion.span
              className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto]"
              animate={{
                backgroundPosition: ['0% center', '200% center', '0% center'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              Finances Today
            </motion.span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            Join thousands of users who have transformed their financial health with smart tracking
            and AI insights.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-12 py-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              asChild
            >
              <a href="/dashboard" aria-label="Start tracking your finances for free">
                Start Tracking Free
                <ArrowRight className="ml-3 w-5 h-5" aria-hidden="true" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-600/20 dark:border-purple-500/20 text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 hover:border-blue-600/40 dark:hover:border-purple-500/40 text-lg px-12 py-6 rounded-2xl bg-muted/50 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              asChild
            >
              <a href="/pricing" aria-label="View pricing plans">
                View Plans
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
