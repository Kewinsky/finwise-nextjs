import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { appConfig } from '@/config/app';

interface FooterProps {
  brandName?: string;
  copyrightYear?: number;
}

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Documentation', href: appConfig.urls.docs },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Help', href: '/help' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact', href: `mailto:${appConfig.contact.supportEmail}` },
  ],
  legal: [
    { name: 'Privacy Policy', href: appConfig.urls.legal.privacy },
    { name: 'Terms of Service', href: appConfig.urls.legal.terms },
    { name: 'Cookie Policy', href: appConfig.urls.legal.cookies },
  ],
};

const socialLinks = [
  { name: 'GitHub', href: appConfig.urls.social.github, icon: Github },
  { name: 'Twitter', href: appConfig.urls.social.twitter, icon: Twitter },
  { name: 'LinkedIn', href: appConfig.urls.social.linkedin, icon: Linkedin },
  {
    name: 'Email',
    href: `mailto:${appConfig.contact.generalEmail}`,
    icon: Mail,
  },
];

export function Footer({
  brandName = appConfig.app.name,
  copyrightYear = new Date().getFullYear(),
}: FooterProps) {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-screen-2xl px-4">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">🚀</div>
              <span className="font-bold text-xl">{brandName}</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Build amazing SaaS applications with our modern, flexible template. Get started in
              minutes and focus on what matters most.
            </p>

            {/* Social links */}
            <div className="space-y-3">
              <h3 className="font-semibold">Follow us</h3>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © {copyrightYear} {appConfig.app.author}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
