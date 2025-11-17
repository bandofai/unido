/**
 * Bundles registered components for delivery to OpenAI widgets.
 */

import { build, type OnLoadArgs, type PluginBuild } from 'esbuild';

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
  let postcssProcessor: import('postcss').Processor | null = null;
  let postcssWarningLogged = false;

  const ensurePostcssProcessor = async (): Promise<import('postcss').Processor | null> => {
    if (postcssProcessor) {
      return postcssProcessor;
    }

    try {
      const [{ default: postcss }, { default: tailwindcss }, { default: autoprefixer }] =
        await Promise.all([
          import('postcss'),
          import('@tailwindcss/postcss'),
          import('autoprefixer'),
        ]);

      postcssProcessor = postcss([tailwindcss(), autoprefixer()]);
      return postcssProcessor;
    } catch (error) {
      if (!postcssWarningLogged) {
        console.warn(
          'Tailwind/PostCSS pipeline unavailable. Install tailwindcss@^4 and @tailwindcss/postcss in your app to bundle component styles.',
          error,
        );
        postcssWarningLogged = true;
      }
      return null;
    }
  };

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
import '@bandofai/unido-components/globals.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Component from ${JSON.stringify(absolutePath)};

type ComponentProps = Record<string, unknown>;

// TypeScript declarations for OpenAI Apps SDK
// Complete window.openai API specification
declare global {
  interface Window {
    openai?: {
      // Data properties (read-only)
      readonly toolInput?: unknown;
      readonly toolOutput?: ComponentProps;
      readonly widgetState?: Record<string, unknown>;

      // State management methods
      setWidgetState?(state: Record<string, unknown>): Promise<void>;

      // Tool invocation
      callTool?(name: string, args: unknown): Promise<{ result: unknown }>;

      // Communication methods
      sendFollowupTurn?(request: { prompt: string }): Promise<void>;
      requestDisplayMode?(request: { mode: 'inline' | 'pip' | 'fullscreen' }): Promise<{ mode: 'inline' | 'pip' | 'fullscreen' }>;
      openExternal?(request: { href: string }): void;

      // Layout & context properties (read-only)
      readonly displayMode?: 'inline' | 'pip' | 'fullscreen';
      readonly maxHeight?: number;
      readonly locale?: string;
      readonly theme?: 'light' | 'dark';
    };
  }

  // Window events
  interface WindowEventMap {
    'openai:set_globals': CustomEvent<{
      displayMode?: 'inline' | 'pip' | 'fullscreen';
      maxHeight?: number;
      toolInput?: unknown;
      toolOutput?: unknown;
      widgetState?: Record<string, unknown>;
      locale?: string;
      theme?: 'light' | 'dark';
    }>;
    'openai:tool_response': CustomEvent<{
      name: string;
      args: unknown;
      result: unknown;
    }>;
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

    const processor = await ensurePostcssProcessor();

    const outfile = path.join(tmpDir, `${component.type}-bundle.js`);

    const bundle = await build({
      entryPoints: [entryPath],
      bundle: true,
      write: false,
      outfile,
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
        '.css': 'css',
      },
      absWorkingDir: rootDir,
      nodePaths: Array.from(nodePaths),
      plugins: [
        {
          name: 'provide-unido-dev-hooks',
          setup(build) {
            // Intercept imports of @bandofai/unido-dev and provide working hook implementations
            build.onResolve({ filter: /^@bandofai\/unido-dev/ }, () => {
              return { path: 'unido-dev-hooks', namespace: 'unido-dev-hooks' };
            });
            build.onLoad({ filter: /.*/, namespace: 'unido-dev-hooks' }, () => {
              return {
                contents: `
import { useState, useEffect } from 'react';

// Inline hook implementation that reads from window.openai.toolOutput
export function useToolOutput() {
  const [value, setValue] = useState(() => {
    return typeof window !== 'undefined' && window.openai ? window.openai.toolOutput : undefined;
  });

  useEffect(() => {
    const handler = (event) => {
      if ('toolOutput' in event.detail) {
        setValue(event.detail.toolOutput);
      }
    };
    window.addEventListener('openai:set_globals', handler);
    if (typeof window !== 'undefined' && window.openai) {
      setValue(window.openai.toolOutput);
    }
    return () => {
      window.removeEventListener('openai:set_globals', handler);
    };
  }, []);

  return value;
}

// Export other hooks as no-ops for compatibility
export const useToolInput = () => undefined;
export const useDisplayMode = () => undefined;
export const useTheme = () => undefined;
export const useMaxHeight = () => undefined;
export const useLocale = () => undefined;
export const useWidgetState = () => [undefined, async () => {}];
export const useToolCall = () => async () => ({ result: undefined });
export const useSendFollowupTurn = () => async () => {};
export const useRequestDisplayMode = () => async () => ({ mode: 'inline' });
export const useOpenExternal = () => () => {};
export const useOpenAIGlobal = () => undefined;
export const useOpenAIGlobals = () => ({});
export const useOpenAIAvailable = () => false;
`,
                loader: 'js',
                resolveDir: rootDir,
              };
            });
          },
        },
        ...(processor
          ? [
              {
                name: 'unido-postcss',
                setup(build: PluginBuild) {
                  build.onLoad({ filter: /\.css$/ }, async (args: OnLoadArgs) => {
                    const source = await fs.readFile(args.path, 'utf8');
                    const result = await processor.process(source, {
                      from: args.path,
                      map: false,
                    });

                    return {
                      contents: result.css,
                      loader: 'css',
                      resolveDir: path.dirname(args.path),
                    };
                  });
                },
              },
            ]
          : []),
      ],
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
