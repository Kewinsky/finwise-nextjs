import { Button } from '@/components/ui/button';

export function PricingCTA() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Take Control of Your Finances?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of users who have transformed their financial health with smart tracking
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            asChild
          >
            <a href="/dashboard">Start Tracking Free</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
