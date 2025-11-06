'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatSidebar } from './chat-sidebar-provider';
import { Bot } from 'lucide-react';

export function ChatSidebarTrigger({ className }: { className?: string }) {
  const { isOpen, setIsOpen, isMobile, openMobile, setOpenMobile } = useChatSidebar();

  // Don't render if sidebar is not available (not wrapped)
  if (!setIsOpen || setIsOpen.toString() === '() => {}') {
    return null;
  }

  const handleToggle = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn('size-7', className)}
      aria-label="Toggle AI Chat Sidebar"
    >
      <Bot className="h-4 w-4" />
      <span className="sr-only">Toggle AI Chat Sidebar</span>
    </Button>
  );
}
