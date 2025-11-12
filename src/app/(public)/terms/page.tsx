import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for using Finwise expense tracking platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Terms of Service
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

        {/* Terms Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using {appConfig.app.name} (&quot;the Service&quot;), you accept
                and agree to be bound by these Terms of Service. If you do not agree to these terms,
                please do not use the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {appConfig.app.name} provides a platform for tracking expenses and income, analyzing
                financial data, and receiving AI-powered financial insights. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Expense and income tracking</li>
                <li>Financial analytics and reporting</li>
                <li>AI-powered financial insights</li>
                <li>Account management</li>
                <li>Data export capabilities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access our service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                You agree to use our service only for lawful purposes. You may not use the service
                to violate any laws, infringe on intellectual property rights, or engage in any
                harmful or fraudulent activities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Payment Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Our service is offered on a subscription basis. Subscription fees are billed in
                advance. All fees are non-refundable except as required by law. We may change our
                pricing with 30 days&apos; notice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                The service and its content are protected by copyright, trademark, and other laws.
                You retain ownership of your data, subject to our right to use it as necessary to
                provide the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our{' '}
                <a href="/privacy" className="text-blue-600 dark:text-purple-400 hover:underline">
                  Privacy Policy
                </a>{' '}
                to understand how we handle your data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {appConfig.app.name} shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use of the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account at any time for violations of these Terms.
                You may terminate your account at any time through your account settings or by
                contacting us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be
                communicated with at least 30 days&apos; notice. Continued use of the service after
                changes constitutes acceptance of the revised terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
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
