/**
 * Universal List component
 * Displays a list of items with optional actions
 */

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

export function List({ items, className = '', onItemClick, emptyMessage = 'No items to display' }: ListProps) {
  if (items.length === 0) {
    return (
      <div
        className={`unido-list-empty ${className}`}
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          fontStyle: 'italic',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`unido-list ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="unido-list-item"
          onClick={() => onItemClick?.(item)}
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            cursor: onItemClick ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (onItemClick) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {item.icon && (
              <div
                className="unido-list-item-icon"
                style={{
                  fontSize: '1.5rem',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="unido-list-item-title"
                style={{
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: item.description ? '0.25rem' : 0,
                }}
              >
                {item.title}
              </div>
              {item.description && (
                <div
                  className="unido-list-item-description"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
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
