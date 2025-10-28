import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { ComponentReference } from '@bandofai/unido-core';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { OpenAIAdapter } from './adapter.js';

const COMPONENT_TYPE = 'test-card';

describe('OpenAIAdapter component resources', () => {
  let workDir: string;
  let componentPath: string;
  let adapter: OpenAIAdapter;

  beforeAll(async () => {
    workDir = await mkdtemp(path.join(tmpdir(), 'unido-openai-adapter-'));
    componentPath = path.join(workDir, 'TestCard.tsx');

    await writeFile(
      componentPath,
      `import type { FC } from 'react';

const TestCard: FC<{ message: string }> = ({ message }) => (
  <section>
    <h1>{message}</h1>
  </section>
);

export default TestCard;
`,
    );

    adapter = new OpenAIAdapter();
    await adapter.initialize({
      name: 'test-app',
      version: '1.0.0',
      tools: [],
      components: [
        {
          type: COMPONENT_TYPE,
          title: 'Test Card',
          description: 'Example component used for adapter tests.',
          sourcePath: componentPath,
          metadata: {
            openai: {
              renderHints: {
                widgetAccessible: true,
              },
            },
          },
        },
      ],
      providers: {
        openai: {
          port: 0,
        } as any,
      },
    });
  });

  afterAll(async () => {
    await adapter.cleanup();
    await rm(workDir, { recursive: true, force: true });
  });

  it('bundles components and registers MCP resources', () => {
    const resourcesByUri = (adapter as any).componentResourcesByUri as Map<string, any>;

    expect(resourcesByUri.size).toBe(1);

    const uri = 'ui://widget/test-card.html';
    const entry = resourcesByUri.get(uri);

    expect(entry).toBeDefined();
    expect(entry.resource.uri).toBe(uri);
    expect(entry.resource.mimeType).toBe('text/html+skybridge');
    expect(entry.html).toContain('<script>');
  });

  it('exposes component metadata for responses', () => {
    const componentRef: ComponentReference = {
      type: COMPONENT_TYPE,
      props: { message: 'Hello widget' },
    };

    const metadata = adapter.convertComponent(componentRef);

    expect(metadata.outputTemplate).toBe('ui://widget/test-card.html');
    expect(metadata.widgetAccessible).toBe(true);

    const providerResponse = adapter.convertResponse({
      content: [{ type: 'text', text: 'Fallback' }],
      component: componentRef,
    });

    const meta = (providerResponse as any)._meta;

    expect(meta).toBeDefined();
    expect(meta['openai/outputTemplate']).toBe('ui://widget/test-card.html');
    expect(meta['openai/widgetAccessible']).toBe(true);
  });
});
