'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const CHAT_SIDEBAR_STORAGE_KEY = 'ai_chat_sidebar_state';

// Context for chat sidebar state (separate from main sidebar)
type ChatSidebarContextProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
};

const ChatSidebarContext = React.createContext<ChatSidebarContextProps | null>(null);

export function useChatSidebar() {
  const context = React.useContext(ChatSidebarContext);
  if (!context) {
    // Return safe defaults if not wrapped (for pages without chat sidebar)
    return {
      isOpen: false,
      setIsOpen: () => {},
      isMobile: false,
      openMobile: false,
      setOpenMobile: () => {},
    };
  }
  return context;
}

interface ChatSidebarProviderProps {
  children: React.ReactNode;
}

export function ChatSidebarProvider({ children }: ChatSidebarProviderProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);

  // Load state from localStorage on mount
  React.useEffect(() => {
    const savedState = localStorage.getItem(CHAT_SIDEBAR_STORAGE_KEY);
    if (savedState === 'true') {
      setIsOpen(true);
    }
  }, []);

  // Save state to localStorage when it changes
  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open);
    localStorage.setItem(CHAT_SIDEBAR_STORAGE_KEY, open.toString());
  }, []);

  const contextValue = React.useMemo<ChatSidebarContextProps>(
    () => ({
      isOpen,
      setIsOpen: handleOpenChange,
      isMobile,
      openMobile,
      setOpenMobile,
    }),
    [isOpen, handleOpenChange, isMobile, openMobile],
  );

  return <ChatSidebarContext.Provider value={contextValue}>{children}</ChatSidebarContext.Provider>;
}
