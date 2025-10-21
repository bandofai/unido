/**
 * MCP Client Types
 * Types for MCP widget client integration
 */

/**
 * Widget information from MCP resources
 */
export interface WidgetInfo {
  /**
   * Widget type (e.g., 'weather-card')
   */
  type: string;

  /**
   * Widget display title
   */
  title: string;

  /**
   * Widget description
   */
  description?: string;

  /**
   * MCP resource URI (e.g., 'ui://widget/weather-card.html')
   */
  uri: string;

  /**
   * MIME type of the resource
   */
  mimeType?: string;
}

/**
 * Tool call result from MCP
 */
export interface ToolCallResult {
  /**
   * Tool execution result data
   */
  result: unknown;

  /**
   * Whether the tool call was successful
   */
  isError?: boolean;
}

/**
 * MCP client connection state
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Logger function for MCP client
 */
export type LoggerFunction = (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown) => void;

/**
 * MCP client options
 */
export interface McpClientOptions {
  /**
   * Server URL (e.g., 'http://localhost:3000')
   */
  serverUrl: string;

  /**
   * Connection timeout in milliseconds
   * @default 10000
   */
  timeout?: number;

  /**
   * Enable auto-reconnect on connection loss
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Maximum number of reconnection attempts
   * @default 3
   */
  maxReconnectAttempts?: number;

  /**
   * Reconnection delay in milliseconds
   * @default 1000
   */
  reconnectDelay?: number;

  /**
   * Enable debug logging
   * @default false
   * @deprecated Use logger callback instead
   */
  debug?: boolean;

  /**
   * Custom logger function
   * If provided, replaces console.log/console.error
   * @default undefined
   */
  logger?: LoggerFunction;
}
