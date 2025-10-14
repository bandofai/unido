# Gemini Code-along Agent Context

This document provides context for the Gemini code-along agent to understand the project structure, conventions, and goals.

## Project Overview

**Unido** is a provider-agnostic TypeScript framework for building AI applications that work seamlessly across multiple AI platforms (currently supporting OpenAI ChatGPT, with extensibility for future platforms). The core principle is "write once, run everywhere" - define tools and components once, and deploy to any AI provider.

**Status**: Core framework complete (v0.1.2) with an updated OpenAI adapter (v0.1.4) and CLI (v0.3.1).

## Build & Development Commands

```bash
# Install dependencies (must use pnpm)
pnpm install

# Within this repo link against workspace builds
pnpm install --ignore-workspace

# Build all packages (uses Turborepo caching)
pnpm run build

# Development mode with hot reload (via node --import tsx)
pnpm run dev

# Type checking across all packages
pnpm run type-check

# Lint all packages
pnpm run lint

# Run tests
pnpm run test

# Clean all build artifacts
pnpm run clean

# Build/work on specific package
cd packages/core && pnpm run build
cd packages/core && pnpm run dev
```

**Important**: This is a pnpm workspace monorepo with Turborepo. Build dependencies are automatically handled (`^build` in turbo.json means "build dependencies first").

## Architecture Overview

### Core Design Pattern: Provider Adapters

The framework uses an adapter pattern to abstract AI provider differences:

1.  **Universal API** (`@bandofai/unido-core`): Developer-facing API using Zod schemas
2.  **Provider Adapters** (`@bandofai/unido-provider-*`): Convert universal format to provider-specific protocols
3.  **MCP Protocol**: All providers implement Model Context Protocol (v2025-06-18)

```typescript
// Universal tool definition (works everywhere)
app.tool('get_weather', {
  description: 'Get weather for a city',
  input: z.object({ city: z.string() }),
  handler: async ({ city }) => ({
    content: [{ type: 'text', text: `Weather in ${city}` }],
    component: { type: 'weather-card', props: { city } }
  })
});

// OpenAI adapter → MCP + HTTP/SSE + JSON Schema
// Future adapters can be added with provider-specific implementations
```

### Key Architectural Decisions

**Zod for Schema Definition**: Runtime validation + compile-time types + converts to JSON Schema for MCP. All tool inputs use Zod schemas.

**Component System**: Returns `UniversalResponse` with both `content` (text/images) and optional `component` (UI reference). Components adapt per provider:

*   OpenAI: React bundled to `ui://` resources
*   Future providers: Can implement their own component rendering strategies

**MCP as Foundation**: OpenAI uses Model Context Protocol (JSON-RPC 2.0) with HTTP + Server-Sent Events transport. Future providers can implement MCP or other protocols as needed.

### Package Structure

```
@bandofai/unido-core              # Main API: createApp(), tool registration, Zod schemas
@bandofai/unido-provider-base     # ProviderAdapter interface, base implementation
@bandofai/unido-provider-openai   # OpenAI adapter with MCP SDK + zod-to-json-schema
@bandofai/unido-components        # React components (Card, etc.)
@unido/dev               # Development server utilities
```

### TypeScript Path Aliases

**Critical**: Use path aliases for internal imports:

```typescript
// ✅ Correct
import { createApp } from '@bandofai/unido-core';
import { ProviderAdapter } from '@bandofai/unido-provider-base';

// ❌ Wrong
import { createApp } from '../../../core/src/index.js';
```

Configured in [tsconfig.base.json](tsconfig.base.json):

*   `@bandofai/unido-core` → `packages/core/src/`
*   `@bandofai/unido-provider-base` → `packages/providers/base/src/`
*   `@bandofai/unido-provider-openai` → `packages/providers/openai/src/`

## Key Files & Responsibilities

### Core Package (`packages/core/`)

*   [types.ts](packages/core/src/types.ts): All core types (`UniversalTool`, `UniversalResponse`, `ProviderConfig`, `ToolHandler`)
*   [schema.ts](packages/core/src/schema.ts): Zod schema utilities
*   [tool.ts](packages/core/src/tool.ts): Tool registration helpers
*   [component.ts](packages/core/src/component.ts): Component registry
*   [app.ts](packages/core/src/app.ts): `Unido` class and `createApp()` factory

### Provider Base (`packages/providers/base/`)

*   [adapter.ts](packages/providers/base/src/adapter.ts): `ProviderAdapter` interface (all adapters must implement)
    *   `convertSchema(zodSchema)`: Zod → Provider schema format
    *   `convertTool(tool)`: Universal tool → Provider tool definition
    *   `convertResponse(response)`: Universal response → Provider response
    *   `startServer()`: Initialize provider server
    *   `stopServer()`: Cleanup

### OpenAI Provider (`packages/providers/openai/`)

Uses `@modelcontextprotocol/sdk` (v1.0.6) and `zod-to-json-schema` (v3.24.1).

**Important**: OpenAI uses metadata in tool definitions:

```typescript
{
  _meta: {
    "openai/outputTemplate": "ui://widget/weather-card.html",
    "openai/widgetAccessible": true
  }
}
```

## Common Development Workflows

### Adding a New Tool

1.  Use `app.tool()` with Zod schema in [examples/weather-app/src/index.ts](examples/weather-app/src/index.ts) as reference
2.  Schema automatically converts to JSON Schema via adapter
3.  Return `UniversalResponse` format (content + optional component)

### Creating a New Provider Adapter

1.  Implement `ProviderAdapter` interface from `@bandofai/unido-provider-base`
2.  Follow OpenAI adapter structure in [packages/providers/openai/](packages/providers/openai/)
3.  Handle schema conversion (Zod → Provider format)
4.  Implement transport layer (HTTP/stdio/WebSocket)
5.  Add provider config to `AppConfig.providers` in [types.ts](packages/core/src/types.ts)

### Adding Components

1.  Create React component in [packages/components/src/](packages/components/src/)
2.  Export from [packages/components/src/index.ts](packages/components/src/index.ts)
3.  Register in app with `app.component()`
4.  Bundle will be handled per provider (OpenAI bundles to `ui://` resources)

Use the shared helper to locate source files from both `src/` and compiled `dist/`:

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

## Testing Strategy

Run individual package tests:

```bash
cd packages/core && pnpm test
```

Test the example app:

```bash
cd examples/weather-app && pnpm run dev
```

**Note**: Full test suite is architecture-ready but not yet implemented.

## Important Conventions

1.  **ES Modules Only**: All packages use `"type": "module"` and `.js` extensions in imports
2.  **Strict TypeScript**: `strict: true`, `noUnusedLocals: true`, `noUncheckedIndexedAccess: true`
3.  **Monorepo Dependencies**: Use `workspace:*` for internal package dependencies
4.  **Build Order**: Turborepo handles dependency builds automatically via `dependsOn: ["^build"]`

## MCP Inspector & Smoke Tests

- Scaffolded playgrounds (`test-basic-app`, `test-weather-app`) live in the repo and point to the workspace packages using `link:` dependencies. Recreate them with:

  ```bash
  rm -rf test-basic-app && node packages/cli/dist/index.js test-basic-app --template basic --skip-git
  rm -rf test-weather-app && node packages/cli/dist/index.js test-weather-app --template weather --skip-git
  # inside each project
  pnpm install --ignore-workspace
  ```

- Install the inspector once per project and run it from the bundled CLI directory (required with pnpm's layout):

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

## Next Implementation Priorities

1.  **HTTP Server for OpenAI**: Full SSE implementation (currently foundation only)
2.  **Component Bundler**: Automatic React → bundle for OpenAI (esbuild/Vite)
3.  **CLI Tool Enhancements**: Improve `create-unido` with more templates
4.  **More Components**: List, Table, Chart, Form components
5.  **Additional Provider Adapters**: Framework is ready for new provider implementations
