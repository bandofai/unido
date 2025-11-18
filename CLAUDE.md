<div align="center">

<img src="docs/logo.png" alt="Unido Logo" width="150" />

# CLAUDE.md

**Context for Claude Code (claude.ai/code)** when working with this repository.

</div>

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Reference](#quick-reference)
3. [Architecture](#architecture)
4. [Package Structure](#package-structure)
5. [Development Workflows](#development-workflows)
6. [Testing & Validation](#testing--validation)
7. [Code Conventions](#code-conventions)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is Unido?

**Unido** is a provider-agnostic TypeScript framework for building AI applications that work seamlessly across multiple AI platforms. The core principle is **"write once, run everywhere"** - define tools and components once, deploy to any AI provider.

**Current Status** (as of January 2025):
- ✅ Core framework: `@bandofai/unido-core` v0.1.13
- ✅ OpenAI adapter: `@bandofai/unido-provider-openai` v0.1.27
- ✅ CLI tool: `create-unido` v0.6.25
- ✅ Component system: `@bandofai/unido-components` v0.2.9
- ✅ Development tools: `@bandofai/unido-dev` v0.1.17
- ✅ HTTP/SSE server implementation complete and working
- ✅ Component bundling system operational
- ✅ Widget development environment with Storybook
- 🔜 Additional provider adapters (architecture ready)

### Core Philosophy

```typescript
// Write once...
app.tool('get_weather', {
  description: 'Get weather for a city',
  input: z.object({ city: z.string() }),
  handler: async ({ city }) => ({
    content: [{ type: 'text', text: `Weather in ${city}` }],
    component: { type: 'weather-card', props: { city } }
  })
});

// ...runs on OpenAI (today) and future providers (tomorrow)
```

The framework abstracts provider differences through adapters while maintaining type safety, runtime validation, and rich UI capabilities.

---

## Quick Reference

### Essential Commands

```bash
# Initial Setup
pnpm install                    # Install all dependencies
./scripts/dev-setup.sh          # Complete setup (recommended)

# Development
pnpm run dev                    # Watch mode for all packages
pnpm run build                  # Build all packages
pnpm run type-check             # TypeScript validation
pnpm run lint                   # Run linter
pnpm run test                   # Run tests

# CLI Testing
pnpm run cli:test my-app        # Test CLI directly
./scripts/local-test.sh basic   # Quick test helper
./scripts/smoke-test.sh         # Run full smoke tests

# Package-specific
cd packages/core && pnpm run dev     # Watch specific package
cd packages/core && pnpm run build   # Build specific package
```

### Documentation Quick Links

- [QUICKSTART.md](QUICKSTART.md) - Daily development reference
- [DEVELOPMENT.md](DEVELOPMENT.md) - Comprehensive development guide
- [README.md](README.md) - User-facing documentation
- [scripts/README.md](scripts/README.md) - Helper scripts guide

### Provider-Specific Documentation

**OpenAI Apps SDK Integration:**
- [docs/providers/openai/OPENAI_APPS_SDK.md](docs/providers/openai/OPENAI_APPS_SDK.md) - Complete OpenAI integration guide
  - Unido ↔ OpenAI concept mapping
  - Metadata reference
  - Widget system deep dive
  - Context7 integration guide
- [docs/providers/openai/examples/basic-widget.md](docs/providers/openai/examples/basic-widget.md) - Simple read-only widget
- [docs/providers/openai/examples/interactive-widget.md](docs/providers/openai/examples/interactive-widget.md) - Interactive widget with callTool
- [docs/providers/openai/examples/multi-component.md](docs/providers/openai/examples/multi-component.md) - Multiple components pattern
- [docs/providers/openai/troubleshooting.md](docs/providers/openai/troubleshooting.md) - Common issues and solutions

**For AI Assistants:** When working with OpenAI-specific features, always check the provider docs first. They include Context7 integration for up-to-date OpenAI Apps SDK specifications.

### Monorepo Structure

This is a **pnpm workspace** managed by **Turborepo**:
- Dependencies are automatically handled (`^build` in `turbo.json`)
- Internal packages use `workspace:*` dependencies
- Build artifacts cached for performance
- Must use pnpm (npm/yarn not supported)

---

## Architecture

### Core Design Pattern: Provider Adapters

The framework uses a three-layer architecture:

```
┌─────────────────────────────────────┐
│   Universal API (Developer-Facing)  │
│   @bandofai/unido-core               │
│   - Zod schemas                      │
│   - Type-safe tool definitions       │
│   - Component registry               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Provider Adapters               │
│   @bandofai/unido-provider-*         │
│   - Schema conversion                │
│   - Protocol translation             │
│   - Transport implementation         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      AI Provider Platforms           │
│   - OpenAI ChatGPT (HTTP/SSE)        │
│   - Future providers (extensible)    │
└─────────────────────────────────────┘
```

### Key Architectural Decisions

#### 1. Zod for Schema Definition

**Why:** Runtime validation + compile-time types + JSON Schema conversion

```typescript
// One schema, three benefits:
const weatherInput = z.object({
  city: z.string().describe('City name'),
  units: z.enum(['celsius', 'fahrenheit']).default('celsius')
});

// 1. TypeScript types inferred automatically
type WeatherInput = z.infer<typeof weatherInput>;

// 2. Runtime validation with detailed errors
const result = weatherInput.parse(userInput);

// 3. Converts to JSON Schema for MCP
const jsonSchema = zodToJsonSchema(weatherInput);
```

#### 2. Component System

**Why:** Rich UI responses with provider-specific rendering

```typescript
// Universal response format
return componentResponse(
  'weather-card',               // Component type
  { city, temperature },        // Props
  'Fallback text'               // Text for non-UI contexts
);

// Rendering strategy per provider:
// - OpenAI: React → HTML bundle → ui://widget/...
// - Future: Provider-specific implementations
```

Components registered via `app.component()` are:
- Bundled on server startup using esbuild
- CSS is processed with PostCSS and injected into bundle
- Exposed as MCP resources (`ui://widget/<name>.html`)
- Fetched by ChatGPT when needed
- Rendered in ChatGPT interface with full interactivity
- Support hot reload during development (via chokidar)

#### 3. MCP (Model Context Protocol) Foundation

**Why:** Industry-standard protocol for AI tools

- Protocol: JSON-RPC 2.0
- Transport: HTTP + Server-Sent Events (OpenAI)
- Spec version: v2025-06-18
- SDK: `@modelcontextprotocol/sdk` v1.0.6

OpenAI adapter implements MCP fully. Future adapters can:
- Reuse MCP implementation
- Implement alternative protocols
- Extend with provider-specific features

### Package Architecture

```
@bandofai/unido-core (v0.1.13)
├── API surface: createApp(), tool(), component()
├── Type system: UniversalTool, UniversalResponse
├── Schema utilities: Zod integration
└── Component registry

@bandofai/unido-provider-base (v0.1.14)
├── ProviderAdapter interface
├── Base adapter implementation
├── Lifecycle hooks: startServer(), stopServer()
└── Conversion contracts: schema, tool, response

@bandofai/unido-provider-openai (v0.1.27)
├── MCP SDK integration
├── HTTP/SSE server implementation
├── JSON Schema conversion (zod-to-json-schema)
├── Component bundling system with esbuild
├── Hot reload support with chokidar
└── OpenAI-specific metadata handling

@bandofai/unido-components (v0.2.9)
├── React component library (shadcn/ui-based)
├── Shared UI primitives with Radix UI
├── Tailwind CSS 4 integration
├── Storybook for component development
└── Theme system

create-unido (v0.6.25)
├── Interactive CLI scaffolding
├── Project templates (basic, weather)
├── Dependency management
└── Development setup

@bandofai/unido-dev (v0.1.17)
├── Development server with Vite
├── MCP client for widget testing
├── Widget iframe renderer
├── Tool call and log panels
├── Hot reload capabilities
└── E2E testing with Playwright
```

---

## Package Structure

### Core Package (`packages/core/`)

**Purpose:** Universal API and type system

#### Key Files

- **[app.ts](packages/core/src/app.ts)**: `Unido` class and `createApp()` factory
  - App lifecycle management
  - Provider initialization
  - Tool and component registration
  - Server startup/shutdown

- **[types.ts](packages/core/src/types.ts)**: Core type definitions
  - `UniversalTool`: Tool definition interface
  - `UniversalResponse`: Response format
  - `ProviderConfig`: Provider configuration
  - `ToolHandler`: Handler function signature
  - `ComponentDefinition`: Component metadata

- **[tool.ts](packages/core/src/tool.ts)**: Tool registration system
  - Tool validation
  - Handler wrapping
  - Metadata management

- **[component.ts](packages/core/src/component.ts)**: Component registry
  - Component registration
  - Metadata tracking
  - Source path resolution

- **[schema.ts](packages/core/src/schema.ts)**: Zod utilities
  - Schema validation helpers
  - Type inference utilities
  - Error formatting

### Provider Base (`packages/providers/base/`)

**Purpose:** Abstract adapter contract

#### Key File

- **[adapter.ts](packages/providers/base/src/adapter.ts)**: `ProviderAdapter` interface

```typescript
interface ProviderAdapter {
  // Schema conversion: Zod → Provider format
  convertSchema(zodSchema: ZodSchema): ProviderSchema;

  // Tool conversion: Universal → Provider tool
  convertTool(tool: UniversalTool): ProviderTool;

  // Response conversion: Universal → Provider response
  convertResponse(response: UniversalResponse): ProviderResponse;

  // Lifecycle: Initialize provider server
  startServer(): Promise<void>;

  // Lifecycle: Cleanup and shutdown
  stopServer(): Promise<void>;
}
```

### OpenAI Provider (`packages/providers/openai/`)

**Purpose:** OpenAI ChatGPT integration via MCP

#### Key Files

- **[adapter.ts](packages/providers/openai/src/adapter.ts)**: Main OpenAI adapter
  - MCP server initialization
  - HTTP/SSE transport setup
  - Tool/resource conversion
  - Component bundling

- **[server.ts](packages/providers/openai/src/server.ts)**: HTTP/SSE server
  - Express.js server setup
  - SSE connection management
  - Health check endpoint
  - CORS configuration

#### Dependencies

- `@modelcontextprotocol/sdk` v1.0.6 - MCP protocol implementation
- `zod-to-json-schema` v3.24.1 - Schema conversion
- `express` v5.1.0 - HTTP server
- `cors` v2.8.5 - CORS middleware
- `esbuild` v0.25.0 - Component bundling
- `chokidar` v4.0.3 - File watching for hot reload
- `postcss-import` v16.1.1 - CSS processing

#### OpenAI Metadata Format

```typescript
{
  _meta: {
    "openai/outputTemplate": "ui://widget/weather-card.html",
    "openai/widgetAccessible": true,     // Enable UI interactions
    "openai/renderHints": {
      "preferredSize": "medium"
    }
  }
}
```

### Components Package (`packages/components/`)

**Purpose:** Shared React components built on shadcn/ui

```
packages/components/src/
├── Card.tsx              # Basic card component
├── WeatherCard.tsx       # Weather display component
├── ui/                   # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── select.tsx
├── globals.css           # Tailwind CSS 4 global styles
├── index.ts              # Exports
└── types.ts              # Shared types
```

#### Storybook Development

```bash
cd packages/components
pnpm run storybook          # Start Storybook on port 6006
pnpm run storybook:build    # Build static Storybook
pnpm run storybook:test     # Run Storybook tests
```

### CLI Package (`packages/cli/`)

**Purpose:** Project scaffolding tool

#### Key Files

- **[index.ts](packages/cli/src/index.ts)**: CLI entry point (Commander.js)
- **[scaffold.ts](packages/cli/src/scaffold.ts)**: Project generation logic
- **[templates.ts](packages/cli/src/templates.ts)**: Template definitions
- **[utils.ts](packages/cli/src/utils.ts)**: Helper functions

### Dev Package (`packages/dev/`)

**Purpose:** Development server and widget testing tools

#### Key Features

- **Vite-based dev server**: Fast development experience with HMR
- **MCP client**: Connect to running MCP servers for widget testing
- **Widget renderer**: Iframe-based widget rendering with postMessage communication
- **Tool execution**: Test tool calls directly from the UI
- **Log monitoring**: Real-time logs from MCP server
- **E2E testing**: Playwright-based testing infrastructure

#### Key Files

- **[mcp-client.ts](packages/dev/src/mcp-client.ts)**: MCP client with SSE transport
- **[components/WidgetIframeRenderer.tsx](packages/dev/src/components/WidgetIframeRenderer.tsx)**: Widget rendering component
- **[components/ToolCallPanel.tsx](packages/dev/src/components/ToolCallPanel.tsx)**: Tool execution UI
- **[components/LogPanel.tsx](packages/dev/src/components/LogPanel.tsx)**: Log display component

#### Testing

```bash
cd packages/dev
pnpm run test           # Unit tests with Vitest
pnpm run test:ui        # Vitest UI
pnpm run test:e2e       # Playwright E2E tests
pnpm run test:e2e:ui    # Playwright UI mode
```

---

## Development Workflows

### TypeScript Path Aliases

**CRITICAL:** Always use configured path aliases, never relative imports:

```typescript
// ✅ Correct - uses tsconfig.base.json aliases
import { createApp } from '@bandofai/unido-core';
import { ProviderAdapter } from '@bandofai/unido-provider-base';
import { openAI } from '@bandofai/unido-provider-openai';
import { Card } from '@bandofai/unido-components';

// ❌ Wrong - breaks when moving files
import { createApp } from '../../../core/src/index.js';
import { ProviderAdapter } from '../../providers/base/src/adapter.js';
```

Configured in [tsconfig.base.json](tsconfig.base.json):
- `@bandofai/unido-core` → `packages/core/src/`
- `@bandofai/unido-provider-base` → `packages/providers/base/src/`
- `@bandofai/unido-provider-openai` → `packages/providers/openai/src/`
- `@bandofai/unido-components` → `packages/components/src/`

### Adding a New Tool

**Step 1:** Define tool with Zod schema

```typescript
app.tool('calculate', {
  title: 'Calculator',
  description: 'Perform arithmetic operations',
  input: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number().describe('First number'),
    b: z.number().describe('Second number')
  }),
  handler: async ({ operation, a, b }) => {
    // Types are inferred: operation is 'add' | 'subtract' | ...
    // a and b are numbers

    let result: number;
    switch (operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide':
        if (b === 0) throw new Error('Division by zero');
        result = a / b;
        break;
    }

    return textResponse(`Result: ${result}`);
  }
});
```

**Step 2:** Schema automatically converts to JSON Schema via adapter

**Step 3:** Test with MCP Inspector or ChatGPT

Reference: [examples/weather-app/src/index.ts](examples/weather-app/src/index.ts)

### Creating a Provider Adapter

**Step 1:** Implement `ProviderAdapter` interface

```typescript
import { ProviderAdapter } from '@bandofai/unido-provider-base';
import type { UniversalTool, UniversalResponse } from '@bandofai/unido-core';

export class MyProviderAdapter implements ProviderAdapter {
  async convertSchema(zodSchema: ZodSchema): Promise<ProviderSchema> {
    // Convert Zod schema to provider format
  }

  async convertTool(tool: UniversalTool): Promise<ProviderTool> {
    // Convert tool definition
  }

  async convertResponse(response: UniversalResponse): Promise<ProviderResponse> {
    // Convert response format
  }

  async startServer(): Promise<void> {
    // Initialize server/transport
  }

  async stopServer(): Promise<void> {
    // Cleanup
  }
}
```

**Step 2:** Follow OpenAI adapter structure in [packages/providers/openai/](packages/providers/openai/)

**Step 3:** Handle schema conversion (Zod → Provider format)

**Step 4:** Implement transport layer (HTTP/stdio/WebSocket/etc.)

**Step 5:** Add provider config to `AppConfig.providers` in [types.ts](packages/core/src/types.ts)

**Step 6:** Create factory function

```typescript
export function myProvider(config: MyProviderConfig): ProviderConfig {
  return {
    enabled: true,
    adapter: new MyProviderAdapter(config)
  };
}
```

### Adding Components

**Step 1:** Create React component in [packages/components/src/](packages/components/src/)

```typescript
// packages/components/src/MyCard.tsx
import type { FC } from 'react';

interface MyCardProps {
  title: string;
  description: string;
}

export const MyCard: FC<MyCardProps> = ({ title, description }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};
```

**Step 2:** Export from [packages/components/src/index.ts](packages/components/src/index.ts)

```typescript
export { MyCard } from './MyCard.js';
export type { MyCardProps } from './MyCard.js';
```

**Step 3:** Register in app with `app.component()`

```typescript
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Helper to locate component source (works in src/ and dist/)
function resolveComponentPath(relativePath: string): string {
  const normalized = relativePath.startsWith('./')
    ? relativePath.slice(2)
    : relativePath;

  const distUrl = new URL(
    normalized.startsWith('components/')
      ? './' + normalized
      : './components/' + normalized,
    import.meta.url
  );
  const distPath = fileURLToPath(distUrl);

  if (existsSync(distPath)) return distPath;
  return fileURLToPath(new URL('../src/' + normalized, import.meta.url));
}

app.component({
  type: 'my-card',
  title: 'My Card',
  description: 'A custom card component',
  sourcePath: resolveComponentPath('components/MyCard.tsx'),
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,
        preferredSize: 'medium'
      }
    }
  }
});
```

**Step 4:** Use in tool handlers

```typescript
app.tool('get_data', {
  // ...
  handler: async (input) => {
    return componentResponse(
      'my-card',
      { title: 'Hello', description: 'World' },
      'Fallback: Hello World'
    );
  }
});
```

### Editing CLI Templates

**Step 1:** Edit template definitions in [packages/cli/src/templates.ts](packages/cli/src/templates.ts)

**Step 2:** Rebuild CLI

```bash
cd packages/cli
pnpm run build
```

**Step 3:** Test immediately

```bash
node dist/index.js test-app --template basic
cd test-app && pnpm install && pnpm run dev
```

Or use helper script:

```bash
./scripts/local-test.sh basic test-template-change
```

---

## Testing & Validation

### Local Development Testing

#### Method 1: Helper Script (Recommended)

```bash
./scripts/local-test.sh basic my-test
cd my-test
pnpm run dev
```

Creates test app with workspace links. Changes to packages reflected immediately.

#### Method 2: NPM Scripts

```bash
pnpm run test:basic     # Creates test-basic-app
pnpm run test:weather   # Creates test-weather-app
```

#### Method 3: Direct CLI Execution

```bash
node packages/cli/dist/index.js my-app --template basic --skip-git
cd my-app
pnpm install --ignore-workspace
pnpm run dev
```

### MCP Inspector Testing

**Setup (once per test app):**

```bash
cd test-app
pnpm add -D @modelcontextprotocol/inspector
```

**Run Inspector:**

```bash
# Start your app first: pnpm run dev

# In another terminal, run the inspector
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/list
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method resources/list
```

### Automated Testing with MCP SDK

```bash
# Start app: pnpm run dev

# Run smoke test
node --import tsx <<'NODE'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const client = new Client({ name: 'smoke-test', version: '0.0.0' });
const transport = new SSEClientTransport(new URL('http://localhost:3000/sse'));
await client.connect(transport);

console.log('Tools:', await client.listTools());
console.log('Resources:', await client.listResources());

await transport.close();
NODE
```

### Smoke Test Suite

```bash
./scripts/smoke-test.sh
```

Runs:
- ✅ Full build
- ✅ Template scaffolding (basic + weather)
- ✅ TypeScript compilation
- ✅ Server startup
- ✅ Auto cleanup

### Unit Tests

```bash
# All packages
pnpm run test

# Specific package
cd packages/core && pnpm run test
```

### Integration Tests

```bash
# Weather example app
cd examples/weather-app
pnpm install
pnpm run dev

# Test in ChatGPT or with Inspector
```

---

## Code Conventions

### 1. ES Modules Only

All packages use `"type": "module"` in `package.json`:

```typescript
// ✅ Correct - .js extension for imports
import { createApp } from './app.js';
import type { UniversalTool } from './types.js';

// ❌ Wrong - missing extension
import { createApp } from './app';
```

### 2. Strict TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 3. Monorepo Dependencies

Internal packages use `workspace:*`:

```json
{
  "dependencies": {
    "@bandofai/unido-core": "workspace:*",
    "@bandofai/unido-provider-base": "workspace:*"
  }
}
```

### 4. Build Order

Turborepo `turbo.json` configures automatic dependency builds:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // ^ means "dependencies first"
      "outputs": ["dist/**"]
    }
  }
}
```

### 5. Code Style

- Use Biome for formatting and linting
- 2-space indentation
- Single quotes for strings
- Trailing commas in multiline structures
- Explicit return types for public APIs

---

## Common Tasks

### Update Package Versions

```bash
# Update individual package
cd packages/core
npm version patch  # or minor/major

# Update CLI version constant
# Edit packages/cli/src/index.ts line 19

# Rebuild
pnpm run build
```

### Add New Dependency

```bash
# Add to specific package
cd packages/core
pnpm add zod

# Add dev dependency
pnpm add -D @types/node

# Add to root (dev tools only)
pnpm add -D -w vitest
```

### Link CLI Globally

```bash
pnpm run cli:link      # Link
pnpm run cli:unlink    # Unlink
```

### Clean Build Artifacts

```bash
# All packages
pnpm run clean

# Specific package
cd packages/core && pnpm run clean
```

### Run Linter

```bash
# Check all packages
pnpm run lint

# Auto-fix issues
pnpm run lint:fix

# Format code
pnpm run format
```

---

## Troubleshooting

### Build Errors

**Problem:** Package won't build

**Solution:**

```bash
# Clean and rebuild
pnpm run clean
pnpm install
pnpm run build

# Check for circular dependencies
pnpm list --depth=0
```

### TypeScript Errors

**Problem:** Type errors in imports

**Solution:**

1. Check path aliases in `tsconfig.base.json`
2. Ensure `.js` extensions on all imports
3. Rebuild dependencies: `pnpm run build`

```bash
# Validate types
pnpm run type-check
```

### CLI Not Updating

**Problem:** CLI changes not reflected

**Solution:**

```bash
cd packages/cli
pnpm run build

# If globally linked
pnpm link --global

# Or use direct execution
node dist/index.js test-app
```

### Module Not Found

**Problem:** `Cannot find module '@bandofai/unido-core'`

**Solution:**

```bash
# Ensure packages are built
pnpm run build

# Check workspace links
pnpm list @bandofai/unido-core

# Re-install if needed
pnpm install
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill $(lsof -ti:3000)

# Or change port in your app
openAI({ port: 3001 })
```

### Component Not Found

**Problem:** Component not rendering in ChatGPT

**Solution:**

1. Check component is registered: `app.component({ type: 'my-card', ... })`
2. Verify source path exists: `console.log(resolveComponentPath('...'))`
3. Check MCP resources: Inspector → `resources/list`
4. Verify metadata: `"openai/outputTemplate": "ui://widget/my-card.html"`

---

## Additional Resources

### Internal Documentation

- [QUICKSTART.md](QUICKSTART.md) - Daily development workflows
- [DEVELOPMENT.md](DEVELOPMENT.md) - Comprehensive development guide
- [README.md](README.md) - User-facing documentation with deployment guide
- [docs/deployment/HOSTING_OPTIONS.md](docs/deployment/HOSTING_OPTIONS.md) - Hosting platform comparison and setup guides
- [docs/deployment/PUBLISHING_GUIDE.md](docs/deployment/PUBLISHING_GUIDE.md) - Production deployment and App Store publishing
- [docs/providers/openai/troubleshooting.md](docs/providers/openai/troubleshooting.md) - OpenAI provider troubleshooting and ChatGPT debugging
- [scripts/README.md](scripts/README.md) - Helper scripts
- [examples/weather-app/](examples/weather-app/) - Complete example

### External Resources

- [Model Context Protocol Spec](https://modelcontextprotocol.io/) - MCP protocol details
- [Zod Documentation](https://zod.dev/) - Schema validation library
- [OpenAI Platform Docs](https://platform.openai.com/) - ChatGPT integration
- [Turborepo Docs](https://turbo.build/repo) - Monorepo management
- [pnpm Workspace](https://pnpm.io/workspaces) - Workspace features

---

**Happy coding! If you have questions, check [DEVELOPMENT.md](DEVELOPMENT.md) or ask the maintainers.**
