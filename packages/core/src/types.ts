/**
 * Core types for Unido framework
 * Based on MCP specification and provider research
 */

import type { z } from 'zod';

// ============================================================================
// Provider Names
// ============================================================================

/**
 * Known provider types with autocomplete support
 */
export type KnownProvider = 'openai';

/**
 * Custom provider names must be prefixed with 'custom:'
 */
export type CustomProvider = `custom:${string}`;

/**
 * Provider name - either a known provider or a custom one
 * This prevents typos while allowing extensibility
 */
export type ProviderName = KnownProvider | CustomProvider;

// ============================================================================
// Universal Content Types (MCP-based)
// ============================================================================

export type UniversalContentType = 'text' | 'image' | 'resource' | 'error';

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string; // base64 or URL
  mimeType?: string;
}

export interface ResourceContent {
  type: 'resource';
  resource: {
    uri: string;
    mimeType?: string;
    text?: string;
  };
}

export interface ErrorContent {
  type: 'error';
  error: {
    code: string;
    message: string;
    data?: unknown;
  };
}

export type UniversalContent = TextContent | ImageContent | ResourceContent | ErrorContent;

// ============================================================================
// Component Definitions
// ============================================================================

export interface ComponentMetadata {
  /**
   * Custom bundle configuration
   */
  bundleConfig?: Record<string, unknown>;

  /**
   * Provider-specific rendering hints
   */
  renderHints?: Record<string, unknown>;
}

export interface ComponentDefinition {
  /**
   * Component type/name (e.g., "weather-card")
   */
  type: string;

  /**
   * Human-readable title
   */
  title?: string;

  /**
   * Component description
   */
  description?: string;

  /**
   * Path to component source file (React component)
   */
  sourcePath: string;

  /**
   * Provider-specific metadata
   */
  metadata?: Partial<Record<ProviderName, ComponentMetadata>>;
}

export interface ComponentBundle {
  /**
   * Component type
   */
  type: string;

  /**
   * Bundled JavaScript code
   */
  code: string;

  /**
   * Bundle URL (when served)
   */
  url?: string;

  /**
   * Source map (optional)
   */
  sourceMap?: string;

  /**
   * Provider this bundle is for
   */
  provider: ProviderName;
}

// ============================================================================
// Component Reference
// ============================================================================

export interface ComponentReference {
  /**
   * Component type/name (e.g., "weather-card", "kanban-board")
   */
  type: string;

  /**
   * Props to pass to the component
   */
  props?: Record<string, unknown>;

  /**
   * Provider-specific metadata
   */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Tool Context
// ============================================================================

export interface ToolContext {
  /**
   * Provider that invoked the tool
   */
  provider: ProviderName;

  /**
   * User ID (if available)
   */
  userId?: string;

  /**
   * Session/conversation ID
   */
  sessionId?: string;

  /**
   * Additional provider-specific context
   */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Universal Response
// ============================================================================

export interface UniversalResponse {
  /**
   * Content to display (text, images, etc.)
   */
  content: UniversalContent[];

  /**
   * Optional component to render
   */
  component?: ComponentReference;

  /**
   * Additional metadata (provider-specific)
   */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Universal Tool Definition
// ============================================================================

export interface UniversalTool<TInput = unknown, TOutput = UniversalResponse> {
  /**
   * Unique tool identifier (machine-readable)
   */
  name: string;

  /**
   * Human-readable title
   */
  title?: string;

  /**
   * Tool description for the AI
   */
  description: string;

  /**
   * Input schema (Zod schema)
   */
  inputSchema: z.ZodType<TInput>;

  /**
   * Tool handler function
   */
  handler: ToolHandler<TInput, TOutput>;

  /**
   * Provider-specific metadata
   */
  metadata?: ProviderMetadata;
}

export type ToolHandler<TInput = unknown, TOutput = UniversalResponse> = (
  input: TInput,
  context: ToolContext
) => Promise<TOutput> | TOutput;

// ============================================================================
// Provider Metadata
// ============================================================================

export interface ProviderMetadata {
  /**
   * OpenAI-specific metadata
   */
  openai?: OpenAIMetadata;

  /**
   * Custom provider metadata
   */
  [provider: string]: unknown;
}

export interface OpenAIMetadata {
  /**
   * Output template URI (e.g., "ui://widget/weather-card.html")
   */
  outputTemplate?: string;

  /**
   * Whether the component can call tools
   */
  widgetAccessible?: boolean;

  /**
   * Additional OpenAI metadata
   */
  [key: string]: unknown;
}

// ============================================================================
// Provider Capabilities
// ============================================================================

export interface ProviderCapabilities {
  /**
   * Supports UI components/widgets
   */
  supportsComponents: boolean;

  /**
   * Supports OAuth authentication
   */
  supportsOAuth: boolean;

  /**
   * Supports file uploads
   */
  supportsFileUpload: boolean;

  /**
   * Supports streaming responses
   */
  supportsStreaming: boolean;

  /**
   * Supported transport mechanisms
   */
  transports: ('http' | 'sse' | 'stdio' | 'websocket')[];

  /**
   * MCP version supported
   */
  mcpVersion?: string;
}

// ============================================================================
// Server Configuration
// ============================================================================

export interface ServerConfig {
  /**
   * Server name
   */
  name: string;

  /**
   * Server version
   */
  version: string;

  /**
   * Registered tools
   */
  tools: UniversalTool[];

  /**
   * Registered components
   */
  components?: ComponentDefinition[];

  /**
   * Provider-specific configuration
   */
  providers?: Partial<Record<ProviderName, ProviderConfig>>;
}

export interface ProviderConfig {
  /**
   * Provider type (internal, set by factory functions)
   */
  _type?: string;

  /**
   * Factory function to create adapter (internal)
   * Using 'any' here is acceptable as it's an internal implementation detail
   */
  _factory?: () => any;

  /**
   * Enable this provider
   */
  enabled?: boolean;

  /**
   * Port for HTTP-based providers
   */
  port?: number;

  /**
   * Host for HTTP-based providers
   */
  host?: string;

  /**
   * Transport mechanism
   */
  transport?: 'http' | 'sse' | 'stdio' | 'websocket';

  /**
   * CORS enabled for HTTP providers
   */
  cors?: boolean;

  /**
   * Additional provider-specific config
   */
  [key: string]: unknown;
}

// ============================================================================
// Provider Server
// ============================================================================

export interface ProviderServerInfo {
  /**
   * Provider name
   */
  provider: string;

  /**
   * Transport mechanism
   */
  transport: string;

  /**
   * Server status
   */
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

  /**
   * Port (for HTTP-based transports)
   */
  port?: number;

  /**
   * Host (for HTTP-based transports)
   */
  host?: string;

  /**
   * Error message (if status is 'error')
   */
  error?: string;
}

export interface ProviderServer {
  /**
   * Provider name
   */
  provider: string;

  /**
   * Start the server (if not already started)
   */
  start: () => Promise<void>;

  /**
   * Stop the server
   */
  stop: () => Promise<void>;

  /**
   * Get server info
   */
  getInfo: () => ProviderServerInfo;
}
