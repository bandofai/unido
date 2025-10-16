/**
 * Main Unido API
 * Provider-agnostic application builder
 */

import { ComponentRegistry } from '@bandofai/unido-core/component.js';
import type { ToolDefinition } from '@bandofai/unido-core/tool.js';
import { ToolRegistry, createTool } from '@bandofai/unido-core/tool.js';
import type { ComponentDefinition } from '@bandofai/unido-core/types.js';
import type {
  ProviderConfig,
  ProviderName,
  ProviderServer,
  ServerConfig,
  UniversalTool,
} from '@bandofai/unido-core/types.js';

/**
 * Provider adapter interface (minimal type to avoid circular dependencies)
 */
interface ProviderAdapter {
  initialize(config: ServerConfig): Promise<void>;
  startServer(): Promise<ProviderServer>;
  stopServer(): Promise<void>;
}

// ============================================================================
// App Configuration
// ============================================================================

export interface AppConfig {
  /**
   * Application name
   */
  name: string;

  /**
   * Application version
   */
  version?: string;

  /**
   * Provider configurations
   */
  providers?: Partial<Record<ProviderName, ProviderConfig>>;

  /**
   * Default provider (if not specified, all enabled providers are used)
   */
  defaultProvider?: ProviderName;
}

// ============================================================================
// Unido Class
// ============================================================================

export class Unido {
  private config: Required<AppConfig>;
  private toolRegistry: ToolRegistry;
  private componentRegistry: ComponentRegistry;
  private providerAdapters: Map<string, ProviderAdapter> = new Map();
  private runningServers: ProviderServer[] = [];
  private initialized = false;

  constructor(config: AppConfig) {
    this.config = {
      name: config.name,
      version: config.version ?? '1.0.0',
      providers: (config.providers ?? {}) as Partial<Record<ProviderName, ProviderConfig>>,
      defaultProvider: (config.defaultProvider ?? 'openai') as ProviderName,
    };

    this.toolRegistry = new ToolRegistry();
    this.componentRegistry = new ComponentRegistry();
  }

  // ==========================================================================
  // Tool Registration
  // ==========================================================================

  /**
   * Register a tool
   *
   * @example
   * ```typescript
   * app.tool('get_weather', {
   *   description: 'Get weather for a city',
   *   input: z.object({ city: z.string() }),
   *   handler: async ({ city }) => {
   *     // ...
   *   }
   * });
   * ```
   */
  tool<TInput = unknown>(name: string, definition: Omit<ToolDefinition<TInput>, 'name'>): this {
    const tool = createTool({
      name,
      ...definition,
    }) as UniversalTool;

    this.toolRegistry.register(tool);

    return this;
  }

  /**
   * Register multiple tools at once
   */
  tools(tools: UniversalTool[]): this {
    for (const tool of tools) {
      this.toolRegistry.register(tool);
    }

    return this;
  }

  /**
   * Get all registered tools
   */
  getTools(): UniversalTool[] {
    return this.toolRegistry.getAll();
  }

  // ==========================================================================
  // Component Registration
  // ==========================================================================

  /**
   * Register a component
   *
   * @example
   * ```typescript
   * app.component({
   *   type: 'weather-card',
   *   sourcePath: './components/WeatherCard.tsx'
   * });
   * ```
   */
  component(definition: ComponentDefinition): this {
    this.componentRegistry.register(definition);

    return this;
  }

  /**
   * Register multiple components
   */
  components(components: ComponentDefinition[]): this {
    for (const component of components) {
      this.componentRegistry.register(component);
    }

    return this;
  }

  /**
   * Get all registered components
   */
  getComponents(): ComponentDefinition[] {
    return this.componentRegistry.getAll();
  }

  // ==========================================================================
  // Provider Management
  // ==========================================================================

  /**
   * Check if a provider is enabled
   */
  hasProvider(provider: ProviderName): boolean {
    return this.config.providers[provider]?.enabled !== false;
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: ProviderName): ProviderConfig | undefined {
    return this.config.providers[provider];
  }

  /**
   * Get all enabled providers
   */
  getEnabledProviders(): string[] {
    return Object.entries(this.config.providers)
      .filter(([_, config]) => config?.enabled !== false)
      .map(([provider]) => provider);
  }

  /**
   * Register a provider adapter (used internally by provider packages)
   */
  registerProviderAdapter(provider: string, adapter: ProviderAdapter): void {
    this.providerAdapters.set(provider, adapter);
  }

  /**
   * Get a provider adapter
   */
  getProviderAdapter(provider: string): ProviderAdapter | undefined {
    return this.providerAdapters.get(provider);
  }

  /**
   * Initialize provider adapters from configuration
   * This is called automatically in the constructor
   */
  private async initializeProviders(): Promise<void> {
    for (const [providerName, providerConfig] of Object.entries(this.config.providers)) {
      // Skip if undefined or disabled
      if (!providerConfig || providerConfig.enabled === false) {
        continue;
      }

      // Check if factory function exists
      if (!providerConfig._factory) {
        console.warn(
          `⚠️  Provider "${providerName}" missing factory function.\n   Use factory functions: openAI(), etc.`
        );
        continue;
      }

      try {
        // Create adapter from factory
        const adapter = providerConfig._factory();

        // Initialize adapter
        await adapter.initialize({
          name: this.config.name,
          version: this.config.version,
          tools: this.toolRegistry.getAll(),
          components: this.componentRegistry.getAll(),
          providers: this.config.providers,
        });

        // Register adapter
        this.providerAdapters.set(providerName, adapter);
      } catch (error) {
        console.error(
          `❌ Failed to initialize ${providerName} provider:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  }

  // ==========================================================================
  // Server Configuration
  // ==========================================================================

  /**
   * Get server configuration for providers
   */
  getServerConfig(): ServerConfig {
    return {
      name: this.config.name,
      version: this.config.version,
      tools: this.toolRegistry.getAll(),
      components: this.componentRegistry.getAll(),
      providers: this.config.providers,
    };
  }

  /**
   * Get app configuration
   */
  getConfig(): Required<AppConfig> {
    return this.config;
  }

  // ==========================================================================
  // Lifecycle Methods
  // ==========================================================================

  /**
   * Start all registered provider servers
   *
   * @example
   * ```typescript
   * const app = createApp({
   *   name: 'my-app',
   *   providers: {
   *     openai: openAI({ port: 3000 })
   *   }
   * });
   *
   * app.tool('greet', { ... });
   * await app.listen(); // Starts OpenAI server
   * ```
   */
  async listen(_port?: number): Promise<void> {
    // Initialize providers if not already done
    if (!this.initialized) {
      await this.initializeProviders();
      this.initialized = true;
    }

    const enabledProviders = this.getEnabledProviders();

    if (enabledProviders.length === 0) {
      throw new Error(
        'No providers enabled. Add at least one provider to your configuration:\n\n' +
          'createApp({\n' +
          '  providers: {\n' +
          '    openai: openAI({ port: 3000 })\n' +
          '  }\n' +
          '})'
      );
    }

    const servers: ProviderServer[] = [];
    const errors: Array<{ provider: string; error: Error }> = [];

    // Start all provider adapters
    for (const providerName of enabledProviders) {
      const adapter = this.getProviderAdapter(providerName);

      if (!adapter) {
        console.warn(
          `⚠️  Provider "${providerName}" is enabled but no adapter is registered.\n   Make sure to configure the provider properly in createApp().`
        );
        continue;
      }

      try {
        console.log(`🚀 Starting ${providerName} server...`);
        const server = await adapter.startServer();
        servers.push(server);

        const info = server.getInfo();
        const location = info.port ? `${info.transport}://localhost:${info.port}` : info.transport;

        console.log(`   ✅ ${providerName} server ready (${location})`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push({ provider: providerName, error: err });
        console.error(`   ❌ Failed to start ${providerName}: ${err.message}`);
      }
    }

    // Report results
    if (servers.length === 0) {
      console.error('\n❌ No servers started successfully\n');
      if (errors.length > 0) {
        console.error('Errors:');
        for (const { provider, error } of errors) {
          console.error(`  - ${provider}: ${error.message}`);
        }
      }
      throw new Error('Failed to start any provider servers');
    }

    if (errors.length > 0 && servers.length > 0) {
      console.warn(
        `\n⚠️  Some providers failed to start (${errors.length}/${enabledProviders.length})\n` +
          `   ${servers.length} provider(s) running successfully`
      );
    }

    console.log(
      `\n🌐 ${this.config.name} ready!\n` +
        `   Providers: ${servers.length}\n` +
        `   Tools: ${this.toolRegistry.getAll().length}\n`
    );

    // Store servers for cleanup
    this.runningServers = servers;
  }

  /**
   * Stop all provider servers
   */
  async close(): Promise<void> {
    if (!this.runningServers || this.runningServers.length === 0) {
      return;
    }

    console.log('\n👋 Shutting down Unido app...');

    await Promise.all(
      this.runningServers.map(async (server) => {
        try {
          await server.stop();
          console.log(`   ✅ ${server.getInfo().provider} stopped`);
        } catch (error) {
          console.error(`   ❌ Error stopping ${server.getInfo().provider}:`, error);
        }
      })
    );

    this.runningServers = [];
    console.log('   Goodbye!\n');
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new Unido instance
 *
 * @example
 * ```typescript
 * import { createApp } from '@bandofai/unido-core';
 * import { z } from 'zod';
 *
 * const app = createApp({
 *   name: 'weather-app',
 *   providers: {
 *     openai: { port: 3000 }
 *   }
 * });
 *
 * app.tool('get_weather', {
 *   description: 'Get weather for a city',
 *   input: z.object({
 *     city: z.string(),
 *     units: z.enum(['celsius', 'fahrenheit']).default('celsius')
 *   }),
 *   handler: async ({ city, units }) => {
 *     // ...
 *   }
 * });
 *
 * await app.listen();
 * ```
 */
export function createApp(config: AppConfig): Unido {
  return new Unido(config);
}
