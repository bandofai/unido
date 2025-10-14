/**
 * Bundles registered components for delivery to OpenAI widgets.
 */

import { build } from 'esbuild';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promises as fs } from 'node:fs';
import type { ComponentDefinition } from '@bandofai/unido-core';

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
  options: BundleComponentsOptions = {}
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

    const bundle = await build({
      entryPoints: [absolutePath],
      bundle: true,
      write: false,
      platform: 'browser',
      format: 'esm',
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
      `Component "${componentType}" source not found at ${filePath} (${fileUrl}). ` +
        'Ensure the path is correct when calling app.component().'
    );
  }
}
