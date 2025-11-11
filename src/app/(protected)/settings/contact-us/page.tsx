'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/ui/form-error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Mail } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { contactUsSchema, type ContactUsFormData } from '@/validation/auth';

const contactReasons = [
  'General inquiry',
  'Technical support',
  'Billing question',
  'Feature request',
  'Bug report',
  'Account issue',
  'Other',
];

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactUsFormData>({
    resolver: zodResolver(contactUsSchema),
    defaultValues: {
      reason: '',
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
    <div className="space-y-4 @md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Us
          </CardTitle>
          <CardDescription>
            Get in touch with our support team. We&apos;re here to help!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 @md:space-y-6">
            {/* Reason Field */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for contacting</Label>
              <Select
                value={form.watch('reason')}
                onValueChange={(value) => form.setValue('reason', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {contactReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={form.formState.errors.reason?.message} />
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                {...form.register('subject')}
                disabled={isSubmitting}
              />
              <FormError message={form.formState.errors.subject?.message} />
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Please provide as much detail as possible..."
                rows={6}
                {...form.register('message')}
                disabled={isSubmitting}
                className="min-h-[120px] resize-y"
              />
              <FormError message={form.formState.errors.message?.message} />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full @md:w-auto @md:min-w-[200px]"
              >
                {isSubmitting ? (
                  <LoadingSpinner message="Sending..." inline />
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
