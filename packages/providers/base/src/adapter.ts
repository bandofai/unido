/**
 * Provider adapter interface
 * Defines the contract that all provider adapters must implement
 */

import type {
  ComponentReference,
  ProviderCapabilities,
  ProviderName,
  ServerConfig,
  ToolContext,
  UniversalResponse,
  UniversalTool,
} from '@unido/core';
import type { z } from 'zod';

// ============================================================================
// Provider Schema Types
// ============================================================================

/**
 * Generic provider schema type
 * Each provider converts from Zod to their own format
 */
export type ProviderSchema = Record<string, unknown>;

/**
 * Provider-specific tool metadata
 */
export type ProviderToolMetadata = Record<string, unknown>;

/**
 * Provider-specific response format
 */
export type ProviderResponse = unknown;

// ============================================================================
// Provider Server Interface
// ============================================================================

export interface ProviderServer {
  /**
   * Provider name
   */
  provider: ProviderName;

  /**
   * Start the server
   */
  start(): Promise<void>;

  /**
   * Stop the server
   */
  stop(): Promise<void>;

  /**
   * Reload the server (for hot reload)
   */
  reload?(): Promise<void>;

  /**
   * Get server info (port, transport, etc.)
   */
  getInfo(): ProviderServerInfo;
}

export interface ProviderServerInfo {
  provider: ProviderName;
  transport: 'http' | 'sse' | 'stdio' | 'websocket';
  port?: number;
  url?: string;
  status: 'starting' | 'running' | 'stopped' | 'error';
}

// ============================================================================
// Provider Adapter Interface
// ============================================================================

/**
 * Base provider adapter interface
 * All provider adapters must implement this interface
 */
export interface ProviderAdapter {
  /**
   * Provider name (e.g., 'openai', 'claude', 'gemini')
   */
  readonly name: ProviderName;

  /**
   * Provider capabilities
   */
  readonly capabilities: ProviderCapabilities;

  /**
   * Initialize the adapter with server configuration
   */
  initialize(config: ServerConfig): Promise<void>;

  /**
   * Convert Zod schema to provider-specific format
   *
   * @param zodSchema - Zod schema to convert
   * @returns Provider-specific schema (e.g., JSON Schema for MCP)
   */
  convertSchema(zodSchema: z.ZodType): ProviderSchema;

  /**
   * Convert universal tool to provider-specific tool definition
   *
   * @param tool - Universal tool definition
   * @returns Provider-specific tool definition
   */
  convertTool(tool: UniversalTool): ProviderToolDefinition;

  /**
   * Convert universal response to provider-specific format
   *
   * @param response - Universal response
   * @param tool - Original tool (for metadata)
   * @returns Provider-specific response
   */
  convertResponse(response: UniversalResponse, tool?: UniversalTool): ProviderResponse;

  /**
   * Convert component reference to provider-specific format
   *
   * @param component - Component reference
   * @returns Provider-specific component metadata
   */
  convertComponent?(component: ComponentReference): unknown;

  /**
   * Handle tool invocation
   *
   * @param tool - Universal tool
   * @param input - Raw input from provider
   * @param context - Tool execution context
   * @returns Provider-formatted response
   */
  handleToolCall(
    tool: UniversalTool,
    input: unknown,
    context: ToolContext
  ): Promise<ProviderResponse>;

  /**
   * Start provider server
   *
   * @returns Provider server instance
   */
  startServer(): Promise<ProviderServer>;

  /**
   * Stop provider server
   */
  stopServer(): Promise<void>;

  /**
   * Get component template for provider
   * (Optional - only for providers supporting components)
   */
  getComponentTemplate?(componentType: string, props: Record<string, unknown>): string | undefined;

  /**
   * Cleanup resources
   */
  cleanup?(): Promise<void>;
}

// ============================================================================
// Provider Tool Definition
// ============================================================================

/**
 * Provider-specific tool definition
 * This is what gets registered with the provider's SDK
 */
export interface ProviderToolDefinition {
  /**
   * Tool name
   */
  name: string;

  /**
   * Tool title (human-readable)
   */
  title?: string;

  /**
   * Tool description
   */
  description: string;

  /**
   * Provider-specific input schema
   */
  inputSchema: ProviderSchema;

  /**
   * Provider-specific metadata
   */
  metadata?: ProviderToolMetadata;

  /**
   * Handler function (provider-specific)
   */
  handler?: (input: unknown) => Promise<ProviderResponse>;
}

// ============================================================================
// Base Adapter Class
// ============================================================================

/**
 * Abstract base adapter class
 * Provides common functionality for all adapters
 */
export abstract class BaseProviderAdapter implements ProviderAdapter {
  abstract readonly name: ProviderName;
  abstract readonly capabilities: ProviderCapabilities;

  protected config?: ServerConfig;
  protected server?: ProviderServer;

  async initialize(config: ServerConfig): Promise<void> {
    this.config = config;
  }

  abstract convertSchema(zodSchema: z.ZodType): ProviderSchema;
  abstract convertTool(tool: UniversalTool): ProviderToolDefinition;
  abstract convertResponse(response: UniversalResponse, tool?: UniversalTool): ProviderResponse;

  abstract handleToolCall(
    tool: UniversalTool,
    input: unknown,
    context: ToolContext
  ): Promise<ProviderResponse>;

  abstract startServer(): Promise<ProviderServer>;

  async stopServer(): Promise<void> {
    if (this.server) {
      await this.server.stop();
      this.server = undefined;
    }
  }

  async cleanup(): Promise<void> {
    await this.stopServer();
  }

  /**
   * Helper: Validate tool input using Zod schema
   */
  protected validateInput<T>(
    schema: z.ZodType<T>,
    input: unknown
  ): { success: true; data: T } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(input);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error };
  }
}
