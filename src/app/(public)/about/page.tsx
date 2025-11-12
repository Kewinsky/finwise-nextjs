import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Shield, Zap } from 'lucide-react';
import { appConfig } from '@/config/app';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about ${appConfig.app.name} and our mission to make financial management accessible to everyone.`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {appConfig.app.name}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We&apos;re building the future of personal finance management, making smart financial
            tracking accessible to everyone.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12 border-2">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To democratize financial wellness by providing intelligent, user-friendly tools
                  that help people understand and improve their financial health through smart
                  tracking and AI-powered insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Simple & Fast</h3>
              <p className="text-sm text-muted-foreground">
                Track expenses and income with ease. Get started in minutes.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your financial data is protected with bank-level security.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent insights to make smarter financial decisions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of users who are already improving their financial health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              asChild
            >
              <Link href="/dashboard">Start Tracking Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
