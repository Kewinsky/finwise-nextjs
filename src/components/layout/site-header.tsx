'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/themes/theme-toggle';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateHeaderTitle } from '@/lib/header-utils';
import type { HeaderTitleType, FinancialSummary } from '@/types/header.types';
import { useSettings } from '@/contexts/settings-context';

interface SiteHeaderProps {
  title?: string;
  showThemeToggle?: boolean;
  showRefreshButton?: boolean;
  userFullName?: string;
  headerTitlePreference?: HeaderTitleType;
  financialSummary?: FinancialSummary;
}

export function SiteHeader({
  title,
  showThemeToggle = true,
  showRefreshButton = true,
  userFullName = '',
  financialSummary,
}: SiteHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(title || 'Dashboard');
  const router = useRouter();
  const pathname = usePathname();
  const { headerTitlePreference } = useSettings();

  // Generate dynamic title based on user preference
  useEffect(() => {
    if (title) {
      // If explicit title is provided, use it
      setDisplayTitle(title);
    } else {
      // Generate dynamic title based on preference
      const dynamicTitle = generateHeaderTitle(
        headerTitlePreference,
        userFullName,
        pathname,
        financialSummary,
      );
      setDisplayTitle(dynamicTitle);
    }
  }, [title, headerTitlePreference, userFullName, pathname, financialSummary]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the current page
      router.refresh();
      // Add a small delay to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to refresh page:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{displayTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          {showRefreshButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
              title="Refresh page"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {showThemeToggle && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}
