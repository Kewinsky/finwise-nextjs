import { Button } from '@/components/ui/button';

export function PricingCTA() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of satisfied customers who trust our platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="/dashboard">Start Free Trial</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#contact">Contact Sales</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
