/**
 * MCP Status Component
 *
 * Displays MCP connection status with visual indicators and reconnect functionality.
 */

import React, { useEffect, useState } from 'react';
import type { McpWidgetClient } from '../mcp-client.js';
import type { ConnectionState } from '../types/mcp-types.js';

/**
 * Props for McpStatus component
 */
export interface McpStatusProps {
  /**
   * MCP client instance
   */
  client: McpWidgetClient;

  /**
   * Callback when reconnect is requested
   */
  onReconnect?: () => void | Promise<void>;

  /**
   * Show detailed connection info
   * @default false
   */
  showDetails?: boolean;

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
 * Status color and icon mapping
 */
const STATUS_CONFIG: Record<ConnectionState, { color: string; icon: string; label: string }> = {
  connected: { color: '#22c55e', icon: '🟢', label: 'Connected' },
  connecting: { color: '#eab308', icon: '🟡', label: 'Connecting...' },
  disconnected: { color: '#ef4444', icon: '🔴', label: 'Disconnected' },
  error: { color: '#f97316', icon: '⚠️', label: 'Error' },
};

/**
 * MCP Status Component
 *
 * Shows current MCP connection status with visual indicator
 * and provides reconnect functionality.
 *
 * @example
 * ```tsx
 * <McpStatus
 *   client={mcpClient}
 *   onReconnect={async () => {
 *     await mcpClient.connect();
 *   }}
 *   showDetails
 * />
 * ```
 */
export const McpStatus: React.FC<McpStatusProps> = ({
  client,
  onReconnect,
  showDetails = false,
  style,
  className,
}) => {
  const [status, setStatus] = useState<ConnectionState>(client.getConnectionState());
  const [reconnecting, setReconnecting] = useState(false);

  // Poll connection state
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(client.getConnectionState());
    }, 500);

    return () => clearInterval(interval);
  }, [client]);

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;

  const handleReconnect = async () => {
    if (reconnecting) return;

    setReconnecting(true);
    try {
      await onReconnect?.();
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '6px',
        border: `1px solid ${config.color}33`,
        backgroundColor: `${config.color}11`,
        fontSize: '14px',
        ...style,
      }}
    >
      {/* Status Indicator */}
      <span style={{ fontSize: '16px' }}>{config.icon}</span>

      {/* Status Label */}
      <span style={{ fontWeight: 500, color: config.color }}>
        {config.label}
      </span>

      {/* Reconnect Button */}
      {(status === 'disconnected' || status === 'error') && onReconnect && (
        <button
          onClick={handleReconnect}
          disabled={reconnecting}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: config.color,
            color: 'white',
            cursor: reconnecting ? 'not-allowed' : 'pointer',
            opacity: reconnecting ? 0.6 : 1,
          }}
        >
          {reconnecting ? 'Reconnecting...' : 'Reconnect'}
        </button>
      )}

      {/* Details */}
      {showDetails && status === 'connected' && (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          MCP Ready
        </span>
      )}
    </div>
  );
};
