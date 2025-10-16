import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { StatsSection } from '@/components/landing/stats-section';
import { BenefitsSection } from '@/components/landing/benefits-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CTASection } from '@/components/landing/cta-section';

export default function Home() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
