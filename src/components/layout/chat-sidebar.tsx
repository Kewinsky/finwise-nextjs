'use client';

import * as React from 'react';
import { useState } from 'react';
import { IconMessageCircle } from '@tabler/icons-react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Sparkles } from 'lucide-react';
import { ChatInterface } from '@/components/assistant/chat-interface';
import { InsightsGenerator } from '@/components/assistant/insights-generator';
import { useChatSidebar } from './chat-sidebar-provider';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const CHAT_SIDEBAR_WIDTH = 'calc(var(--spacing) * 80)';
const CHAT_SIDEBAR_WIDTH_MOBILE = '18rem';

export function ChatSidebar() {
  const [activeTab, setActiveTab] = useState<'chat' | 'insights'>('chat');
  const { isMobile, isOpen, openMobile, setOpenMobile } = useChatSidebar();

  const state = isOpen ? 'expanded' : 'collapsed';

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="chat-sidebar"
          data-slot="chat-sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--chat-sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              '--chat-sidebar-width': CHAT_SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side="right"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>AI Assistant</SheetTitle>
            <SheetDescription>AI Chat Assistant Sidebar</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                    <div className="flex items-center gap-2">
                      <IconMessageCircle className="!size-5" />
                      <span className="text-base font-semibold">AI Assistant</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="flex-1 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'chat' | 'insights')}
                className="h-full flex flex-col"
              >
                <div className="px-2 pt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Insights
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="chat"
                  className="flex-1 m-0 mt-0 data-[state=active]:flex overflow-hidden"
                >
                  <div className="flex-1 flex flex-col min-h-0 h-full">
                    <ChatInterface />
                  </div>
                </TabsContent>

                <TabsContent
                  value="insights"
                  className="flex-1 m-0 mt-0 p-2 overflow-y-auto data-[state=active]:block"
                >
                  <InsightsGenerator />
                </TabsContent>
              </Tabs>
            </SidebarContent>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? 'offcanvas' : ''}
      data-variant="inset"
      data-side="right"
      data-slot="chat-sidebar"
    >
      {/* This is what handles the sidebar gap on desktop - creates space for fixed sidebar */}
      <div
        data-slot="chat-sidebar-gap"
        className={cn(
          'relative hidden md:block w-[var(--chat-sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear flex-shrink-0',
          'group-data-[collapsible=offcanvas]:w-0',
        )}
        style={
          {
            '--chat-sidebar-width': CHAT_SIDEBAR_WIDTH,
          } as React.CSSProperties
        }
      />
      <div
        data-slot="chat-sidebar-container"
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-[var(--chat-sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex',
          'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--chat-sidebar-width)*-1)]',
          'p-2 pl-0',
        )}
        style={
          {
            '--chat-sidebar-width': CHAT_SIDEBAR_WIDTH,
          } as React.CSSProperties
        }
      >
        <div
          data-sidebar="chat-sidebar"
          data-slot="chat-sidebar-inner"
          className="bg-sidebar flex h-full w-full flex-col"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                  <div className="flex items-center gap-2">
                    <IconMessageCircle className="!size-5" />
                    <span className="text-base font-semibold">AI Assistant</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'chat' | 'insights')}
              className="h-full flex flex-col"
            >
              <div className="px-2 pt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Insights
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="chat"
                className="flex-1 m-0 mt-0 data-[state=active]:flex overflow-hidden"
              >
                <div className="flex-1 flex flex-col min-h-0 h-full">
                  <ChatInterface />
                </div>
              </TabsContent>

              <TabsContent
                value="insights"
                className="flex-1 m-0 mt-0 p-2 overflow-y-auto data-[state=active]:block"
              >
                <InsightsGenerator />
              </TabsContent>
            </Tabs>
          </SidebarContent>
        </div>
      </div>
    </div>
  );
}
