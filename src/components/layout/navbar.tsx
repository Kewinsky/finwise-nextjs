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
  { href: '/', label: 'Home' },
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="relative container mx-auto grid h-16 max-w-screen-2xl grid-cols-[1fr_auto_auto] items-center lg:grid-cols-[auto_1fr_auto] px-4">
        {/* Logo and Brand */}
        <div className="col-start-1 col-end-2 row-start-1 row-end-2">
          <Magnetic>
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                {logo}
              </span>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                {brandName}
              </span>
            </Link>
          </Magnetic>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <nav className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-1 bg-muted/30 backdrop-blur-sm rounded-full px-2 py-1 border border-border/50">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-purple-500 px-4 py-2 rounded-full transition-all duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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
            className="hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-purple-500 transition-colors duration-300"
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

          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="link"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-purple-500 transition-colors"
            >
              <Link className={underlineOffset} href={signInHref}>
                {signInText}
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              asChild
            >
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2"
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            <div className="flex flex-col items-center space-y-3">
              {navigationLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium px-4 py-2 rounded-lg w-full text-center transition-all duration-300 text-foreground hover:text-purple-500 hover:bg-muted ${
                    index === navigationLinks.length - 1 ? 'mb-2' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col items-center space-y-2 w-full pt-2 border-t border-border/40">
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="text-muted-foreground hover:text-purple-500 transition-colors duration-300 w-full"
                >
                  <Link className={underlineOffset} href={signInHref}>
                    {signInText}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
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
