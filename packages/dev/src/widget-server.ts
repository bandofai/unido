/**
 * Widget development server using Vite
 */

import path from 'node:path';
import type { ComponentDefinition } from '@bandofai/unido-core';
import react from '@vitejs/plugin-react';
import { type ViteDevServer, createServer } from 'vite';

export interface WidgetServerOptions {
  /**
   * Components to preview
   */
  components: ComponentDefinition[];

  /**
   * Port for dev server
   */
  port?: number;

  /**
   * Open browser automatically
   */
  open?: boolean;

  /**
   * Root directory for resolving paths
   */
  rootDir?: string;

  /**
   * Verbose logging
   */
  verbose?: boolean;

  /**
   * MCP server URL for testing widgets in MCP mode
   * Defaults to http://localhost:3000
   */
  serverUrl?: string;
}

export interface WidgetServer {
  /**
   * Vite dev server instance
   */
  vite: ViteDevServer;

  /**
   * Server URL
   */
  url: string;

  /**
   * Close the server
   */
  close: () => Promise<void>;
}

/**
 * Start widget development server with HMR
 */
export async function startWidgetServer(options: WidgetServerOptions): Promise<WidgetServer> {
  const {
    components,
    port = 5173,
    open = true,
    rootDir = process.cwd(),
    verbose = false,
    serverUrl = 'http://localhost:3000',
  } = options;

  // Create virtual module with component data
  const componentData = JSON.stringify(
    components.map((c) => ({
      type: c.type,
      title: c.title,
      description: c.description,
      sourcePath: path.isAbsolute(c.sourcePath)
        ? c.sourcePath
        : path.resolve(rootDir, c.sourcePath),
      propsSchema: c.propsSchema, // Include props schema for type-aware prop editing
    }))
  );

  // Virtual module plugin
  const virtualModuleId = 'virtual:unido-components';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  const vite = await createServer({
    root: path.join(import.meta.dirname, '../public'),
    server: {
      port,
      strictPort: true,
      open,
      fs: {
        // Allow serving files from the user's project directory
        allow: [
          path.join(import.meta.dirname, '../public'),
          rootDir,
        ],
      },
    },
    logLevel: verbose ? 'info' : 'warn',
    plugins: [
      react(),
      {
        name: 'unido-virtual-components',
        resolveId(id) {
          if (id === virtualModuleId) {
            return resolvedVirtualModuleId;
          }
          return null;
        },
        load(id) {
          if (id === resolvedVirtualModuleId) {
            return `export const components = ${componentData};\nexport const serverUrl = ${JSON.stringify(serverUrl)};`;
          }
          return null;
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'src'),
      },
    },
  });

  await vite.listen();

  const url = `http://localhost:${port}`;

  if (verbose) {
    console.log(`\n✅ Widget dev server ready at ${url}`);
    console.log(`📦 Loaded ${components.length} component(s)`);
    for (const component of components) {
      console.log(`   - ${component.type}: ${component.title}`);
    }
    console.log('');
  }

  return {
    vite,
    url,
    close: async () => {
      await vite.close();
    },
  };
}

/**
 * Watch components for changes and reload
 */
export async function watchComponents(
  components: ComponentDefinition[],
  onReload: (component: ComponentDefinition) => void | Promise<void>
): Promise<() => void> {
  const chokidar = await import('chokidar');

  const paths = components.map((c) => c.sourcePath);

  const watcher = chokidar.watch(paths, {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', async (changedPath) => {
    const component = components.find((c) => c.sourcePath === changedPath);
    if (component) {
      await onReload(component);
    }
  });

  return () => {
    watcher.close();
  };
}
