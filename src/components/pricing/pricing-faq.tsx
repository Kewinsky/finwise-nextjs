import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans come with a 14-day free trial. No credit card required to get started.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Yes, we offer a 30-day money-back guarantee for all paid plans. Contact our support team for assistance.',
  },
];

export function PricingFAQ() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about our pricing
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
