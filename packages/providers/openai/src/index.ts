/**
 * @bandofai/unido-provider-openai
 * OpenAI ChatGPT provider adapter for Unido
 */

import { OpenAIAdapter } from '@bandofai/unido-provider-openai/adapter.js';

export { OpenAIAdapter, createOpenAIAdapter } from '@bandofai/unido-provider-openai/adapter.js';
export { zodToJsonSchema, validateMcpSchema } from '@bandofai/unido-provider-openai/schema.js';
export {
  generateResourceUri,
  createComponentResource,
  generateComponentHtml,
  createOpenAIMetadata,
  type McpResource,
  type OpenAIComponentMetadata,
} from '@bandofai/unido-provider-openai/resource.js';

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Configuration options for OpenAI provider
 */
export interface OpenAIProviderOptions {
  /**
   * Enable this provider (default: true)
   */
  enabled?: boolean;

  /**
   * Port for HTTP server (default: 3000)
   */
  port?: number;

  /**
   * Host for HTTP server (default: 'localhost')
   */
  host?: string;

  /**
   * Enable CORS (default: true)
   */
  cors?: boolean;

  /**
   * Additional provider-specific options
   */
  [key: string]: unknown;
}

/**
 * OpenAI provider configuration (returned by factory function)
 */
export interface OpenAIProviderConfig extends OpenAIProviderOptions {
  _type: 'openai';
  _factory: () => OpenAIAdapter;
  transport: 'sse';
}

/**
 * Factory function for OpenAI provider configuration
 *
 * @example
 * ```typescript
 * import { createApp } from '@bandofai/unido-core';
 * import { openAI } from '@bandofai/unido-provider-openai';
 *
 * const app = createApp({
 *   name: 'my-app',
 *   providers: {
 *     openai: openAI({ port: 3000 })
 *   }
 * });
 *
 * app.tool('greet', { ... });
 * await app.listen(); // Automatically starts OpenAI server
 * ```
 */
export function openAI(options: OpenAIProviderOptions = {}): OpenAIProviderConfig {
  return {
    _type: 'openai',
    _factory: () => new OpenAIAdapter(),
    enabled: options.enabled ?? true,
    port: options.port ?? 3000,
    host: options.host ?? 'localhost',
    cors: options.cors ?? true,
    transport: 'sse',
    ...options,
  };
}
