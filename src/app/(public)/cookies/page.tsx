import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how we use cookies and similar technologies.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cookie Policy
            </span>
          </h1>
          <p className="text-muted-foreground">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Cookie Policy Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device when you visit our
                website. They help us provide you with a better experience by remembering your
                preferences and understanding how you use our site.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the following types of cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Essential Cookies:</strong> Required for the website to function properly.
                  These cannot be disabled.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how visitors use our
                  website.
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings and preferences.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may use third-party services that set cookies on our behalf. These services have
                their own privacy policies and cookie practices. We encourage you to review their
                policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Managing Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can control cookies through your browser settings. Most browsers allow you to
                refuse cookies or delete certain cookies.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                However, if you delete or refuse cookies, some features of our website may not
                function properly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time. We will notify you of any
                material changes by posting the new Cookie Policy on this page and updating the
                &quot;Last updated&quot; date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">{appConfig.app.name}</p>
                <p>
                  Email:{' '}
                  <a
                    href={`mailto:${appConfig.contact.email}`}
                    className="text-blue-600 dark:text-purple-400 hover:underline"
                  >
                    {appConfig.contact.email}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
