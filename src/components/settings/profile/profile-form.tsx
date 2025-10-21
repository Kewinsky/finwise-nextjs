'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/form-error';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { profileSchema, type ProfileFormData } from '@/validation/profile';

interface ProfileFormProps {
  initialData?: ProfileFormData;
  isLoading?: boolean;
  onSubmit?: (data: ProfileFormData) => void;
  user?: {
    email?: string;
    created_at?: string;
    profile?: {
      full_name: string | null;
      avatar_url: string | null;
    };
  } | null;
}

export function ProfileForm({ initialData, isLoading = false, onSubmit, user }: ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const handleSubmit = (data: ProfileFormData) => {
    onSubmit?.(data);
  };

  const generateInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (name?: string, email?: string) => {
    return name || email?.split('@')[0] || 'User';
  };

  return (
    <div className="space-y-6">
      {/* Profile Avatar & Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details and profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {generateInitials(user?.profile?.full_name || undefined, user?.email)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {getDisplayName(user?.profile?.full_name || undefined, user?.email)}
              </h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                Member since{' '}
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Full Name */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </Label>
              <p className="text-sm text-muted-foreground">
                Your display name as it appears to others
              </p>
            </div>
            <div className="w-full sm:w-64 space-y-2">
              <Input
                id="fullName"
                placeholder="John Doe"
                {...form.register('fullName')}
                disabled={isLoading}
              />
              <FormError message={form.formState.errors.fullName?.message} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} onClick={form.handleSubmit(handleSubmit)}>
              {isLoading ? <LoadingSpinner message="Saving..." inline /> : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
