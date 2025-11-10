import './globals.css';
import type { Metadata } from 'next';
import { ThemeWrapper } from '@/components/themes/theme-wrapper';
import { ToasterComponent } from '@/components/ui/toaster';
import { CookieProvider } from '@/contexts/cookie-context';
import { SettingsProvider } from '@/contexts/settings-context';
import { CookieBanner } from '@/components/cookies/cookie-banner';
import { getFontVariables } from '@/lib/fonts';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: {
    default: appConfig.app.name,
    template: `%s | ${appConfig.app.name}`,
  },
  description: appConfig.app.description,
  keywords: [...appConfig.app.keywords],
  authors: [{ name: appConfig.app.author }],
  creator: appConfig.app.author,
  publisher: appConfig.app.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(appConfig.urls.base),
  alternates: {
    canonical: new URL('/', appConfig.urls.base).toString(),
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: appConfig.app.name,
    description: appConfig.app.description,
    siteName: appConfig.app.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: appConfig.app.name,
    description: appConfig.app.description,
    creator: appConfig.seo.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: '/icon',
    apple: '/icon',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${getFontVariables()} antialiased`}>
        <CookieProvider>
          <ThemeWrapper>
            <SettingsProvider>
              <main>{children}</main>
              <CookieBanner />
              <ToasterComponent />
            </SettingsProvider>
          </ThemeWrapper>
        </CookieProvider>
      </body>
    </html>
  );
}
