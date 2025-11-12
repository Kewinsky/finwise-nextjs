'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactUsModal } from '@/components/common/contact-us-modal';

export default function ContactPage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Open modal automatically when page loads
    setOpen(true);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Redirect to home when modal is closed
      router.push('/');
    }
  };

  return <ContactUsModal open={open} onOpenChange={handleOpenChange} />;
}
