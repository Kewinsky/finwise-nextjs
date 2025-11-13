'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Is my financial data secure?',
    answer:
      'Yes, absolutely. We use bank-level encryption (256-bit SSL) to protect all your financial data. We never store your banking credentials, and all connections are secured with industry-standard protocols.',
  },
  {
    question: 'How does the AI categorization work?',
    answer:
      'Our AI uses machine learning to automatically categorize your transactions based on merchant names, transaction patterns, and your past behavior. It learns from your corrections to get smarter over time.',
  },
  {
    question: 'Can I connect multiple bank accounts?',
    answer:
      'Yes! You can connect unlimited bank accounts, credit cards, and investment accounts. All your financial data is aggregated in one place for a complete view of your finances.',
  },
  {
    question: 'What happens if I cancel my subscription?',
    answer:
      "You can cancel anytime. Your data remains accessible, and you can export it at any time. After cancellation, you'll be moved to the Free plan with its limitations.",
  },
  {
    question: 'Do you support international banks?',
    answer:
      "We currently support banks in the US, Canada, UK, and EU. We're continuously adding support for more countries and financial institutions.",
  },
  {
    question: 'Can I use Finwise for business expenses?',
    answer:
      'Yes! Our Pro plan includes multi-account management and team collaboration features perfect for small businesses and freelancers who need to track both personal and business finances.',
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-24 bg-background relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 id="faq-heading" className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about Finwise. Can&apos;t find the answer you&apos;re
            looking for? Contact our support team.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-muted/50 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/80 transition-colors duration-200"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-foreground pr-8">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200',
                    openIndex === index && 'transform rotate-180',
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
