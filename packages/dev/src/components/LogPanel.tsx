/**
 * Log Panel Component
 *
 * Displays logs with filtering and clearing functionality.
 */

import React, { useState } from 'react';

/**
 * Log entry type
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
}

/**
 * Props for LogPanel component
 */
export interface LogPanelProps {
  /**
   * Log entries to display
   */
  logs: LogEntry[];

  /**
   * Callback when logs should be cleared
   */
  onClear?: () => void;

  /**
   * Maximum number of logs to display
   * @default 100
   */
  maxLogs?: number;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * CSS class name
   */
  className?: string;
}

/**
 * Log level colors and icons
 */
const LOG_CONFIG: Record<LogEntry['level'], { color: string; bg: string; icon: string }> = {
  debug: { color: '#64748b', bg: '#f8fafc', icon: '🔍' },
  info: { color: '#3b82f6', bg: '#eff6ff', icon: 'ℹ️' },
  warn: { color: '#f59e0b', bg: '#fffbeb', icon: '⚠️' },
  error: { color: '#ef4444', bg: '#fef2f2', icon: '❌' },
};

/**
 * Log Panel Component
 *
 * Displays logs with filtering by level and clearing functionality.
 *
 * @example
 * ```tsx
 * const [logs, setLogs] = useState<LogEntry[]>([]);
 *
 * <LogPanel
 *   logs={logs}
 *   onClear={() => setLogs([])}
 *   maxLogs={100}
 * />
 * ```
 */
export const LogPanel: React.FC<LogPanelProps> = ({
  logs,
  onClear,
  maxLogs = 100,
  style,
  className,
}) => {
  const [filterLevel, setFilterLevel] = useState<LogEntry['level'] | 'all'>('all');

  // Filter and limit logs
  const filteredLogs = logs
    .filter(log => filterLevel === 'all' || log.level === filterLevel)
    .slice(-maxLogs);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Logs ({filteredLogs.length})
        </h3>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as typeof filterLevel)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="all">All Levels</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Clear Button */}
          <button
            onClick={onClear}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        {filteredLogs.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log) => {
            const config = LOG_CONFIG[log.level];
            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '8px',
                  marginBottom: '4px',
                  borderRadius: '4px',
                  backgroundColor: config.bg,
                  borderLeft: `3px solid ${config.color}`,
                }}
              >
                {/* Icon & Timestamp */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: '120px' }}>
                  <span>{config.icon}</span>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>
                    {formatTime(log.timestamp)}
                  </span>
                </div>

                {/* Message */}
                <div style={{ flex: 1, color: config.color }}>
                  {log.message}
                  {log.data !== undefined && (
                    <pre
                      style={{
                        marginTop: '4px',
                        padding: '4px',
                        backgroundColor: '#ffffff',
                        borderRadius: '2px',
                        fontSize: '11px',
                        overflow: 'auto',
                      }}
                    >
                      {typeof log.data === 'string'
                        ? log.data
                        : JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
