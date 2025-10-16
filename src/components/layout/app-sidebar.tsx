'use client';

import * as React from 'react';
import {
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconChartBar,
  IconFolder,
  IconUsers,
  IconReportAnalytics,
} from '@tabler/icons-react';
import { NavMain } from '@/components/layout/nav-main';
import { NavSecondary } from '@/components/layout/nav-secondary';
import { NavUser } from '@/components/layout/nav-user';
import { User } from '@/types/user.types';
import { appConfig } from '@/config/app';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: IconChartBar,
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: IconFolder,
    },
    {
      title: 'Team',
      url: '/team',
      icon: IconUsers,
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: IconReportAnalytics,
    },
  ],
  navSecondary: [
    {
      title: 'Get Help',
      url: '/help',
      icon: IconHelp,
    },
    {
      title: 'Search',
      url: '/search',
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User | null;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{appConfig.app.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && user.email && (
          <NavUser
            user={{
              name: user.profile.full_name || user.email,
              email: user.email,
              avatar: user.profile.avatar_url || undefined,
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
