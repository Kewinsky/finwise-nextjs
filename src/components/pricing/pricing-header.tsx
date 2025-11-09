export function PricingHeader() {
  return (
    <section className="pt-20 px-4 bg-gradient-to-br from-background via-muted/20 to-blue-50/30 dark:from-background dark:via-muted/10 dark:to-blue-950/5">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Simple, Transparent{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pricing
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Choose the perfect plan for your financial tracking needs. Start free and upgrade as you
          grow.
        </p>
      </div>
    </section>
  );
}
