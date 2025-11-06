import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireAuth } from '@/lib/actions/auth-actions';
import { FontWrapper } from '@/components/layout/font-wrapper';
import { SiteHeader } from '@/components/layout/site-header';
import { getFinancialSummary } from '@/lib/actions/finance-actions';
import { ChatSidebar } from '@/components/layout/chat-sidebar';
import { ChatSidebarProvider } from '@/components/layout/chat-sidebar-provider';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // This will redirect to /login if user is not authenticated
  const user = await requireAuth();

  // Fetch financial summary for header display
  const financialSummaryResult = await getFinancialSummary();
  const financialSummary = financialSummaryResult.success ? financialSummaryResult.data : undefined;

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
            <SiteHeader
              userFullName={user.profile.full_name || ''}
              financialSummary={financialSummary}
            />
            <div className="flex-1">{children}</div>
          </SidebarInset>
          <ChatSidebar />
        </SidebarProvider>
      </ChatSidebarProvider>
    </FontWrapper>
  );
}
