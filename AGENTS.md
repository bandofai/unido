# AGENTS.md

**Context for GitHub Copilot, Cursor AI, and other AI coding assistants** when working with this repository.

This document mirrors the expectations set for Claude Code so all AI assistants operate with the same context and conventions.

---

## 📋 Quick Navigation

1. [Project Snapshot](#project-snapshot)
2. [Core Commands](#core-commands)
3. [Architecture at a Glance](#architecture-at-a-glance)
4. [Package Responsibilities](#package-responsibilities)
5. [Typical Workflows](#typical-workflows)
6. [Agent Operating Principles](#agent-operating-principles)
7. [Testing & Validation](#testing--validation)
8. [Code Conventions & Standards](#code-conventions--standards)

---

## Project Snapshot

### What is Unido?

**Unido** - Provider-agnostic TypeScript framework for AI applications that run on multiple LLM platforms.

**Mission Statement:** "Write once, run everywhere" for AI tools, schemas, and UI components.

**Current State (January 2025):**

| Package | Version | Status |
|---------|---------|--------|
| `@bandofai/unido-core` | v0.1.3 | ✅ Production |
| `@bandofai/unido-provider-openai` | v0.1.5 | ✅ Production |
| `@bandofai/unido-provider-base` | v0.1.3 | ✅ Production |
| `@bandofai/unido-components` | v0.1.4 | ✅ Production |
| `create-unido` | v0.3.3 | ✅ Production |
| `@bandofai/unido-dev` | v0.1.0 | ✅ Production |

**Key Features:**
- ✅ HTTP/SSE server implementation (OpenAI)
- ✅ MCP (Model Context Protocol) v2025-06-18 support
- ✅ React component bundling system
- ✅ Zod schema validation
- ✅ TypeScript strict mode
- 🔜 Additional provider adapters

### Technology Stack

- **Language:** TypeScript 5.7+ (strict mode, ES2022 target)
- **Package Manager:** pnpm 10.17.1+ (workspace monorepo)
- **Build System:** Turborepo 2.3.3+ (dependency orchestration, caching)
- **Runtime:** Node.js 18+ (ES modules only)
- **Schemas:** Zod 3.25+ (runtime validation + TypeScript inference)
- **Protocol:** MCP v2025-06-18 (JSON-RPC 2.0 over HTTP/SSE)
- **HTTP Server:** Express.js (OpenAI adapter)
- **Testing:** Vitest (unit/integration tests)
- **Linting:** Biome 1.9.4+ (formatting + linting)

---

## Core Commands

### Essential Development Commands

```bash
# Installation & Setup
pnpm install                    # Install all workspace dependencies
./scripts/dev-setup.sh          # Complete automated setup

# Development Workflow
pnpm run dev                    # Watch all packages (parallel builds)
pnpm run build                  # Build all packages (with caching)
pnpm run type-check             # TypeScript validation
pnpm run lint                   # Biome linting
pnpm run lint:fix               # Auto-fix lint issues
pnpm run test                   # Run test suites
pnpm run clean                  # Remove build artifacts

# Package-Specific Operations
cd packages/core && pnpm run dev       # Watch core package
cd packages/core && pnpm run build     # Build core package
cd packages/cli && pnpm run build      # Build CLI

# CLI Testing
pnpm run cli:link               # Link CLI globally
pnpm run cli:unlink             # Unlink CLI
pnpm run cli:test my-app        # Test CLI directly
pnpm run test:basic             # Create test-basic-app
pnpm run test:weather           # Create test-weather-app
./scripts/local-test.sh basic   # Quick test helper

# Quality Assurance
./scripts/smoke-test.sh         # Full smoke test suite
pnpm run format                 # Format all code
pnpm run format:check           # Check formatting
```

### Workspace Context

This is a **pnpm workspace** managed by **Turborepo**:

- Monorepo with automatic dependency management
- Build tasks automatically build dependencies first (`^build` in `turbo.json`)
- Caching enabled for performance
- Internal packages use `workspace:*` protocol
- **Must use pnpm** - npm/yarn not supported

---

## Architecture at a Glance

### Three-Layer Adapter Pattern

```
┌──────────────────────────────────────────┐
│   LAYER 1: Universal API                 │
│   @bandofai/unido-core                    │
│                                          │
│   • Zod-powered developer interface      │
│   • Type-safe tool definitions           │
│   • Component registry                   │
│   • createApp() factory                  │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│   LAYER 2: Provider Adapters             │
│   @bandofai/unido-provider-*              │
│                                          │
│   • Schema conversion (Zod → Provider)   │
│   • Protocol translation                 │
│   • Transport implementation             │
│   • Metadata handling                    │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│   LAYER 3: AI Provider Platforms         │
│                                          │
│   • OpenAI ChatGPT (HTTP/SSE/MCP)        │
│   • Future providers (extensible)        │
└──────────────────────────────────────────┘
```

### Example: Universal Tool Definition

```typescript
// Write once...
app.tool('get_weather', {
  title: 'Get Weather',
  description: 'Get current weather for any city',
  input: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius')
  }),
  handler: async ({ city, units }) => {
    // Handler receives typed parameters
    const weather = await fetchWeather(city);

    return componentResponse(
      'weather-card',                    // Component type
      { city, temperature: weather.temp, units },  // Props
      `Weather in ${city}: ${weather.temp}°${units[0]}`  // Fallback
    );
  }
});

// ...runs on OpenAI (today) and future providers (tomorrow)
```

### Key Design Choices

#### 1. Zod Schemas - Three Benefits in One

```typescript
// Define schema once
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120)
});

// Benefit 1: TypeScript types automatically inferred
type User = z.infer<typeof userSchema>;

// Benefit 2: Runtime validation with detailed errors
const user = userSchema.parse(input);

// Benefit 3: Converts to JSON Schema for MCP
const jsonSchema = zodToJsonSchema(userSchema);
```

#### 2. Component System - Provider-Adaptive UI

```typescript
// Universal response format
return componentResponse(
  'my-card',                     // Component identifier
  { title, description, data },  // Component props (any JSON)
  'Fallback text content'        // For non-UI contexts
);

// Rendering per provider:
// - OpenAI: React → esbuild → HTML bundle → ui://widget/<type>.html
// - Future: Provider-specific rendering strategies
```

#### 3. MCP Foundation - Industry Standard Protocol

- **Protocol:** JSON-RPC 2.0
- **Transport:** HTTP + Server-Sent Events (OpenAI)
- **Specification:** Model Context Protocol v2025-06-18
- **SDK:** `@modelcontextprotocol/sdk` v1.0.6
- **Future:** Adapters can reuse or extend MCP layer

---

## Package Responsibilities

### Monorepo Layout

```
packages/
├── core/                          # @bandofai/unido-core v0.1.3
│   ├── src/types.ts              # Core type system
│   ├── src/app.ts                # Unido class, createApp()
│   ├── src/tool.ts               # Tool registration
│   ├── src/component.ts          # Component registry
│   └── src/schema.ts             # Zod utilities
│
├── providers/
│   ├── base/                      # @bandofai/unido-provider-base v0.1.3
│   │   └── src/adapter.ts        # ProviderAdapter interface
│   │
│   └── openai/                    # @bandofai/unido-provider-openai v0.1.5
│       ├── src/adapter.ts        # OpenAI adapter implementation
│       ├── src/server.ts         # HTTP/SSE server
│       └── src/bundler.ts        # Component bundling
│
├── components/                    # @bandofai/unido-components v0.1.4
│   └── src/
│       ├── Card.tsx              # UI components
│       ├── WeatherCard.tsx
│       └── index.ts
│
├── cli/                           # create-unido v0.3.3
│   ├── src/index.ts              # CLI entry (Commander.js)
│   ├── src/scaffold.ts           # Project generation
│   ├── src/templates.ts          # Template definitions
│   └── src/utils.ts              # Helpers
│
└── dev/                           # @bandofai/unido-dev v0.1.0
    └── src/                       # Development utilities
```

### Package Responsibilities Detail

#### `@bandofai/unido-core` (packages/core/)

**Purpose:** Universal API surface and type system

**Key Exports:**
- `createApp(config)` - App factory function
- `textResponse(text)` - Simple text response helper
- `componentResponse(type, props, fallback)` - UI response helper
- Types: `UniversalTool`, `UniversalResponse`, `ProviderConfig`, `ToolHandler`

**Key Files:**
- [app.ts](packages/core/src/app.ts) - `Unido` class, lifecycle management
- [types.ts](packages/core/src/types.ts) - All core type definitions
- [tool.ts](packages/core/src/tool.ts) - Tool validation and registration
- [component.ts](packages/core/src/component.ts) - Component tracking
- [schema.ts](packages/core/src/schema.ts) - Zod helpers

#### `@bandofai/unido-provider-base` (packages/providers/base/)

**Purpose:** Abstract adapter contract

**Key Export:**

```typescript
interface ProviderAdapter {
  // Schema: Zod → Provider format (e.g., JSON Schema)
  convertSchema(zodSchema: ZodSchema): Promise<ProviderSchema>;

  // Tool: Universal → Provider tool definition
  convertTool(tool: UniversalTool): Promise<ProviderTool>;

  // Response: Universal → Provider response format
  convertResponse(response: UniversalResponse): Promise<ProviderResponse>;

  // Lifecycle: Start provider server/transport
  startServer(): Promise<void>;

  // Lifecycle: Stop and cleanup
  stopServer(): Promise<void>;
}
```

#### `@bandofai/unido-provider-openai` (packages/providers/openai/)

**Purpose:** OpenAI ChatGPT integration via MCP

**Key Features:**
- MCP server implementation (JSON-RPC 2.0)
- HTTP/SSE transport with Express.js
- Component bundling (React → HTML)
- JSON Schema conversion (zod-to-json-schema)
- OpenAI-specific metadata handling

**Dependencies:**
- `@modelcontextprotocol/sdk@1.0.6` - MCP implementation
- `zod-to-json-schema@3.24.1` - Schema converter
- `express@4.x` - HTTP server
- `cors@2.x` - CORS middleware

**OpenAI Metadata Format:**

```typescript
{
  _meta: {
    "openai/outputTemplate": "ui://widget/component-type.html",
    "openai/widgetAccessible": true,  // Enable UI interactions
    "openai/renderHints": {
      "preferredSize": "medium"       // small | medium | large
    }
  }
}
```

#### `create-unido` (packages/cli/)

**Purpose:** Interactive project scaffolding

**Features:**
- Interactive prompts (Inquirer.js)
- Multiple templates (basic, weather)
- Automatic dependency installation
- Git initialization
- Development setup

**Usage:**
```bash
npx create-unido my-app
# or
pnpm create unido my-app
```

---

## Typical Workflows

### Path Aliases (CRITICAL)

**Always use configured aliases from `tsconfig.base.json`:**

```typescript
// ✅ Correct - uses workspace aliases
import { createApp } from '@bandofai/unido-core';
import { ProviderAdapter } from '@bandofai/unido-provider-base';
import { openAI } from '@bandofai/unido-provider-openai';
import { Card } from '@bandofai/unido-components';

// ❌ Wrong - relative paths break on refactoring
import { createApp } from '../../../core/src/index.js';
import { ProviderAdapter } from '../../providers/base/src/adapter.js';
```

### Adding a Tool

```typescript
// 1. Import dependencies
import { z } from 'zod';
import { textResponse } from '@bandofai/unido-core';

// 2. Define tool with Zod schema
app.tool('calculator', {
  title: 'Calculator',
  description: 'Perform basic arithmetic',
  input: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  handler: async ({ operation, a, b }) => {
    // Types automatically inferred
    let result: number;
    switch (operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide': result = a / b; break;
    }
    return textResponse(`Result: ${result}`);
  }
});

// 3. Schema automatically converts to JSON Schema via adapter
// 4. Test with MCP Inspector or ChatGPT
```

### Adding a Provider Adapter

```typescript
// 1. Implement ProviderAdapter interface
import { ProviderAdapter } from '@bandofai/unido-provider-base';

export class MyProviderAdapter implements ProviderAdapter {
  async convertSchema(zodSchema) {
    // Convert Zod → Provider format
  }

  async convertTool(tool) {
    // Convert tool definition
  }

  async convertResponse(response) {
    // Convert response format
  }

  async startServer() {
    // Initialize transport
  }

  async stopServer() {
    // Cleanup
  }
}

// 2. Create factory function
export function myProvider(config) {
  return {
    enabled: true,
    adapter: new MyProviderAdapter(config)
  };
}

// 3. Update AppConfig.providers in packages/core/src/types.ts
```

### Adding Components

```typescript
// 1. Create React component (packages/components/src/MyWidget.tsx)
export const MyWidget: FC<Props> = ({ title, data }) => {
  return <div>...</div>;
};

// 2. Export (packages/components/src/index.ts)
export { MyWidget } from './MyWidget.js';

// 3. Register in app
app.component({
  type: 'my-widget',
  title: 'My Widget',
  description: 'Custom widget',
  sourcePath: resolveComponentPath('components/MyWidget.tsx'),
  metadata: {
    openai: {
      renderHints: { widgetAccessible: true }
    }
  }
});

// 4. Use in tools
return componentResponse('my-widget', { title, data }, 'Fallback');
```

---

## Agent Operating Principles

### Code Quality Standards

1. **Package Manager:** Use pnpm exclusively (no npm/yarn)
2. **Encoding:** Maintain ASCII unless file already uses Unicode
3. **Formatting:** Follow Biome configuration (2-space indent, single quotes)
4. **Imports:** Use path aliases, include `.js` extensions
5. **Types:** Explicit return types for public APIs
6. **Comments:** Document non-obvious logic, skip trivial narration
7. **Testing:** Write tests for new features/fixes
8. **Error Handling:** Use proper error types, meaningful messages

### Development Workflow

1. **Before Editing:**
   - Read relevant files first
   - Understand existing patterns
   - Check for similar implementations

2. **When Writing Code:**
   - Follow existing style
   - Use TypeScript strict mode
   - Maintain adapter abstraction
   - Document public APIs

3. **Before Committing:**
   - Run `pnpm run build`
   - Run `pnpm run type-check`
   - Run `pnpm run lint`
   - Test changes locally

### TypeScript Execution

Prefer `node --import tsx` for TypeScript execution:

```bash
# ✅ Correct - CLI dev scripts use this
node --import tsx src/index.ts

# Package.json example
{
  "scripts": {
    "dev": "node --import tsx src/index.ts"
  }
}
```

---

## Testing & Validation

### Local Testing Methods

#### Method 1: Helper Script (Fastest)

```bash
./scripts/local-test.sh basic my-test
cd my-test && pnpm run dev
```

#### Method 2: NPM Scripts

```bash
pnpm run test:basic      # test-basic-app
pnpm run test:weather    # test-weather-app
```

#### Method 3: Direct CLI

```bash
node packages/cli/dist/index.js my-app --template basic
cd my-app && pnpm install --ignore-workspace && pnpm run dev
```

### MCP Inspector

```bash
# In test app
pnpm add -D @modelcontextprotocol/inspector

# Start app
pnpm run dev

# Run inspector
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/list
```

### Automated Testing

```bash
# Smoke tests
./scripts/smoke-test.sh

# Unit tests
pnpm run test

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

### MCP SDK Automation

```bash
node --import tsx <<'NODE'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const client = new Client({ name: 'test', version: '0.0.0' });
const transport = new SSEClientTransport(new URL('http://localhost:3000/sse'));
await client.connect(transport);

console.log('Tools:', await client.listTools());
console.log('Resources:', await client.listResources());

await transport.close();
NODE
```

---

## Code Conventions & Standards

### 1. ES Modules Only

```typescript
// ✅ Correct
import { createApp } from './app.js';
import type { Tool } from './types.js';

// ❌ Wrong
import { createApp } from './app';  // Missing .js
const app = require('./app');       // No CommonJS
```

### 2. TypeScript Strict Mode

All packages use strict TypeScript:

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

```json
{
  "dependencies": {
    "@bandofai/unido-core": "workspace:*",
    "@bandofai/unido-provider-base": "workspace:*",
    "zod": "^3.25.0"  // External packages use semver
  }
}
```

### 4. Code Style

- **Formatter:** Biome (auto-configured)
- **Indentation:** 2 spaces
- **Quotes:** Single quotes
- **Semicolons:** Always
- **Trailing Commas:** Yes (multiline)
- **Line Length:** 100 characters (soft limit)

### 5. Git Commit Messages

```bash
# Format: <type>(<scope>): <subject>

# Examples:
feat(core): add tool validation
fix(cli): resolve template path bug
docs(readme): update installation steps
chore(deps): bump zod to 3.25.1
```

---

## Additional Resources

### Documentation

- [CLAUDE.md](CLAUDE.md) - Comprehensive guide for Claude Code
- [QUICKSTART.md](QUICKSTART.md) - Daily development reference
- [DEVELOPMENT.md](DEVELOPMENT.md) - Full development guide
- [README.md](README.md) - User-facing documentation
- [scripts/README.md](scripts/README.md) - Helper scripts

### Examples

- [examples/weather-app/](examples/weather-app/) - Complete example app

### External Links

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP spec
- [Zod Documentation](https://zod.dev/) - Schema library
- [Turborepo Docs](https://turbo.build/repo) - Monorepo tool
- [pnpm Workspaces](https://pnpm.io/workspaces) - Package manager

---

**By following these guidelines, AI agents stay aligned with the project's architecture, conventions, and quality standards while maintaining provider-agnostic design principles.**
