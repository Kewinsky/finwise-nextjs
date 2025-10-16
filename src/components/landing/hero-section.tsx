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
  badge = '🚀 Launch Your SaaS in Days',
  heading = 'Build Amazing SaaS Apps',
  description = 'A modern, flexible template built with Next.js, TypeScript, and Tailwind CSS. Get started in minutes with our comprehensive SaaS starter kit.',
  buttons = {
    primary: {
      text: 'Get Started Free',
      url: '/dashboard',
    },
    secondary: {
      text: 'View Demo',
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
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/8 dark:bg-blue-400/12 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400/6 dark:bg-blue-300/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-blue-300/5 dark:bg-blue-200/8 rounded-full blur-md animate-pulse delay-2000"></div>

        {/* Subtle gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50/15 to-transparent dark:from-blue-950/8 dark:to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-blue-50/15 to-transparent dark:from-blue-950/8 dark:to-transparent"></div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2 text-sm font-medium">
              {badge}
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="hero-heading"
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight"
          >
            {heading}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-light"
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
              className="text-lg px-10 py-6 rounded-2xl border-2 border-border text-foreground hover:bg-muted hover:border-border/80 transition-all duration-300 transform hover:-translate-y-1"
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
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground text-sm"
          >
            <div className="flex items-center">
              <Zap
                className="w-4 h-4 text-yellow-500 mr-2"
                aria-hidden="true"
                role="img"
                aria-label="Lightning icon"
              />
              <span>Lightning Fast Setup</span>
            </div>
            <div className="flex items-center">
              <Sparkles
                className="w-4 h-4 text-blue-500 mr-2"
                aria-hidden="true"
                role="img"
                aria-label="Sparkles icon"
              />
              <span>Modern Tech Stack</span>
            </div>
            <div className="flex items-center">
              <Zap
                className="w-4 h-4 text-green-500 mr-2"
                aria-hidden="true"
                role="img"
                aria-label="Lightning icon"
              />
              <span>Production Ready</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
