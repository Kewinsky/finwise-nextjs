import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Target, Award, Heart, Zap } from 'lucide-react';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: `About Us | ${appConfig.app.name}`,
  description: `Learn about our mission, values, and the team behind ${appConfig.app.name} platform.`,
};

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: '/api/placeholder/150/150',
    bio: 'Former tech executive with 15+ years in SaaS. Passionate about building products that make a difference.',
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    image: '/api/placeholder/150/150',
    bio: 'Full-stack engineer and open source contributor. Loves solving complex technical challenges.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Design',
    image: '/api/placeholder/150/150',
    bio: 'Designer with a focus on user experience and accessibility. Believes great design should be inclusive.',
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    image: '/api/placeholder/150/150',
    bio: 'Backend specialist with expertise in scalable systems. Enjoys mentoring and building great teams.',
  },
];

const values = [
  {
    title: 'Innovation',
    description:
      'We constantly push boundaries and explore new technologies to deliver cutting-edge solutions.',
    icon: Zap,
  },
  {
    title: 'Quality',
    description:
      'We maintain the highest standards in everything we build, from code to customer support.',
    icon: Award,
  },
  {
    title: 'Community',
    description:
      'We believe in the power of community and actively contribute to open source projects.',
    icon: Users,
  },
  {
    title: 'Impact',
    description:
      'We measure our success by the positive impact we create for our users and the world.',
    icon: Heart,
  },
];

const milestones = [
  {
    year: '2020',
    title: 'Company Founded',
    description: 'Started with a vision to democratize SaaS development',
  },
  {
    year: '2021',
    title: 'First Product Launch',
    description: 'Released our first SaaS template with 1,000+ downloads',
  },
  {
    year: '2022',
    title: 'Series A Funding',
    description: 'Raised $5M to accelerate product development',
  },
  {
    year: '2023',
    title: '10,000+ Users',
    description: 'Reached a major milestone with 10,000+ active users',
  },
  {
    year: '2024',
    title: 'Global Expansion',
    description: 'Expanded to serve customers in 50+ countries',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            About Us
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Building the Future of SaaS</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We&apos;re a team of passionate developers, designers, and entrepreneurs dedicated to
            making SaaS development accessible to everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-muted/50 rounded-lg p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                To democratize SaaS development by providing high-quality, production-ready
                templates and tools that enable developers to build amazing applications faster than
                ever before.
              </p>
              <p className="text-muted-foreground">
                We believe that great software should be accessible to everyone, regardless of their
                budget or technical expertise. That&apos;s why we&apos;ve created comprehensive
                templates that include everything you need to launch a successful SaaS business.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">What We Do</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Create production-ready SaaS templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Provide comprehensive documentation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Offer ongoing support and updates</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Build a thriving developer community</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{value.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center">
                <CardHeader>
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/20 rounded-full" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <Card>
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-2">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-primary rounded-full border-4 border-background relative z-10" />
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-muted/50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">By the Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building amazing SaaS applications with our
            templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Get Started Free</Button>
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
