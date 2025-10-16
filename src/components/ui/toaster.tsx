'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

export function ToasterComponent() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Toaster theme="light" />;
  }

  const currentTheme = resolvedTheme as 'light' | 'dark' | 'system';

  return <Toaster theme={currentTheme} />;
}
