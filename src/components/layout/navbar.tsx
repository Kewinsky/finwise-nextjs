'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/themes/theme-toggle';
import { Menu, X } from 'lucide-react';
import { Magnetic } from '../ui/magnetic';
import { appConfig } from '@/config/app';

interface NavLink {
  href: string;
  label: string;
  active?: boolean;
}

interface NavbarProps {
  brandName?: string;
  logo?: React.ReactNode;
  navigationLinks?: NavLink[];
  signInText?: string;
  signInHref?: string;
  ctaText?: string;
  ctaHref?: string;
  showThemeToggle?: boolean;
}

const defaultNavigationLinks: NavLink[] = [
  { href: '/', label: 'Home', active: true },
  { href: '#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About Us' },
];

export function Navbar({
  brandName = appConfig.app.name,
  logo = '🚀',
  navigationLinks = defaultNavigationLinks,
  signInText = 'Sign In',
  signInHref = '/login',
  ctaText = 'Get Started',
  ctaHref = '/dashboard',
  showThemeToggle = true,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const underlineOffset = 'underline-offset-7';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative container mx-auto grid h-16 max-w-screen-2xl grid-cols-[1fr_auto_auto] items-center lg:grid-cols-[auto_1fr_auto] px-4">
        {/* Logo and Brand */}
        <div className="col-start-1 col-end-2 row-start-1 row-end-2">
          <Magnetic>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">{logo}</span>
              <span className="font-bold text-xl">{brandName}</span>
            </Link>
          </Magnetic>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <nav className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium ${underlineOffset} hover:underline px-3 py-1`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden col-start-3 col-end-[-1] row-start-1 row-end-2 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Right Side Actions */}
        <div className="gap-2 col-start-2 col-end-3 row-start-1 row-end-2 flex items-center justify-self-end lg:col-start-3 lg:col-end-[-1]">
          {showThemeToggle && <ThemeToggle />}

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="link" size="sm" asChild>
              <Link className={underlineOffset} href={signInHref}>
                {signInText}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <div className="flex flex-col items-center space-y-3">
              {navigationLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium ${underlineOffset} hover:underline text-center ${
                    index === navigationLinks.length - 1 ? 'mb-2' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col items-center space-y-2">
                <Button variant="link" size="sm" asChild>
                  <Link className={underlineOffset} href={signInHref}>
                    {signInText}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={ctaHref}>{ctaText}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
