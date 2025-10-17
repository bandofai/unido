import * as React from 'react';
import { cn } from '../../lib/utils.js';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of skeleton lines to display
   * @default 3
   */
  lines?: number;

  /**
   * Optional loading message
   */
  message?: string;
}

/**
 * Loading skeleton component for placeholder content
 *
 * @example
 * ```tsx
 * <LoadingSkeleton />
 * <LoadingSkeleton lines={5} message="Loading data..." />
 * ```
 */
const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, lines = 3, message, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-3 p-6', className)}
      role="status"
      aria-label={message || 'Loading'}
      {...props}
    >
      {message && <p className="text-sm text-muted-foreground mb-4">{message}</p>}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 rounded bg-muted animate-pulse',
              // Vary the width for a more natural look
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
);
LoadingSkeleton.displayName = 'LoadingSkeleton';

export { LoadingSkeleton };
