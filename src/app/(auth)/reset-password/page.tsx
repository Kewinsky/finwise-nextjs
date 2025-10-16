import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/forms/reset-password-form';
import { LoadingSpinner } from '@/components/ui/custom-spinner';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
