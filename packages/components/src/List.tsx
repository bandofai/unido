/**
 * Universal List component
 * Displays a list of items with optional actions
 */

import { cn } from './lib/utils.js';

export interface ListItem {
  id: string | number;
  title: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface ListProps {
  items: ListItem[];
  className?: string;
  onItemClick?: (item: ListItem) => void;
  emptyMessage?: string;
}

export function List({
  items,
  className = '',
  onItemClick,
  emptyMessage = 'No items to display',
}: ListProps) {
  if (items.length === 0) {
    return (
      <div className={cn('p-8 text-center text-muted-foreground italic', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'py-4 px-6 border-b last:border-b-0 transition-colors',
            onItemClick && 'cursor-pointer hover:bg-muted/50'
          )}
          onClick={() => onItemClick?.(item)}
        >
          <div className="flex items-center gap-4">
            {item.icon && <div className="text-2xl flex-shrink-0">{item.icon}</div>}
            <div className="flex-1 min-w-0">
              <div className={cn('font-semibold text-foreground', item.description && 'mb-1')}>
                {item.title}
              </div>
              {item.description && (
                <div className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.description}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
