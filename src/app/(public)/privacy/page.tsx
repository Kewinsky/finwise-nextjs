import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
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

        {/* Privacy Policy Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you create an
                account, make a purchase, or contact us for support. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Name and email address</li>
                <li>Billing and payment information</li>
                <li>Profile information and preferences</li>
                <li>Financial transaction data you enter</li>
                <li>Usage data and device information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide and maintain our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Improve our services and develop new features</li>
                <li>Provide AI-powered financial insights</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third
                parties except with your explicit consent, to comply with legal obligations, to
                protect our rights, or with service providers who assist us in operating our
                services under strict confidentiality agreements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal
                information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure infrastructure and monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal
                information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access and portability of your data</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, please contact us at{' '}
                <a
                  href={`mailto:${appConfig.contact.email}`}
                  className="text-blue-600 dark:text-purple-400 hover:underline"
                >
                  {appConfig.contact.email}
                </a>
                .
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience. You can
                control cookie settings through your browser preferences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not
                knowingly collect personal information from children under 13.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new Privacy Policy on this page and updating the
                &quot;Last updated&quot; date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">{appConfig.app.name} Privacy Team</p>
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
