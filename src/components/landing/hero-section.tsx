'use client';

import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

interface HeroSectionProps {
  badge?: string;
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
}

export const HeroSection = ({
  badge = '💰 Smart Financial Tracking',
  heading = 'Take Control of Your Finances',
  description = 'Track expenses, analyze income, and get AI-powered insights to make smarter financial decisions. Simple, secure, and designed for modern life.',
  buttons = {
    primary: {
      text: 'Start Tracking Free',
      url: '/dashboard',
    },
    secondary: {
      text: 'See How It Works',
      url: '#features',
    },
  },
}: HeroSectionProps) => {
  return (
    <section
      className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-blue-50/30 dark:from-background dark:via-muted/10 dark:to-blue-950/5 flex items-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated floating orbs with better movement */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/15 dark:to-purple-400/15 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
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
          className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-blue-400/8 to-purple-400/8 dark:from-blue-300/12 dark:to-purple-300/12 rounded-full blur-2xl"
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-20 h-20 bg-gradient-to-r from-purple-500/6 to-blue-500/6 dark:from-purple-400/10 dark:to-blue-400/10 rounded-full blur-xl"
          animate={{
            y: [0, -10, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/8 dark:to-purple-400/8 rounded-full blur-lg"
          animate={{
            y: [0, 25, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)]" />

        {/* Subtle gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-950/10 dark:to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-purple-50/20 to-transparent dark:from-purple-950/10 dark:to-transparent"></div>

        {/* Geometric shapes */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-blue-200/20 dark:border-blue-800/20 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 border border-purple-200/20 dark:border-purple-800/20 rounded-full blur-xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 200 }}
            className="mb-8"
          >
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-5 py-2.5 text-sm font-medium shadow-lg hover:shadow-xl transition-shadow duration-300 inline-flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {badge.split(' ')[0]}
              </motion.span>
              <span>{badge.split(' ').slice(1).join(' ')}</span>
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
            id="hero-heading"
            className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight"
          >
            <span className="block">{heading.split(' ').slice(0, -1).join(' ')} </span>
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
              {heading.split(' ').slice(-1)[0]}
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              asChild
            >
              <a href={buttons.primary?.url} aria-label={buttons.primary?.text}>
                {buttons.primary?.text}
                <ArrowRight className="ml-3 w-5 h-5" aria-hidden="true" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-10 py-6 rounded-2xl border-2 border-blue-600/20 dark:border-purple-500/20 text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 hover:border-blue-600/40 dark:hover:border-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              asChild
            >
              <a href={buttons.secondary?.url} aria-label={buttons.secondary?.text}>
                {buttons.secondary?.text}
              </a>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8"
          >
            {[
              {
                icon: Zap,
                text: 'Instant Setup',
                color: 'text-yellow-500',
                bg: 'bg-yellow-500/10',
              },
              {
                icon: Sparkles,
                text: 'AI-Powered Insights',
                color: 'text-blue-600 dark:text-purple-500',
                bg: 'bg-blue-500/10 dark:bg-purple-500/10',
              },
              {
                icon: Zap,
                text: 'Bank-Level Security',
                color: 'text-green-500',
                bg: 'bg-green-500/10',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 hover:border-blue-600/30 dark:hover:border-purple-500/30 transition-all duration-300 group"
                >
                  <div
                    className={`p-1.5 rounded-lg ${item.bg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon
                      className={`w-4 h-4 ${item.color}`}
                      aria-hidden="true"
                      role="img"
                      aria-label={`${item.text} icon`}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
