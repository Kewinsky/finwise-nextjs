import { Suspense } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireAuth } from '@/lib/actions/auth-actions';
import { FontWrapper } from '@/components/layout/font-wrapper';
import { SiteHeader } from '@/components/layout/site-header';
import { getFinancialSummary } from '@/lib/actions/finance-actions';
import { ChatSidebar } from '@/components/layout/chat-sidebar';
import { ChatSidebarProvider } from '@/components/layout/chat-sidebar-provider';
import { Skeleton } from '@/components/ui/skeleton';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

function HeaderSkeleton() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 @lg:gap-2 px-4 @lg:px-6">
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        <div className="mx-2 h-4 w-px bg-border" />
        <Skeleton className="h-5 w-32" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </header>
  );
}

async function HeaderWithFinancialSummary({ userFullName }: { userFullName: string }) {
  // Fetch financial summary for header display
  const financialSummaryResult = await getFinancialSummary();
  const financialSummary = financialSummaryResult.success ? financialSummaryResult.data : null;

  return (
    <SiteHeader userFullName={userFullName} financialSummary={financialSummary || undefined} />
  );
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // This will redirect to /login if user is not authenticated
  const user = await requireAuth();

  return (
    <FontWrapper>
      <ChatSidebarProvider>
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 72)',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" user={user} />
          <SidebarInset>
            <Suspense fallback={<HeaderSkeleton />}>
              <HeaderWithFinancialSummary userFullName={user.profile.full_name || ''} />
            </Suspense>
            <div className="flex-1">{children}</div>
          </SidebarInset>
          <ChatSidebar />
        </SidebarProvider>
      </ChatSidebarProvider>
    </FontWrapper>
  );
}
