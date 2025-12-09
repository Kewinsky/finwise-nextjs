import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/landing/hero-section';

describe('HeroSection', () => {
  it('renders main heading and default description', () => {
    render(<HeroSection />);

    expect(
      screen.getByRole('heading', { name: /take control of your finances/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Track expenses, analyze income, and get AI-powered insights/i),
    ).toBeInTheDocument();
  });

  it('renders primary CTA button linking to dashboard', () => {
    render(<HeroSection />);

    const ctaButton = screen.getByRole('link', { name: /start tracking free/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/dashboard');
  });
});
