import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cookie, Settings, Shield, BarChart, Target } from 'lucide-react';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: `Cookie Policy | ${appConfig.app.name}`,
  description:
    'Learn about how we use cookies and similar technologies to enhance your experience on our platform.',
};

const cookieCategories = [
  {
    title: 'Essential Cookies',
    description: 'Required for basic website functionality',
    icon: Shield,
    color: 'bg-green-500',
    required: true,
  },
  {
    title: 'Analytics Cookies',
    description: 'Help us understand how you use our website',
    icon: BarChart,
    color: 'bg-blue-500',
    required: false,
  },
  {
    title: 'Marketing Cookies',
    description: 'Used to deliver relevant advertisements',
    icon: Target,
    color: 'bg-purple-500',
    required: false,
  },
  {
    title: 'Preference Cookies',
    description: 'Remember your settings and preferences',
    icon: Settings,
    color: 'bg-orange-500',
    required: false,
  },
];

const cookieDetails = [
  {
    name: '_session_id',
    category: 'Essential',
    purpose: 'Maintains your session state',
    duration: 'Session',
    type: 'HTTP Cookie',
  },
  {
    name: '_csrf_token',
    category: 'Essential',
    purpose: 'Protects against cross-site request forgery',
    duration: 'Session',
    type: 'HTTP Cookie',
  },
  {
    name: '_ga',
    category: 'Analytics',
    purpose: 'Distinguishes unique users',
    duration: '2 years',
    type: 'HTTP Cookie',
  },
  {
    name: '_gid',
    category: 'Analytics',
    purpose: 'Distinguishes unique users',
    duration: '24 hours',
    type: 'HTTP Cookie',
  },
  {
    name: '_fbp',
    category: 'Marketing',
    purpose: 'Facebook pixel tracking',
    duration: '3 months',
    type: 'HTTP Cookie',
  },
  {
    name: 'user_preferences',
    category: 'Preference',
    purpose: 'Stores your UI preferences',
    duration: '1 year',
    type: 'Local Storage',
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-xl text-muted-foreground">Last updated: January 15, 2024</p>
        </div>

        {/* Cookie Overview */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Cookie className="w-8 h-8 text-purple-500" />
            <h2 className="text-2xl font-bold">What Are Cookies?</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Cookies are small text files that are placed on your computer or mobile device when
                you visit our website. They help us provide you with a better experience by
                remembering your preferences and understanding how you use our site.
              </p>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your browsing experience, provide
                personalized content, analyze our traffic, and improve our services.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cookie Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Types of Cookies We Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cookieCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                      </div>
                      {category.required && <Badge variant="default">Required</Badge>}
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.required
                        ? 'These cookies are essential for the website to function properly and cannot be disabled.'
                        : 'You can choose to accept or decline these cookies.'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Cookie Details */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Cookie Details</h2>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="essential">Essential</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {cookieDetails.map((cookie, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{cookie.name}</h3>
                        <Badge variant="outline">{cookie.category}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Purpose:</span>
                          <p className="text-muted-foreground">{cookie.purpose}</p>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p className="text-muted-foreground">{cookie.duration}</p>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <p className="text-muted-foreground">{cookie.type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="essential" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Essential cookies are required for the website to function properly.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Analytics cookies help us understand how you use our website.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="marketing" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Marketing cookies are used to deliver relevant advertisements.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cookie Management */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Managing Your Cookie Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Browser Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Most web browsers allow you to control cookies through their settings preferences.
                  You can set your browser to refuse cookies or delete certain cookies.
                </p>
                <p className="text-muted-foreground mb-4">
                  However, if you delete or refuse cookies, some features of our website may not
                  function properly.
                </p>
                <Button variant="outline">Learn More</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cookie Consent Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You can manage your cookie preferences using our cookie consent manager. This
                  allows you to choose which types of cookies you want to accept.
                </p>
                <p className="text-muted-foreground mb-4">
                  You can change your preferences at any time by clicking the cookie settings link
                  in our footer.
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Manage Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Third-Party Cookies */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Third-Party Cookies</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                We may also use third-party services that set cookies on our behalf. These include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Google Analytics for website analytics</li>
                <li>Facebook Pixel for advertising and analytics</li>
                <li>Stripe for payment processing</li>
                <li>Intercom for customer support</li>
              </ul>
              <p className="text-muted-foreground">
                These third-party services have their own privacy policies and cookie practices. We
                encourage you to review their policies to understand how they use cookies.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Updates to Policy */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Updates to This Policy</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our
                practices or for other operational, legal, or regulatory reasons.
              </p>
              <p className="text-muted-foreground">
                We will notify you of any material changes by posting the new Cookie Policy on this
                page and updating the &quot;Last updated&quot; date. We encourage you to review this
                Cookie Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Contact Us</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please
                contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">{appConfig.app.name} Privacy Team</p>
                <p>
                  Email:{' '}
                  <a
                    href={`mailto:${appConfig.contact.generalEmail}`}
                    className="text-purple-500 hover:underline"
                  >
                    {appConfig.contact.generalEmail}
                  </a>
                </p>
                <p>Address: 123 Market Street, Suite 100, San Francisco, CA 94105</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cookie Settings CTA */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Manage Your Cookie Preferences</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Take control of your privacy by managing which cookies you want to accept. You can
            change your preferences at any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Accept All Cookies
            </Button>
            <Button variant="outline" size="lg">
              Customize Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
