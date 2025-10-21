/**
 * MCP Widget Client
 *
 * Client for loading widgets from an MCP server, mimicking ChatGPT's behavior.
 * Uses the Model Context Protocol to fetch widget HTML and execute tool calls.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type {
  ConnectionState,
  McpClientOptions,
  ToolCallResult,
  WidgetInfo,
} from './types/mcp-types.js';

/**
 * Default client options
 */
const DEFAULT_OPTIONS: Required<Omit<McpClientOptions, 'serverUrl' | 'logger'>> & { logger?: McpClientOptions['logger'] } = {
  timeout: 10000,
  autoReconnect: true,
  maxReconnectAttempts: 3,
  reconnectDelay: 1000,
  debug: false,
  logger: undefined,
};

/**
 * MCP Widget Client
 *
 * Connects to an MCP server and provides methods to:
 * - List available widgets
 * - Load widget HTML
 * - Execute tool calls
 *
 * @example
 * ```typescript
 * const client = new McpWidgetClient({
 *   serverUrl: 'http://localhost:3000'
 * });
 *
 * await client.connect();
 * const widgets = await client.listWidgets();
 * const html = await client.loadWidget('weather-card');
 * const result = await client.callTool('get_weather', { city: 'Portland' });
 * await client.disconnect();
 * ```
 */
export class McpWidgetClient {
  private client: Client;
  private transport?: SSEClientTransport;
  private options: typeof DEFAULT_OPTIONS & { serverUrl: string };
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private connectionTimeoutTimer?: NodeJS.Timeout;
  private widgetCache = new Map<string, string>();
  private isReconnecting = false;

  constructor(options: McpClientOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Initialize MCP client
    this.client = new Client(
      {
        name: 'unido-dev-client',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.log('Client initialized', { serverUrl: this.options.serverUrl });
  }

  // =========================================================================
  // Connection Management
  // =========================================================================

  /**
   * Connect to the MCP server
   *
   * @throws {Error} If connection fails
   */
  async connect(): Promise<void> {
    if (this.connectionState === 'connected') {
      this.log('Already connected');
      return;
    }

    if (this.connectionState === 'connecting') {
      this.log('Connection already in progress');
      return;
    }

    this.connectionState = 'connecting';
    this.log('Connecting to MCP server...');

    try {
      // Validate server URL
      let sseUrl: URL;
      try {
        sseUrl = new URL('/sse', this.options.serverUrl);
      } catch (urlError) {
        throw new Error(`Invalid server URL: ${this.options.serverUrl}`);
      }

      // Create SSE transport
      this.transport = new SSEClientTransport(sseUrl);

      // Set up timeout with cleanup
      const timeoutPromise = new Promise<never>((_, reject) => {
        this.connectionTimeoutTimer = setTimeout(() => {
          reject(new Error(`Connection timeout after ${this.options.timeout}ms`));
        }, this.options.timeout);
      });

      // Connect with timeout
      try {
        await Promise.race([
          this.client.connect(this.transport),
          timeoutPromise,
        ]);

        // Clear timeout on success
        if (this.connectionTimeoutTimer) {
          clearTimeout(this.connectionTimeoutTimer);
          this.connectionTimeoutTimer = undefined;
        }

        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.log('Connected successfully');
      } catch (connectError) {
        // Clear timeout on error
        if (this.connectionTimeoutTimer) {
          clearTimeout(this.connectionTimeoutTimer);
          this.connectionTimeoutTimer = undefined;
        }

        // Cleanup transport on connection failure
        if (this.transport) {
          try {
            await this.transport.close();
          } catch {
            // Ignore cleanup errors
          }
          this.transport = undefined;
        }

        throw connectError;
      }
    } catch (error) {
      this.connectionState = 'error';
      this.logError('Connection failed', error);

      // Attempt reconnect if enabled and not already reconnecting
      if (
        this.options.autoReconnect &&
        this.reconnectAttempts < this.options.maxReconnectAttempts &&
        !this.isReconnecting
      ) {
        this.scheduleReconnect();
      }

      throw error;
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    this.log('Disconnecting...');

    // Clear reconnect flag
    this.isReconnecting = false;

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    // Clear connection timeout timer
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = undefined;
    }

    // Close transport
    if (this.transport) {
      try {
        await this.transport.close();
      } catch (error) {
        this.logError('Error closing transport', error);
      }
      this.transport = undefined;
    }

    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    this.widgetCache.clear();
    this.log('Disconnected');
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    // Prevent overlapping reconnection attempts
    if (this.isReconnecting) {
      this.log('Reconnection already in progress, skipping');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectDelay * this.reconnectAttempts;

    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      // Check if we're still in a state that allows reconnection
      if (this.connectionState === 'disconnected') {
        this.log('Reconnection cancelled - client was disconnected');
        return;
      }

      this.isReconnecting = true;
      this.log('Attempting to reconnect...');

      this.connect()
        .then(() => {
          this.isReconnecting = false;
        })
        .catch((error) => {
          this.isReconnecting = false;
          this.logError('Reconnection failed', error);
        });
    }, delay);
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  // =========================================================================
  // Widget Operations
  // =========================================================================

  /**
   * List all available widgets from the MCP server
   *
   * @returns Array of widget information
   * @throws {Error} If not connected or request fails
   */
  async listWidgets(): Promise<WidgetInfo[]> {
    this.ensureConnected();
    this.log('Listing widgets...');

    try {
      // List all resources
      const response = await this.client.listResources();

      // Filter for widget resources (ui://widget/*)
      const widgets: WidgetInfo[] = [];

      for (const resource of response.resources) {
        if (resource.uri.startsWith('ui://widget/')) {
          // Extract widget type from URI: ui://widget/weather-card.html -> weather-card
          const match = resource.uri.match(/^ui:\/\/widget\/(.+)\.html$/);
          if (match && match[1]) {
            const type = match[1];
            widgets.push({
              type,
              title: resource.name || type,
              description: resource.description,
              uri: resource.uri,
              mimeType: resource.mimeType,
            });
          }
        }
      }

      this.log(`Found ${widgets.length} widgets`, { widgets: widgets.map(w => w.type) });
      return widgets;
    } catch (error) {
      this.logError('Failed to list widgets', error);
      throw new Error(`Failed to list widgets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load widget HTML from the MCP server
   *
   * @param type - Widget type (e.g., 'weather-card')
   * @param useCache - Whether to use cached HTML if available
   * @returns Widget HTML content
   * @throws {Error} If not connected, widget not found, or request fails
   */
  async loadWidget(type: string, useCache = true): Promise<string> {
    this.ensureConnected();

    // Check cache first
    if (useCache && this.widgetCache.has(type)) {
      this.log(`Loading widget from cache: ${type}`);
      return this.widgetCache.get(type)!;
    }

    this.log(`Loading widget: ${type}`);

    try {
      // Construct resource URI
      const uri = `ui://widget/${type}.html`;

      // Read resource
      const response = await this.client.readResource({ uri });

      // Extract HTML content
      if (!response.contents || response.contents.length === 0) {
        throw new Error(`No content returned for widget: ${type}`);
      }

      const content = response.contents[0];
      if (!content) {
        throw new Error(`Invalid content for widget: ${type}`);
      }

      // Handle text content
      let html: string;
      if ('text' in content && typeof content.text === 'string') {
        html = content.text;
      } else if ('blob' in content && typeof content.blob === 'string') {
        // Handle blob content (base64 encoded)
        html = Buffer.from(content.blob, 'base64').toString('utf-8');
      } else {
        throw new Error(`Unsupported content type for widget: ${type}`);
      }

      // Cache the HTML
      this.widgetCache.set(type, html);

      this.log(`Widget loaded successfully: ${type} (${html.length} bytes)`);
      return html;
    } catch (error) {
      this.logError(`Failed to load widget: ${type}`, error);
      throw new Error(`Failed to load widget "${type}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear the widget cache
   *
   * @param type - Optional widget type to clear, or undefined to clear all
   */
  clearCache(type?: string): void {
    if (type) {
      this.widgetCache.delete(type);
      this.log(`Cache cleared for widget: ${type}`);
    } else {
      this.widgetCache.clear();
      this.log('Widget cache cleared');
    }
  }

  // =========================================================================
  // Tool Operations
  // =========================================================================

  /**
   * Execute a tool call on the MCP server
   *
   * @param name - Tool name
   * @param args - Tool arguments
   * @returns Tool execution result
   * @throws {Error} If not connected or tool call fails
   */
  async callTool(name: string, args: unknown): Promise<ToolCallResult> {
    this.ensureConnected();
    this.log(`Calling tool: ${name}`, { args });

    try {
      // Call tool
      const response = await this.client.callTool({
        name,
        arguments: args as Record<string, unknown> | undefined,
      });

      // Check for errors
      if (response.isError) {
        this.logError(`Tool call failed: ${name}`, response.content);
        return {
          result: response.content,
          isError: true,
        };
      }

      // Extract result from content
      let result: unknown = response.content;

      // If content is an array, extract the first item
      if (Array.isArray(response.content) && response.content.length > 0) {
        const firstContent = response.content[0];
        if (firstContent && 'text' in firstContent) {
          try {
            // Try to parse JSON
            result = JSON.parse(firstContent.text);
          } catch {
            // Not JSON, use as-is
            result = firstContent.text;
          }
        }
      }

      this.log(`Tool call succeeded: ${name}`, { result });
      return {
        result,
        isError: false,
      };
    } catch (error) {
      this.logError(`Tool call failed: ${name}`, error);
      throw new Error(`Tool call "${name}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  /**
   * Ensure client is connected
   *
   * @throws {Error} If not connected
   */
  private ensureConnected(): void {
    if (!this.isConnected()) {
      throw new Error('Client is not connected. Call connect() first.');
    }
  }

  /**
   * Log debug message
   */
  private log(message: string, data?: unknown): void {
    if (this.options.logger) {
      this.options.logger('debug', message, data);
    } else if (this.options.debug) {
      console.log(`[McpWidgetClient] ${message}`, data ?? '');
    }
  }

  /**
   * Log error message
   */
  private logError(message: string, error: unknown): void {
    if (this.options.logger) {
      this.options.logger('error', message, error);
    } else if (this.options.debug) {
      console.error(`[McpWidgetClient] ${message}`, error);
    }
  }
}
