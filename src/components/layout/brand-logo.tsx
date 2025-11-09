import Link from 'next/link';
import { IconInnerShadowTop } from '@tabler/icons-react';
import { appConfig } from '@/config/app';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  brandName?: string;
  href?: string | null;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showIcon?: boolean;
  asChild?: boolean;
}

export function BrandLogo({
  brandName = appConfig.app.name,
  href = '/',
  className,
  iconClassName,
  textClassName,
  showIcon = true,
  asChild = false,
}: BrandLogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <IconInnerShadowTop
          className={cn(
            'size-6 text-blue-600 transition-transform duration-300 hover:scale-110',
            iconClassName,
          )}
        />
      )}
      <span
        className={cn(
          'font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
          textClassName,
        )}
      >
        {brandName}
      </span>
    </div>
  );

  // If asChild is true, return content without wrapper (for use with asChild prop)
  if (asChild) {
    return content;
  }

  // If href is null, return content without link
  if (href === null) {
    return content;
  }

  // Otherwise wrap in Link
  return <Link href={href}>{content}</Link>;
}
