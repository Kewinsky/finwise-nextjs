'use client';

import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'motion/react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Financial Advisor',
    company: 'Wealth Management Co.',
    content:
      'Finwise has completely transformed how I track my finances. The AI insights are incredibly accurate and have helped me save thousands. The interface is beautiful and intuitive.',
    rating: 5,
  },
  {
    name: 'Mike Rodriguez',
    role: 'Small Business Owner',
    company: 'Rodriguez & Associates',
    content:
      'As a business owner, I needed a tool to track both personal and business expenses. Finwise makes it so easy, and the automated categorization saves me hours every month.',
    rating: 5,
  },
  {
    name: 'Emily Johnson',
    role: 'Freelance Designer',
    company: 'Independent',
    content:
      "I've tried many budgeting apps, but Finwise is by far the best. The real-time sync with my accounts and the beautiful analytics dashboards make financial planning actually enjoyable.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section
      className="py-24 bg-gradient-to-br from-background via-muted/20 to-purple-50/30 dark:from-background dark:via-muted/10 dark:to-purple-950/5 relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Modern background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_40%,rgba(0,0,0,0.02)_50%,transparent_60%)] dark:bg-[linear-gradient(30deg,transparent_40%,rgba(255,255,255,0.02)_50%,transparent_60%)]"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/15 to-purple-600/10 dark:from-purple-500/20 dark:to-pink-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-600/12 to-purple-700/8 dark:from-pink-500/18 dark:to-indigo-500/12 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-purple-400/8 to-purple-500/6 dark:from-purple-400/12 dark:to-pink-400/8 rounded-full blur-2xl"></div>

        {/* Subtle accent lines */}
        <div className="absolute top-20 left-20 w-32 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent dark:from-transparent dark:via-purple-600/30 dark:to-transparent"></div>
        <div className="absolute bottom-20 right-20 w-32 h-px bg-gradient-to-l from-transparent via-purple-300/30 to-transparent dark:from-transparent dark:via-purple-600/30 dark:to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            id="testimonials-heading"
            className="text-4xl sm:text-5xl font-bold text-foreground mb-6"
          >
            What{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Users Say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Don&apos;t just take our word for it. Here&apos;s what real users are saying about
            Finwise.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-muted/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-border/50 hover:border-blue-600/30 dark:hover:border-purple-500/30 shadow-lg group h-full relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <CardContent className="p-6 relative z-10">
                  <div
                    className="flex items-center gap-1 mb-4"
                    role="img"
                    aria-label={`${testimonial.rating} out of 5 stars`}
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300"
                        style={{ transitionDelay: `${i * 50}ms` }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <Quote
                    className="w-8 h-8 text-blue-600 dark:text-purple-500 mb-4 opacity-50 group-hover:opacity-75 group-hover:scale-110 transition-all duration-300"
                    aria-hidden="true"
                  />

                  <blockquote className="text-muted-foreground mb-6 leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
                    &quot;{testimonial.content}&quot;
                  </blockquote>

                  <div className="border-t border-border/50 pt-4">
                    <cite className="not-italic">
                      <div className="font-semibold text-foreground group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </cite>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
