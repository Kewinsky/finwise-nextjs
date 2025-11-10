import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Code, Database, Zap, Shield, Users } from 'lucide-react';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: `Documentation | ${appConfig.app.name}`,
  description: `Complete documentation for ${appConfig.app.name} platform. Learn how to integrate, customize, and extend our services.`,
};

const documentationSections = [
  {
    title: 'Getting Started',
    description: 'Quick start guide to get you up and running',
    icon: Zap,
    items: [
      { title: 'Installation', description: 'Set up your environment' },
      { title: 'Configuration', description: 'Configure your settings' },
      { title: 'First Steps', description: 'Create your first project' },
    ],
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation and examples',
    icon: Code,
    items: [
      { title: 'Authentication', description: 'API authentication methods' },
      { title: 'Endpoints', description: 'All available API endpoints' },
      { title: 'SDKs', description: 'Official SDKs and libraries' },
    ],
  },
  {
    title: 'Database',
    description: 'Database schema and data management',
    icon: Database,
    items: [
      { title: 'Schema', description: 'Database structure overview' },
      { title: 'Migrations', description: 'Database migration guides' },
      { title: 'Queries', description: 'Common query patterns' },
    ],
  },
  {
    title: 'Security',
    description: 'Security best practices and guidelines',
    icon: Shield,
    items: [
      { title: 'Authentication', description: 'User authentication flows' },
      { title: 'Authorization', description: 'Role-based access control' },
      { title: 'Data Protection', description: 'Data encryption and privacy' },
    ],
  },
  {
    title: 'Team Management',
    description: 'Collaboration and team features',
    icon: Users,
    items: [
      { title: 'Invitations', description: 'Invite team members' },
      { title: 'Roles', description: 'Manage user roles and permissions' },
      { title: 'Workspaces', description: 'Organize team workspaces' },
    ],
  },
  {
    title: 'Guides',
    description: 'Step-by-step tutorials and guides',
    icon: BookOpen,
    items: [
      { title: 'Tutorials', description: 'Interactive tutorials' },
      { title: 'Best Practices', description: 'Recommended approaches' },
      { title: 'Troubleshooting', description: 'Common issues and solutions' },
    ],
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know to build amazing applications with our platform. From quick
            start guides to advanced API references.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full px-4 py-3 pl-10 pr-4 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {documentationSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-purple-500" />
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-purple-500 mt-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Section
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Quick Start</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Code className="w-5 h-5" />
              <span>API Reference</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>Tutorials</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Community</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
