# Gemini Code-along Agent Context

This document provides context for the Gemini code-along agent to understand the project structure, conventions, and goals.

## Project Overview

**Unido** is a provider-agnostic TypeScript framework for building AI applications that work seamlessly across multiple AI platforms (currently supporting OpenAI ChatGPT, with extensibility for future platforms). The core principle is "write once, run everywhere" - define tools and components once, and deploy to any AI provider.

**Status**: Core framework complete (v0.1.0), OpenAI adapter functional and ready for use.

## Build & Development Commands

```bash
# Install dependencies (must use pnpm)
pnpm install

# Build all packages (uses Turborepo caching)
pnpm run build

# Development mode with hot reload
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

## Next Implementation Priorities

1.  **HTTP Server for OpenAI**: Full SSE implementation (currently foundation only)
2.  **Component Bundler**: Automatic React → bundle for OpenAI (esbuild/Vite)
3.  **CLI Tool Enhancements**: Improve `create-unido` with more templates
4.  **More Components**: List, Table, Chart, Form components
5.  **Additional Provider Adapters**: Framework is ready for new provider implementations
