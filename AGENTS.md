# AGENTS.md

This file provides guidance to Codex (the GitHub CLI coding agent) when working in this repository. It mirrors the expectations set for Claude Code so both assistants operate with the same context.

## Project Snapshot

- **Product**: Unido — provider-agnostic TypeScript framework for AI apps that run on multiple LLM platforms (OpenAI today, extensible tomorrow).
- **Mission**: "Write once, run everywhere" for tools, schemas, and UI components.
- **Current State**: Core framework at v0.1.2 with a production-ready OpenAI adapter (v0.1.4). Future adapters plug into the same abstractions.

## Core Commands

```bash
# Install dependencies (must use pnpm)
pnpm install

# Inside this repo use local workspace builds
pnpm install --ignore-workspace

# Build all packages with Turborepo caching
pnpm run build

# Start development mode with hot reload
pnpm run dev

# Type checking across the monorepo
pnpm run type-check

# Lint every package
pnpm run lint

# Execute unit and integration tests
pnpm run test

# Remove build artifacts
pnpm run clean

# Focus on a single package
cd packages/core && pnpm run build
cd packages/core && pnpm run dev
```

> This is a pnpm workspace managed by Turborepo. Tasks automatically build their dependencies (see `^build` in `turbo.json`).

## Architecture at a Glance

### Adapter Pattern Everywhere

1. **Universal API** (`@bandofai/unido-core`) exposes a Zod-powered developer interface.
2. **Provider Adapters** (`@bandofai/unido-provider-*`) translate the universal contract to provider specifics.
3. **MCP Protocol** forms the baseline transport (Model Context Protocol v2025-06-18) with HTTP + SSE in the OpenAI adapter.

```typescript
app.tool('get_weather', {
  description: 'Get weather for a city',
  input: z.object({ city: z.string() }),
  handler: async ({ city }) => ({
    content: [{ type: 'text', text: `Weather in ${city}` }],
    component: { type: 'weather-card', props: { city } }
  })
});
```

Adapters convert the universal handler into provider-aware payloads (JSON Schema, metadata, transport primitives, etc.).

### Key Design Choices

- **Zod Schemas**: Supply runtime validation, TypeScript types, and auto-convert to JSON Schema.
- **Component System**: `UniversalResponse` returns text/image content plus optional UI component definitions. Components registered with `app.component()` are bundled on startup and exposed as MCP `ui://widget/...` resources; OpenAI consumes them directly while other providers can implement their own renderers.
- **MCP First**: The OpenAI adapter speaks the Model Context Protocol (JSON-RPC 2.0). Future adapters can reuse or extend this layer.

### Monorepo Layout

```
@bandofai/unido-core              # createApp(), tool registration, shared types
@bandofai/unido-provider-base     # ProviderAdapter interface and helpers
@bandofai/unido-provider-openai   # OpenAI-specific implementation using MCP SDK
@bandofai/unido-components        # Shared React components
@unido/dev               # Dev server utilities
```

**Path Aliases (critical)** — always import via the configured aliases from `tsconfig.base.json`:

```typescript
// ✅ Correct
import { createApp } from '@bandofai/unido-core';
import { ProviderAdapter } from '@bandofai/unido-provider-base';

// ❌ Avoid relative deep imports
import { createApp } from '../../../core/src/index.js';
```

## Responsibilities by Package

- `packages/core/src/types.ts`: foundational types (`UniversalTool`, `UniversalResponse`, `ProviderConfig`, etc.).
- `packages/core/src/schema.ts`: Zod helpers and schema conversion utilities.
- `packages/core/src/tool.ts`: tool registration lifecycle.
- `packages/core/src/component.ts`: component registry and serialization.
- `packages/core/src/app.ts`: `Unido` class and `createApp()` factory.
- `packages/providers/base/src/adapter.ts`: abstract `ProviderAdapter` contract — schema conversion, tool conversion, response conversion, lifecycle hooks.
- `packages/providers/openai/`: MCP plumbing, `@modelcontextprotocol/sdk` integration, and OpenAI metadata handling.

## Typical Workflows

### Adding a Tool

1. Define with `app.tool()` using a Zod schema (see `examples/weather-app/src/index.ts`).
2. Return a `UniversalResponse` with content and optional component.
3. Rely on the adapter to emit provider-specific schemas and metadata.

### Adding a Provider Adapter

1. Implement `ProviderAdapter` from `@bandofai/unido-provider-base`.
2. Follow the OpenAI adapter structure for schema conversion and transport setup.
3. Register the adapter in `AppConfig.providers` (`packages/core/src/types.ts`).

### Adding Components

1. Create React component in `packages/components/src/`.
2. Export via `packages/components/src/index.ts`.
3. Register with `app.component()`. Providers handle bundling/rendering.

Use the helper emitted by the CLI templates to locate component sources when running from `src/` or built `dist/` bundles:

```typescript
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function resolveComponentPath(relativePath: string): string {
  const normalized = relativePath.startsWith('./') ? relativePath.slice(2) : relativePath;
  const distUrl = new URL(normalized.startsWith('components/') ? './' + normalized : './components/' + normalized, import.meta.url);
  const distPath = fileURLToPath(distUrl);
  if (existsSync(distPath)) return distPath;
  return fileURLToPath(new URL('../src/' + normalized, import.meta.url));
}

app.component({
  type: 'weather-card',
  sourcePath: resolveComponentPath('components/WeatherCard.tsx'),
  // ...
});
```

## Codex Operating Principles

- Stay within pnpm/Turborepo conventions; do not introduce npm/yarn lockfiles.
- Maintain ASCII source unless the file already uses Unicode.
- Respect existing formatting and linting expectations; run relevant `pnpm` scripts when unsure.
- Keep imports aligned with alias scheme and avoid bypassing adapters.
- Document non-obvious logic with succinct comments; skip trivial narration.
- When touching automation, ensure new providers or tools remain compatible with the universal contract.
- Prefer `node --import tsx` when executing TypeScript entrypoints; the CLI now generates `dev` scripts in that form.

## MCP Inspector & Smoke Tests

- The repo keeps two scaffolded projects (`test-basic-app`, `test-weather-app`) linked to the local workspace via `link:` dependencies. Regenerate them with:

  ```bash
  rm -rf test-basic-app && node packages/cli/dist/index.js test-basic-app --template basic --skip-git
  rm -rf test-weather-app && node packages/cli/dist/index.js test-weather-app --template weather --skip-git
  # then inside each app
  pnpm install --ignore-workspace
  ```

- Install the inspector once per project and run it from the package directory (required for pnpm layouts):

  ```bash
  pnpm add -D @modelcontextprotocol/inspector
  cd node_modules/@modelcontextprotocol/inspector/cli
  node build/index.js http://localhost:3000/sse --transport sse --method tools/list
  node build/index.js http://localhost:3000/sse --transport sse --method resources/list
  ```

- For automation, use the MCP SDK directly:

  ```bash
  node --import tsx <<'NODE'
  import { Client } from '@modelcontextprotocol/sdk/client/index.js';
  import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

  const client = new Client({ name: 'smoke-test', version: '0.0.0' });
  const transport = new SSEClientTransport(new URL('http://localhost:3000/sse'));
  await client.connect(transport);
  console.log(await client.listTools());
  console.log(await client.listResources());
  await transport.close();
  NODE
  ```

By following these guidelines, Codex stays perfectly aligned with the expectations documented for Claude Code while keeping the project provider-agnostic.
