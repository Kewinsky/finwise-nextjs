'use client';

import { useSettings } from '@/contexts/settings-context';
import { fontConfig, type FontKey } from '@/lib/fonts';

/**
 * FontWrapper component that applies both font family and font size to protected pages only
 *
 * This component:
 * - Reads the user's font family and font size preferences from the settings context
 * - Applies the appropriate CSS classes to a container element
 * - Only affects protected pages (dashboard, settings, etc.)
 * - Combines font family and font size functionality in one wrapper
 */
interface FontWrapperProps {
  children: React.ReactNode;
}

export function FontWrapper({ children }: FontWrapperProps) {
  const { systemFont, fontSize, isLoading } = useSettings();

  // Don't render until settings are loaded to prevent hydration mismatch
  if (isLoading) {
    return <div className="font-system font-size-medium">{children}</div>;
  }

  // Get the font class name from the font configuration
  const fontConfigEntry = fontConfig[systemFont as FontKey];
  const fontClassName = fontConfigEntry?.className || fontConfig.system.className;

  // Get the font size class name
  const fontSizeClassName =
    fontSize && ['small', 'medium', 'large'].includes(fontSize)
      ? `font-size-${fontSize}`
      : 'font-size-medium';

  // Combine both classes
  const combinedClassName = `${fontClassName} ${fontSizeClassName}`;

  return <div className={combinedClassName}>{children}</div>;
}
