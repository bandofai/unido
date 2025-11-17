import * as React from 'react';
import { cn } from '../../lib/utils.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card.js';

export interface ErrorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Error title
   * @default 'Error'
   */
  title?: string;

  /**
   * Error message (required)
   */
  message: string;

  /**
   * Error code (optional)
   */
  code?: string;

  /**
   * Retry callback (optional)
   */
  onRetry?: () => void;

  /**
   * Additional error details (optional)
   */
  details?: string;
}

/**
 * Error card component for displaying errors
 *
 * @example
 * ```tsx
 * <ErrorCard message="Failed to load data" />
 * <ErrorCard
 *   title="Network Error"
 *   message="Could not connect to server"
 *   code="ERR_NETWORK"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
const ErrorCard = React.forwardRef<HTMLDivElement, ErrorCardProps>(
  (
    { className, title = 'Error', message, code, onRetry, details, ...props },
    ref
  ) => (
    <Card ref={ref} className={cn('border-destructive', className)} {...props}>
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {title}
        </CardTitle>
        {code && (
          <CardDescription className="font-mono text-xs">{code}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{message}</p>
        {details && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              Show details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-2">
              {details}
            </pre>
          </details>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          >
            Try Again
          </button>
        )}
      </CardContent>
    </Card>
  )
);
ErrorCard.displayName = 'ErrorCard';

export { ErrorCard };
export default ErrorCard;
