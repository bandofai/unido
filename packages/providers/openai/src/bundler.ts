/**
 * Bundles registered components for delivery to OpenAI widgets.
 */

import { build } from 'esbuild';

import type { ComponentDefinition } from '@bandofai/unido-core';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export interface BundledComponent {
  type: string;
  code: string;
  sourcePath: string;
  lastModified?: number;
}

export interface BundleComponentsOptions {
  /**
   * Base directory to resolve component source paths from.
   * Defaults to process.cwd().
   */
  rootDir?: string;
}

/**
 * Bundle components using esbuild and return their compiled code.
 */
export async function bundleComponents(
  components: ComponentDefinition[],
  options: BundleComponentsOptions = {},
): Promise<Map<string, BundledComponent>> {
  const results = new Map<string, BundledComponent>();
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : process.cwd();

  for (const component of components) {
    const absolutePath = path.isAbsolute(component.sourcePath)
      ? component.sourcePath
      : path.resolve(rootDir, component.sourcePath);

    await assertFileExists(absolutePath, component.type);

    const nodePaths = new Set<string>();
    const resolvedRoot = rootDir;

    nodePaths.add(path.join(resolvedRoot, 'node_modules'));
    nodePaths.add(path.join(process.cwd(), 'node_modules'));

    // Create a temporary entry file that initializes React
    const entryContent = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import Component from ${JSON.stringify(absolutePath)};

type ComponentProps = Record<string, unknown>;

// TypeScript declarations for OpenAI Apps SDK
declare global {
  interface Window {
    openai?: {
      toolInput?: unknown;
      toolOutput?: ComponentProps;
      toolResponseMetadata?: Record<string, unknown>;
      widgetState?: Record<string, unknown>;
      setWidgetState?: (state: Record<string, unknown>) => void;
      callTool?: (name: string, args: unknown) => Promise<unknown>;
    };
  }
}

// Get props from window.openai.toolOutput (structured content from MCP tool response)
const getProps = (): ComponentProps => {
  if (typeof window !== 'undefined' && window.openai?.toolOutput) {
    return window.openai.toolOutput;
  }
  return {};
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);

  const render = (nextProps: ComponentProps) => {
    root.render(React.createElement(Component, nextProps));
  };

  // Initial render
  render(getProps());

  // Listen for OpenAI globals updates
  window.addEventListener('openai:set_globals', () => {
    render(getProps());
  });
}
`;

    const tmpDir = path.join(rootDir, 'node_modules', '.unido-temp');
    await fs.mkdir(tmpDir, { recursive: true });
    const entryPath = path.join(tmpDir, `${component.type}-entry.tsx`);
    await fs.writeFile(entryPath, entryContent, 'utf8');

    const bundle = await build({
      entryPoints: [entryPath],
      bundle: true,
      write: false,
      platform: 'browser',
      format: 'iife',
      target: ['es2020'],
      jsx: 'automatic',
      sourcemap: false,
      minify: true,
      logLevel: 'silent',
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
        '.json': 'json',
      },
      absWorkingDir: rootDir,
      nodePaths: Array.from(nodePaths),
    });

    // Clean up temp file
    await fs.unlink(entryPath).catch(() => {});

    const output = bundle.outputFiles?.[0];
    if (!output) {
      throw new Error(`Failed to bundle component "${component.type}" (${absolutePath})`);
    }

    const code = Buffer.from(output.contents).toString('utf8');
    const stats = await fs.stat(absolutePath).catch(() => undefined);

    results.set(component.type, {
      type: component.type,
      code,
      sourcePath: absolutePath,
      lastModified: stats?.mtimeMs,
    });
  }

  return results;
}

async function assertFileExists(filePath: string, componentType: string): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    const fileUrl = pathToFileURL(filePath).href;
    throw new Error(
      `Component "${componentType}" source not found at ${filePath} (${fileUrl}). Ensure the path is correct when calling app.component().`,
    );
  }
}
