'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/form-error';
import { Mail, Phone, MapPin, Clock, MessageSquare, Headphones } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { contactFormSchema, type ContactFormData } from '@/schemas/auth';
import { appConfig } from '@/config/app';

const contactMethods = [
  {
    title: 'Email Support',
    description: 'Get help with technical questions and account issues',
    contact: appConfig.contact.supportEmail,
    icon: Mail,
    responseTime: 'Within 24 hours',
  },
  {
    title: 'Phone Support',
    description: 'Speak directly with our support team',
    contact: appConfig.contact.phone,
    icon: Phone,
    responseTime: 'Mon-Fri, 9AM-6PM PST',
  },
  {
    title: 'Live Chat',
    description: 'Chat with us in real-time for immediate assistance',
    contact: 'Available on our website',
    icon: MessageSquare,
    responseTime: 'Instant response',
  },
  {
    title: 'Sales Inquiries',
    description: 'Questions about pricing, features, or enterprise plans',
    contact: appConfig.contact.salesEmail,
    icon: Headphones,
    responseTime: 'Within 4 hours',
  },
];

const officeLocations = [
  {
    city: 'San Francisco',
    address: '123 Market Street, Suite 100',
    zipCode: 'San Francisco, CA 94105',
    phone: '+1 (555) 123-4567',
    hours: 'Mon-Fri, 9AM-6PM PST',
  },
  {
    city: 'New York',
    address: '456 Broadway, Floor 15',
    zipCode: 'New York, NY 10013',
    phone: '+1 (555) 987-6543',
    hours: 'Mon-Fri, 9AM-6PM EST',
  },
  {
    city: 'London',
    address: '789 Oxford Street, Level 5',
    zipCode: 'London W1C 1JN, UK',
    phone: '+44 20 7946 0958',
    hours: 'Mon-Fri, 9AM-6PM GMT',
  },
];

const faqs = [
  {
    question: 'How quickly do you respond to support requests?',
    answer:
      'We typically respond to support requests within 24 hours. For urgent issues, please use our live chat or phone support.',
  },
  {
    question: 'Do you offer phone support?',
    answer:
      'Yes, we offer phone support Monday through Friday, 9AM to 6PM PST. You can reach us at +1 (555) 123-4567.',
  },
  {
    question: 'Can I schedule a demo?',
    answer: `Absolutely! Contact our sales team at ${appConfig.contact.salesEmail} to schedule a personalized demo of our platform.`,
  },
  {
    question: 'Do you have an API?',
    answer:
      'Yes, we have a comprehensive REST API. Check out our API documentation for details and examples.',
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement form submission logic
      notifySuccess('Message sent successfully!', {
        description: "We'll get back to you within 24 hours.",
      });
      form.reset();
    } catch {
      notifyError('Failed to send message', {
        description: 'Please try again or contact us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Contact Us
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? Need support? Want to partner with us? We&apos;re here to help and would
            love to hear from you.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Card key={method.title} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{method.contact}</p>
                    <p className="text-sm text-muted-foreground">{method.responseTime}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Form and Office Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...form.register('firstName')}
                      disabled={isSubmitting}
                    />
                    <FormError message={form.formState.errors.firstName?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...form.register('lastName')}
                      disabled={isSubmitting}
                    />
                    <FormError message={form.formState.errors.lastName?.message} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...form.register('email')}
                    disabled={isSubmitting}
                  />
                  <FormError message={form.formState.errors.email?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    placeholder="Acme Corp"
                    {...form.register('company')}
                    disabled={isSubmitting}
                  />
                  <FormError message={form.formState.errors.company?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    {...form.register('subject')}
                    disabled={isSubmitting}
                  />
                  <FormError message={form.formState.errors.subject?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-[120px]"
                    {...form.register('message')}
                    disabled={isSubmitting}
                  />
                  <FormError message={form.formState.errors.message?.message} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner message="Sending..." inline /> : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Office Locations */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Offices</h2>
            <div className="space-y-6">
              {officeLocations.map((office) => (
                <Card key={office.city}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{office.city}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>{office.address}</p>
                          <p>{office.zipCode}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Phone className="w-4 h-4" />
                            {office.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {office.hours}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{faq.answer}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Immediate Help?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            For urgent technical issues or security concerns, please contact our emergency support
            line.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <Phone className="w-4 h-4 mr-2" />
              Emergency Support
            </Button>
            <Button variant="outline" size="lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
