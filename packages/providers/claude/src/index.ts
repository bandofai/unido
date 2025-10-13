/**
 * Claude Provider for Unido
 * Anthropic Claude Desktop integration via MCP stdio transport
 */

import { ClaudeAdapter } from '@unido/provider-claude/adapter.js';

export { ClaudeAdapter, createClaudeAdapter } from '@unido/provider-claude/adapter.js';
export { zodToJsonSchema } from '@unido/provider-claude/schema.js';

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Configuration options for Claude provider
 */
export interface ClaudeProviderOptions {
  /**
   * Enable this provider (default: true)
   */
  enabled?: boolean;

  /**
   * Additional provider-specific options
   */
  [key: string]: unknown;
}

/**
 * Claude provider configuration (returned by factory function)
 */
export interface ClaudeProviderConfig extends ClaudeProviderOptions {
  _type: 'claude';
  _factory: () => ClaudeAdapter;
  transport: 'stdio';
}

/**
 * Factory function for Claude provider configuration
 *
 * @example
 * ```typescript
 * import { createApp } from '@unido/core';
 * import { claude } from '@unido/provider-claude';
 *
 * const app = createApp({
 *   name: 'my-app',
 *   providers: {
 *     claude: claude()
 *   }
 * });
 *
 * app.tool('greet', { ... });
 * await app.listen(); // Automatically starts Claude stdio server
 * ```
 */
export function claude(options: ClaudeProviderOptions = {}): ClaudeProviderConfig {
  return {
    _type: 'claude',
    _factory: () => new ClaudeAdapter(),
    enabled: options.enabled ?? true,
    transport: 'stdio',
    ...options,
  };
}
