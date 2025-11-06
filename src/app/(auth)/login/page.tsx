import { Suspense } from 'react';
import { AuthForm } from '@/components/forms/auth-form';
import { LoadingSpinner } from '@/components/ui/custom-spinner';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <AuthForm />
    </Suspense>
  );
}
