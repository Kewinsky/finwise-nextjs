import { Spinner } from '@/components/ui/spinner';

/**
 * Reusable loading spinner component that uses the existing Spinner component
 * Provides consistent loading states across the application
 */
export function LoadingSpinner({
  size = 'default',
  variant = 'default',
  message = 'Loading...',
  className = '',
  inline = false,
}: {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'circle' | 'pinwheel' | 'ellipsis' | 'ring' | 'bars' | 'infinite';
  message?: string;
  className?: string;
  inline?: boolean;
}) {
  const sizeMap = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  // For inline usage (buttons, etc.) - horizontal layout
  if (inline) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Spinner variant={variant} className={sizeMap[size]} />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  // For page-level usage - vertical layout with padding
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Spinner variant={variant} className={sizeMap[size]} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
