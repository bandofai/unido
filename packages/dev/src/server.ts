/**
 * Multi-provider development server
 */

import type { Unido } from '@unido/core';
import type { ProviderAdapter } from '@unido/provider-base';

export interface DevServerOptions {
  /**
   * Enable hot reload
   */
  hotReload?: boolean;

  /**
   * Port for dev server
   */
  port?: number;

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

/**
 * Start development server for all enabled providers
 */
export async function startDevServer(app: Unido, options: DevServerOptions = {}): Promise<void> {
  const { hotReload = true, verbose = false } = options;

  console.log('🚀 Starting Unido dev server...\n');

  // Get enabled providers
  const providers = app.getEnabledProviders();

  if (providers.length === 0) {
    console.warn('⚠️  No providers enabled. Please configure at least one provider.');
    return;
  }

  // Start each provider
  for (const providerName of providers) {
    const adapter = app.getProviderAdapter(providerName) as ProviderAdapter;

    if (!adapter) {
      console.warn(`⚠️  Provider "${providerName}" not registered`);
      continue;
    }

    try {
      const server = await adapter.startServer();
      const info = server.getInfo();

      console.log(`✅ ${providerName}: ${info.transport} server ready`);
      if (info.url) {
        console.log(`   URL: ${info.url}`);
      }
    } catch (error) {
      console.error(`❌ Failed to start ${providerName}:`, error);
    }
  }

  if (hotReload) {
    console.log('\n🔥 Hot reload enabled');
  }

  if (verbose) {
    console.log('\n📊 Registered tools:');
    for (const tool of app.getTools()) {
      console.log(`   - ${tool.name}: ${tool.description}`);
    }
  }

  console.log('\n✨ Dev server running. Press Ctrl+C to stop.\n');
}
