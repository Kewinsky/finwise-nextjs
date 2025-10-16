'use client';

import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

const benefits = [
  {
    title: 'Modern Tech Stack',
    description:
      'Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components. Built with the latest technologies.',
  },
  {
    title: 'Responsive Design',
    description:
      'Mobile-first approach with beautiful responsive layouts that work on every device.',
  },
  {
    title: 'Dark Mode Support',
    description:
      'Built-in theme switching with system preference detection. Your users will love it.',
  },
  {
    title: 'Flexible Layouts',
    description: 'Public and protected layouts with customizable navigation. Adapt to your needs.',
  },
  {
    title: 'Production Ready',
    description:
      'Authentication, database integration, and deployment guides included. Launch with confidence.',
  },
  {
    title: 'Well Documented',
    description:
      'Comprehensive documentation and examples. Get up and running in minutes, not hours.',
  },
];

export const BenefitsSection = () => {
  return (
    <section
      className="py-24 bg-gradient-to-br from-background via-muted/20 to-blue-50/30 dark:from-background dark:via-muted/10 dark:to-blue-950/5 relative overflow-hidden"
      aria-labelledby="benefits-heading"
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 id="benefits-heading" className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Template?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Save weeks of development time and focus on what matters most - building your product.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex items-start gap-4 group"
            >
              <div className="flex-shrink-0" aria-hidden="true">
                <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                  <CheckCircle
                    className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform duration-300"
                    aria-label="Check mark"
                  />
                </motion.div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-12 py-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            asChild
          >
            <a href="/dashboard" aria-label="Start building your SaaS today">
              Start Building Today
              <ArrowRight className="ml-3 w-5 h-5" aria-hidden="true" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
