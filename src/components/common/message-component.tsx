'use client';

import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  RefreshCw,
  Shield,
  Server,
  Wifi,
  Clock,
  Bug,
  Home,
  ArrowLeft,
  Ban,
  FileX,
  CheckCircle2,
  XCircle,
  Mail,
  CreditCard,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export type MessageType =
  // Error types
  | 'network'
  | 'permission'
  | 'server'
  | 'timeout'
  | 'not-found'
  | 'validation'
  | 'generic'
  // Status types
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  // Specific scenarios
  | 'payment-success'
  | 'payment-failed'
  | 'email-sent'
  | 'auth-error';

export interface MessageComponentProps {
  type?: MessageType;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  children?: React.ReactNode;
  additionalActions?: React.ReactNode;
  // For error boundary support
  error?: Error & { digest?: string };
  reset?: () => void;
}

interface MessageScenario {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  showRetry: boolean;
}

const MESSAGE_SCENARIOS: Record<MessageType, MessageScenario> = {
  // Error scenarios
  network: {
    title: 'Connection Problem',
    description: 'Unable to connect to our servers. Please check your internet connection.',
    icon: Wifi,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    showRetry: true,
  },
  permission: {
    title: 'Access Denied',
    description:
      "You don't have permission to access this resource. Please sign in or contact support.",
    icon: Shield,
    iconColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    showRetry: false,
  },
  server: {
    title: 'Server Error',
    description: "We're experiencing technical difficulties. Our team has been notified.",
    icon: Server,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    showRetry: true,
  },
  timeout: {
    title: 'Request Timeout',
    description: 'The request took too long to complete. Please try again.',
    icon: Clock,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    showRetry: true,
  },
  'not-found': {
    title: 'Not Found',
    description: "The resource you're looking for doesn't exist or has been moved.",
    icon: FileX,
    iconColor: 'text-foreground dark:text-foreground',
    bgColor: 'bg-muted dark:bg-muted',
    showRetry: false,
  },
  validation: {
    title: 'Invalid Request',
    description: 'The request contains invalid data. Please check your input and try again.',
    icon: Ban,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    showRetry: false,
  },
  generic: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try refreshing the page.',
    icon: AlertTriangle,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    showRetry: true,
  },
  error: {
    title: 'Something went wrong',
    description: "We couldn't complete your request. Please try again.",
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    showRetry: true,
  },
  // Success/status scenarios
  success: {
    title: 'Success!',
    description: 'Your action was completed successfully.',
    icon: CheckCircle2,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    showRetry: false,
  },
  warning: {
    title: 'Attention Required',
    description: 'Please review the information below.',
    icon: AlertCircle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    showRetry: false,
  },
  info: {
    title: 'Information',
    description: "Here's what you need to know.",
    icon: AlertCircle,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    showRetry: false,
  },
  'payment-success': {
    title: 'Payment Successful!',
    description: 'Your payment has been processed successfully. Thank you for your purchase.',
    icon: CreditCard,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    showRetry: false,
  },
  'payment-failed': {
    title: 'Payment Failed',
    description:
      "We couldn't process your payment. Please check your payment details and try again.",
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    showRetry: false,
  },
  'email-sent': {
    title: 'Check Your Email',
    description: "We've sent you an email with further instructions.",
    icon: Mail,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    showRetry: false,
  },
  'auth-error': {
    title: 'Authentication Error',
    description:
      'There was an error with your authentication. The link may have expired or been used already.',
    icon: AlertTriangle,
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    showRetry: false,
  },
};

const detectErrorType = (error: Error): MessageType => {
  const message = error.message.toLowerCase();

  if (message.includes('404') || message.includes('not found') || message.includes('no route')) {
    return 'not-found';
  }

  if (
    message.includes('403') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('permission') ||
    message.includes('jwt') ||
    message.includes('token')
  ) {
    return 'permission';
  }

  if (
    message.includes('400') ||
    message.includes('bad request') ||
    message.includes('validation') ||
    message.includes('invalid')
  ) {
    return 'validation';
  }

  if (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('internal server error')
  ) {
    return 'server';
  }

  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('cors') ||
    message.includes('failed to fetch')
  ) {
    return 'network';
  }

  if (
    message.includes('timeout') ||
    message.includes('slow') ||
    message.includes('aborted') ||
    message.includes('request timeout')
  ) {
    return 'timeout';
  }

  return 'generic';
};

export const MessageComponent = ({
  type,
  title,
  description,
  showBackButton,
  showHomeButton,
  showRetryButton,
  children,
  additionalActions,
  error,
  reset,
}: MessageComponentProps) => {
  const pathname = usePathname();
  const router = useRouter();

  // Determine message type
  const detectedType = type || (error ? detectErrorType(error) : 'generic');
  const scenario = MESSAGE_SCENARIOS[detectedType];

  // Use custom content or fall back to scenario defaults
  const displayTitle = title || scenario.title;
  const displayDescription = description || scenario.description;
  const shouldShowRetry = showRetryButton !== undefined ? showRetryButton : scenario.showRetry;

  // Development mode check
  const isDev = process.env.NODE_ENV === 'development';

  const MessageIcon = scenario.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex size-12 items-center justify-center rounded-full ${scenario.bgColor}`}
            >
              <MessageIcon className={`size-6 ${scenario.iconColor}`} />
            </div>
            <h1 className="text-xl font-bold">{displayTitle}</h1>
            <div className="text-center text-sm text-muted-foreground">{displayDescription}</div>
          </div>

          {/* Custom children content */}
          {children}

          {/* Development-only error details */}
          {isDev && error && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                <Bug className="w-4 h-4 inline mr-1" />
                Error Details (Dev Only)
              </summary>
              <div className="mt-2 p-3 bg-muted rounded text-xs text-foreground overflow-auto max-h-32">
                <p>
                  <strong>Type:</strong> {detectedType}
                </p>
                <p>
                  <strong>Message:</strong> {error.message}
                </p>
                <p>
                  <strong>Path:</strong> {pathname}
                </p>
                {error.digest && (
                  <p>
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack Trace</summary>
                    <pre className="mt-1 text-xs overflow-auto max-h-24 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col gap-2">
            {shouldShowRetry && reset && (
              <Button onClick={reset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}

            {showBackButton && (
              <Button onClick={() => router.back()} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}

            {showHomeButton && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>
            )}

            {/* Additional custom actions */}
            {additionalActions}
          </div>
        </div>
      </div>
    </div>
  );
};

// Type guard for error props
export type MessageErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  type?: MessageType;
  showRetryButton?: boolean;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  additionalActions?: React.ReactNode;
};

// Type guard for status props
export type MessageStatusProps = {
  type: MessageType;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  children?: React.ReactNode;
  additionalActions?: React.ReactNode;
};
