'use client';

import { CreditCard, Settings as SettingsIcon, User, Bell, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const settingsTabs = [
  {
    name: 'General',
    href: '/settings',
    icon: SettingsIcon,
    description: 'Manage your account settings and preferences.',
  },
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Update your personal information and profile details.',
  },
  {
    name: 'Billing & Plans',
    href: '/settings/billing',
    icon: CreditCard,
    description: 'Manage your subscription, billing, and payment methods.',
  },
  // {
  //   name: "Connected Apps",
  //   href: "/settings/connected-apps",
  //   icon: Apps,
  //   description: "Manage third-party integrations and connected services.",
  // },
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Configure your notification preferences.',
  },
  {
    name: 'Contact Us',
    href: '/settings/contact-us',
    icon: MessageCircle,
    description: 'Get in touch with our support team.',
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden xl:block xl:sticky xl:w-64 xl:flex-shrink-0">
      <div className="w-full">
        <nav
          className="flex space-x-2 py-1 xl:flex-col xl:space-y-1 xl:space-x-0"
          role="navigation"
          aria-label="Settings navigation"
        >
          {settingsTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'inline-flex items-center gap-3 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-3 py-2 justify-start group',
                pathname === tab.href
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground',
              )}
              aria-current={pathname === tab.href ? 'page' : undefined}
            >
              <tab.icon className="h-4 w-4 flex-shrink-0 transition-colors" />
              <span className="truncate">{tab.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
