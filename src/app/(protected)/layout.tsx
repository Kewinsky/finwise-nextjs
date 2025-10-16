import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireAuth } from '@/lib/actions/auth-actions';
import { FontWrapper } from '@/components/layout/font-wrapper';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // This will redirect to /login if user is not authenticated
  const user = await requireAuth();

  return (
    <FontWrapper>
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
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </FontWrapper>
  );
}
