import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bundleComponents } from './bundler.js';

const TEMP_PREFIX = 'unido-bundler-';

describe('bundleComponents', () => {
  let workDir: string;
  let componentPath: string;

  beforeAll(async () => {
    workDir = await mkdtemp(path.join(tmpdir(), TEMP_PREFIX));
    componentPath = path.join(workDir, 'TestWidget.tsx');

    await writeFile(
      componentPath,
      `import type { FC } from 'react';

const TestWidget: FC<{ title: string }> = ({ title }) => <div>{title}</div>;

export default TestWidget;
`
    );
  });

  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  it('produces bundled code for registered components', async () => {
    const result = await bundleComponents([
      {
        type: 'test-widget',
        title: 'Test Widget',
        description: 'Widget used in bundler tests',
        sourcePath: componentPath,
      },
    ]);

    const entry = result.get('test-widget');

    expect(entry).toBeDefined();
    expect(entry?.code).toContain('title');
    expect(entry?.sourcePath).toBe(componentPath);
    expect(entry?.code.length).toBeGreaterThan(0);
  });
});
