import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Shield, AlertTriangle, FileText } from 'lucide-react';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: `Terms of Service | ${appConfig.app.name}`,
  description:
    'Read our terms of service to understand the rules and guidelines for using our SaaS platform and services.',
};

const termsSections = [
  {
    title: 'Acceptance of Terms',
    icon: Scale,
    description: 'By using our services, you agree to these terms',
  },
  {
    title: 'Service Description',
    icon: FileText,
    description: 'What we provide and how our services work',
  },
  {
    title: 'User Responsibilities',
    icon: Shield,
    description: 'Your obligations when using our platform',
  },
  {
    title: 'Prohibited Uses',
    icon: AlertTriangle,
    description: 'Activities that are not allowed on our platform',
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Terms of Service
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-xl text-muted-foreground">Last updated: January 15, 2024</p>
        </div>

        {/* Terms Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Terms Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {termsSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-primary" />
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{section.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Terms Content */}
        <div className="prose prose-gray max-w-none">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing and using Your SaaS (&quot;the Service&quot;), you accept and agree to
                be bound by the terms and provision of this agreement. If you do not agree to abide
                by the above, please do not use this service.
              </p>
              <p className="text-muted-foreground">
                These Terms of Service (&quot;Terms&quot;) govern your use of our website and
                services operated by Your SaaS (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your SaaS provides a platform for building and managing SaaS applications. Our
                services include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Web-based application development tools</li>
                <li>Database management and hosting services</li>
                <li>API access and integration tools</li>
                <li>User authentication and management</li>
                <li>Billing and subscription management</li>
                <li>Technical support and documentation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To access certain features of our service, you must register for an account. You
                agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Acceptable Use Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You agree to use our service only for lawful purposes and in accordance with these
                Terms. You agree not to use the service:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>
                  To violate any international, federal, provincial, or state regulations, rules,
                  laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights or the intellectual
                  property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or
                  discriminate
                </li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of the service</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our service is offered on a subscription basis. Payment terms include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We may change our pricing with 30 days&apos; notice</li>
                <li>You are responsible for all taxes associated with your use of the service</li>
                <li>Failure to pay may result in service suspension or termination</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The service and its original content, features, and functionality are and will
                remain the exclusive property of Your SaaS and its licensors. The service is
                protected by copyright, trademark, and other laws.
              </p>
              <p className="text-muted-foreground">
                You retain ownership of any content you create using our service, subject to our
                right to use such content as necessary to provide the service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy, which also
                governs your use of the service, to understand our practices.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We strive to maintain high service availability but do not guarantee uninterrupted
                access. We may:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Perform scheduled maintenance with advance notice</li>
                <li>Experience unscheduled downtime due to technical issues</li>
                <li>Modify or discontinue features with reasonable notice</li>
                <li>Suspend service for violations of these Terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                In no event shall Your SaaS, nor its directors, employees, partners, agents,
                suppliers, or affiliates, be liable for any indirect, incidental, special,
                consequential, or punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from your use of the
                service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may terminate or suspend your account and bar access to the service immediately,
                without prior notice or liability, under our sole discretion, for any reason
                whatsoever and without limitation, including but not limited to a breach of the
                Terms.
              </p>
              <p className="text-muted-foreground">
                You may terminate your account at any time by contacting us or using the account
                termination features in your dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>11. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                These Terms shall be interpreted and governed by the laws of the State of
                California, without regard to its conflict of law provisions. Our failure to enforce
                any right or provision of these Terms will not be considered a waiver of those
                rights.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>12. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We reserve the right, at our sole discretion, to modify or replace these Terms at
                any time. If a revision is material, we will provide at least 30 days&apos; notice
                prior to any new terms taking effect.
              </p>
              <p className="text-muted-foreground">
                By continuing to access or use our service after those revisions become effective,
                you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">{appConfig.app.name} Legal Team</p>
                <p>
                  Email:{' '}
                  <a
                    href={`mailto:${appConfig.contact.generalEmail}`}
                    className="text-primary hover:underline"
                  >
                    {appConfig.contact.generalEmail}
                  </a>
                </p>
                <p>Address: 123 Market Street, Suite 100, San Francisco, CA 94105</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
