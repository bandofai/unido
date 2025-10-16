# GEMINI.md

**Context for Google Gemini Code Assist** when working with this repository.

This document provides comprehensive context for the Gemini code-along agent to understand project structure, conventions, architecture, and development workflows.

---

## 📋 Contents

1. [Project Overview](#project-overview)
2. [Quick Commands](#quick-commands)
3. [Architecture & Design](#architecture--design)
4. [Package Guide](#package-guide)
5. [Development Workflows](#development-workflows)
6. [Testing Strategies](#testing-strategies)
7. [Code Standards](#code-standards)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is Unido?

**Unido** is a provider-agnostic TypeScript framework for building AI applications that work seamlessly across multiple AI platforms.

**Core Principle:** Write once, run everywhere - define tools and components once, deploy to any AI provider.

**Current Status (January 2025):**

```
Production Ready Components:
├── @bandofai/unido-core (v0.1.3)
│   └── Universal API, type system, tool/component registration
├── @bandofai/unido-provider-openai (v0.1.5)
│   └── OpenAI ChatGPT integration via MCP protocol
├── @bandofai/unido-provider-base (v0.1.3)
│   └── Abstract adapter interface for providers
├── @bandofai/unido-components (v0.1.4)
│   └── React component library
├── create-unido (v0.3.3)
│   └── CLI scaffolding tool
└── @bandofai/unido-dev (v0.1.0)
    └── Development utilities
```

### Technology Stack

| Category | Technology |
|----------|-----------|
| **Language** | TypeScript 5.7+ (strict mode, ES2022) |
| **Runtime** | Node.js 18+ |
| **Package Manager** | pnpm 10.17.1+ (workspaces) |
| **Build System** | Turborepo 2.3.3+ |
| **Module System** | ES Modules only (no CommonJS) |
| **Validation** | Zod 3.25+ |
| **Protocol** | MCP v2025-06-18 (JSON-RPC 2.0) |
| **HTTP Server** | Express.js 4.x |
| **UI Framework** | React 18.x |
| **Testing** | Vitest 2.x |
| **Linting/Formatting** | Biome 1.9.4+ |

### Key Differentiators

1. **Provider Agnostic** - Write tools once, run on any AI platform
2. **Type Safe** - Full TypeScript inference from Zod schemas
3. **Runtime Validated** - Automatic input validation with detailed errors
4. **Rich UI** - Component system with provider-adaptive rendering
5. **Industry Standard** - Built on Model Context Protocol (MCP)
6. **Developer Friendly** - CLI scaffolding, hot reload, clear errors

---

## Quick Commands

### Development Essentials

```bash
# Initial Setup
pnpm install                    # Install dependencies
./scripts/dev-setup.sh          # Automated setup (recommended)

# Development Mode
pnpm run dev                    # Watch all packages (parallel)
pnpm run build                  # Build all packages
pnpm run type-check             # TypeScript validation
pnpm run lint                   # Run linter
pnpm run lint:fix               # Auto-fix issues
pnpm run test                   # Run test suites
pnpm run clean                  # Remove build artifacts

# CLI Testing
pnpm run cli:test my-app        # Test CLI directly
pnpm run test:basic             # Create test-basic-app
pnpm run test:weather           # Create test-weather-app
./scripts/local-test.sh basic   # Quick test helper
./scripts/smoke-test.sh         # Full smoke tests

# Package Operations
cd packages/core && pnpm run dev       # Watch specific package
cd packages/core && pnpm run build     # Build specific package
cd packages/cli && pnpm run build      # Rebuild CLI

# Formatting & Quality
pnpm run format                 # Format all code
pnpm run format:check           # Check formatting
```

### Package Manager Notes

**Important:** This project uses **pnpm exclusively**:

```bash
# ✅ Correct
pnpm install
pnpm add zod
pnpm run dev

# ❌ Wrong - will break workspace
npm install
yarn install
```

**Why pnpm?**
- Efficient disk space usage (content-addressable storage)
- Strict dependency resolution (no phantom dependencies)
- Fast installation
- Native workspace support

---

## Architecture & Design

### Three-Layer Architecture

```
┌───────────────────────────────────────────────┐
│  LAYER 1: Universal API                       │
│  Package: @bandofai/unido-core                 │
│                                               │
│  Purpose: Developer-facing interface          │
│  • Zod schemas for type safety                │
│  • Tool and component registration            │
│  • Universal response format                  │
│  • createApp() factory                        │
└────────────────┬──────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────┐
│  LAYER 2: Provider Adapters                   │
│  Package: @bandofai/unido-provider-*           │
│                                               │
│  Purpose: Protocol translation                │
│  • Schema conversion (Zod → Provider)         │
│  • Tool conversion                            │
│  • Response conversion                        │
│  • Transport implementation                   │
│  • Component bundling (provider-specific)     │
└────────────────┬──────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────┐
│  LAYER 3: AI Provider Platforms               │
│                                               │
│  Currently Supported:                         │
│  • OpenAI ChatGPT (HTTP/SSE/MCP)              │
│                                               │
│  Future Support:                              │
│  • Additional providers (architecture ready)  │
└───────────────────────────────────────────────┘
```

### Example: Universal Tool

```typescript
// Universal tool definition (Layer 1)
app.tool('get_weather', {
  title: 'Get Weather',
  description: 'Get current weather for any city',
  input: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius')
  }),
  handler: async ({ city, units }) => {
    // TypeScript knows: city is string, units is 'celsius' | 'fahrenheit'
    const weather = await fetchWeatherAPI(city);

    // Universal response format
    return componentResponse(
      'weather-card',                           // Component type
      { city, temperature: weather.temp, units },  // Props (any JSON)
      `Weather in ${city}: ${weather.temp}°${units[0]}`  // Fallback text
    );
  }
});

// Adapter converts to provider-specific format (Layer 2)
// - OpenAI: JSON Schema + HTTP/SSE + MCP
// - Future: Provider-specific implementations

// Provider receives converted format (Layer 3)
// - OpenAI ChatGPT: Displays component in chat
```

### Design Decisions

#### 1. Zod for Schema Definition

**Rationale:** Single source of truth for types, validation, and documentation

**Benefits:**

```typescript
// Define schema once
const weatherInput = z.object({
  city: z.string().min(1).describe('City name'),
  units: z.enum(['celsius', 'fahrenheit']).default('celsius').describe('Temperature units')
});

// Benefit 1: TypeScript types automatically inferred
type WeatherInput = z.infer<typeof weatherInput>;
// Result: { city: string; units?: 'celsius' | 'fahrenheit' }

// Benefit 2: Runtime validation with detailed errors
try {
  const input = weatherInput.parse(userInput);
} catch (error) {
  // Zod provides detailed validation errors
}

// Benefit 3: Converts to JSON Schema for MCP
const jsonSchema = zodToJsonSchema(weatherInput);
// Result: { type: 'object', properties: { ... }, required: [...] }

// Benefit 4: Descriptions become documentation
// "City name" and "Temperature units" appear in AI interface
```

#### 2. Component System

**Rationale:** Rich, interactive UI with provider-adaptive rendering

**How it works:**

```typescript
// 1. Define React component (packages/components/src/)
export const WeatherCard: FC<Props> = ({ city, temperature, condition }) => {
  return (
    <div className="weather-card">
      <h2>{city}</h2>
      <p>{temperature}°</p>
      <p>{condition}</p>
    </div>
  );
};

// 2. Register component in app
app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Displays weather information',
  sourcePath: resolveComponentPath('components/WeatherCard.tsx'),
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,  // Allow user interaction
        preferredSize: 'medium'  // small | medium | large
      }
    }
  }
});

// 3. Return from tool handler
return componentResponse(
  'weather-card',                           // Type matches registration
  { city: 'Paris', temperature: 22, condition: 'Sunny' },  // Props
  'Weather in Paris: 22°C, Sunny'          // Fallback for non-UI contexts
);

// 4. Adapter handles provider-specific rendering:
// - OpenAI: Bundles React → HTML, exposes as ui://widget/weather-card.html
// - Future: Other rendering strategies
```

**Component Lifecycle:**
1. Registration: Component metadata stored in registry
2. Startup: Components bundled for provider (OpenAI: React → HTML)
3. Exposure: Bundles exposed as MCP resources
4. Fetch: Provider fetches bundle when needed
5. Render: Provider-specific rendering in interface

#### 3. MCP (Model Context Protocol) Foundation

**Rationale:** Industry-standard protocol for AI tool integration

**Specification:**
- Protocol: JSON-RPC 2.0
- Transport: HTTP + Server-Sent Events (OpenAI)
- Version: v2025-06-18
- SDK: `@modelcontextprotocol/sdk` v1.0.6

**MCP Endpoints (OpenAI):**

```typescript
// Server-Sent Events endpoint
GET  http://localhost:3000/sse

// Health check
GET  http://localhost:3000/health

// Tool invocation (JSON-RPC over HTTP)
POST http://localhost:3000/sse
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Why MCP?**
- Industry standard (supported by multiple platforms)
- Well-defined specification
- Existing ecosystem and tooling
- Future-proof (extensible)

---

## Package Guide

### Package Structure

```
packages/
├── core/                          @bandofai/unido-core (v0.1.3)
│   ├── src/
│   │   ├── app.ts                Unido class, createApp() factory
│   │   ├── types.ts              Core type definitions
│   │   ├── tool.ts               Tool registration system
│   │   ├── component.ts          Component registry
│   │   ├── schema.ts             Zod utilities
│   │   └── index.ts              Public exports
│   └── package.json
│
├── providers/
│   ├── base/                      @bandofai/unido-provider-base (v0.1.3)
│   │   ├── src/adapter.ts        ProviderAdapter interface
│   │   └── package.json
│   │
│   └── openai/                    @bandofai/unido-provider-openai (v0.1.5)
│       ├── src/
│       │   ├── adapter.ts        OpenAI adapter implementation
│       │   ├── server.ts         HTTP/SSE server setup
│       │   ├── bundler.ts        Component bundling logic
│       │   └── index.ts          Public exports
│       └── package.json
│
├── components/                    @bandofai/unido-components (v0.1.4)
│   ├── src/
│   │   ├── Card.tsx              Basic card component
│   │   ├── WeatherCard.tsx       Weather display component
│   │   ├── types.ts              Shared types
│   │   └── index.ts              Exports
│   └── package.json
│
├── cli/                           create-unido (v0.3.3)
│   ├── src/
│   │   ├── index.ts              CLI entry (Commander.js)
│   │   ├── scaffold.ts           Project generation
│   │   ├── templates.ts          Template definitions
│   │   └── utils.ts              Helpers
│   └── package.json
│
└── dev/                           @bandofai/unido-dev (v0.1.0)
    ├── src/                       Development utilities
    └── package.json
```

### Core Package Responsibilities

#### `@bandofai/unido-core`

**Exports:**

```typescript
// Factory function
export function createApp(config: AppConfig): Unido;

// Response helpers
export function textResponse(text: string): UniversalResponse;
export function componentResponse(
  type: string,
  props: unknown,
  fallbackText: string
): UniversalResponse;

// Types
export type {
  UniversalTool,
  UniversalResponse,
  ProviderConfig,
  ToolHandler,
  ComponentDefinition,
  AppConfig
};
```

**Key Files:**

- **[app.ts](packages/core/src/app.ts)**
  - `Unido` class implementation
  - `createApp()` factory function
  - Lifecycle management (startup, shutdown)
  - Provider initialization
  - Tool/component registration

- **[types.ts](packages/core/src/types.ts)**
  - All core type definitions
  - Interface contracts
  - Type guards

- **[tool.ts](packages/core/src/tool.ts)**
  - Tool validation logic
  - Handler wrapping
  - Metadata management

- **[component.ts](packages/core/src/component.ts)**
  - Component registry
  - Source path resolution
  - Metadata tracking

#### `@bandofai/unido-provider-base`

**Exports:**

```typescript
export interface ProviderAdapter {
  // Schema conversion: Zod → Provider-specific format
  convertSchema(zodSchema: ZodSchema): Promise<unknown>;

  // Tool conversion: Universal → Provider tool definition
  convertTool(tool: UniversalTool): Promise<unknown>;

  // Response conversion: Universal → Provider response
  convertResponse(response: UniversalResponse): Promise<unknown>;

  // Lifecycle: Initialize provider server/transport
  startServer(): Promise<void>;

  // Lifecycle: Cleanup and shutdown
  stopServer(): Promise<void>;
}
```

#### `@bandofai/unido-provider-openai`

**Key Features:**
- MCP server implementation
- HTTP/SSE transport
- Component bundling (React → HTML)
- JSON Schema conversion
- OpenAI metadata handling

**OpenAI-Specific Metadata:**

```typescript
{
  _meta: {
    // Widget URL for component rendering
    "openai/outputTemplate": "ui://widget/component-type.html",

    // Enable UI interactions (click, input, etc.)
    "openai/widgetAccessible": true,

    // Rendering preferences
    "openai/renderHints": {
      "preferredSize": "small" | "medium" | "large",
      "supportsStreaming": boolean
    }
  }
}
```

**Dependencies:**
- `@modelcontextprotocol/sdk@1.0.6` - MCP protocol
- `zod-to-json-schema@3.24.1` - Schema conversion
- `express@4.x` - HTTP server
- `cors@2.x` - CORS middleware
- `esbuild` - Component bundling (future)

---

## Development Workflows

### TypeScript Path Aliases (Critical)

**Always use configured aliases from `tsconfig.base.json`:**

```typescript
// ✅ Correct - uses workspace aliases
import { createApp, textResponse } from '@bandofai/unido-core';
import { ProviderAdapter } from '@bandofai/unido-provider-base';
import { openAI } from '@bandofai/unido-provider-openai';
import { Card, WeatherCard } from '@bandofai/unido-components';

// ❌ Wrong - relative paths break on refactoring
import { createApp } from '../../../core/src/index.js';
import { ProviderAdapter } from '../../providers/base/src/adapter.js';
import { openAI } from '../providers/openai/src/index.js';

// ❌ Wrong - missing .js extension
import { createApp } from './app';
import type { Tool } from './types';
```

**Alias Configuration (`tsconfig.base.json`):**

```json
{
  "compilerOptions": {
    "paths": {
      "@bandofai/unido-core": ["packages/core/src"],
      "@bandofai/unido-provider-base": ["packages/providers/base/src"],
      "@bandofai/unido-provider-openai": ["packages/providers/openai/src"],
      "@bandofai/unido-components": ["packages/components/src"]
    }
  }
}
```

### Adding a Tool (Step-by-Step)

**1. Import Dependencies**

```typescript
import { createApp, textResponse, componentResponse } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';
```

**2. Define Schema with Zod**

```typescript
const calculatorInput = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('Arithmetic operation to perform'),
  a: z.number().describe('First number'),
  b: z.number().describe('Second number')
});
```

**3. Register Tool**

```typescript
app.tool('calculator', {
  title: 'Calculator',
  description: 'Perform basic arithmetic operations',
  input: calculatorInput,
  handler: async ({ operation, a, b }) => {
    // TypeScript infers types:
    // operation: 'add' | 'subtract' | 'multiply' | 'divide'
    // a: number
    // b: number

    let result: number;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          throw new Error('Division by zero');
        }
        result = a / b;
        break;
    }

    return textResponse(`Result: ${result}`);
  }
});
```

**4. Test**

```bash
pnpm run dev                    # Start app
# In another terminal:
pnpm add -D @modelcontextprotocol/inspector
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/call --params '{"name":"calculator","arguments":{"operation":"add","a":5,"b":3}}'
```

### Adding a Component (Step-by-Step)

**1. Create React Component**

```typescript
// packages/components/src/DataCard.tsx
import type { FC } from 'react';

export interface DataCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const DataCard: FC<DataCardProps> = ({ title, value, unit, trend }) => {
  return (
    <div className="data-card">
      <h3>{title}</h3>
      <div className="value">
        {value} {unit}
      </div>
      {trend && <div className={`trend-${trend}`}>{trend}</div>}
    </div>
  );
};
```

**2. Export from Package**

```typescript
// packages/components/src/index.ts
export { Card } from './Card.js';
export { WeatherCard } from './WeatherCard.js';
export { DataCard } from './DataCard.js';  // Add new export
export type { DataCardProps } from './DataCard.js';
```

**3. Register in App**

```typescript
// In your app (e.g., src/index.ts)
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Helper function to locate component source
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

// Register component
app.component({
  type: 'data-card',
  title: 'Data Card',
  description: 'Displays a data metric with optional trend indicator',
  sourcePath: resolveComponentPath('components/DataCard.tsx'),
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

**4. Use in Tool Handler**

```typescript
app.tool('get_metrics', {
  title: 'Get Metrics',
  description: 'Get application metrics',
  input: z.object({
    metricName: z.string()
  }),
  handler: async ({ metricName }) => {
    const metric = await fetchMetric(metricName);

    return componentResponse(
      'data-card',
      {
        title: metric.name,
        value: metric.value,
        unit: metric.unit,
        trend: metric.trend
      },
      `${metric.name}: ${metric.value} ${metric.unit}`
    );
  }
});
```

### Creating a Provider Adapter (Advanced)

**1. Implement Interface**

```typescript
// packages/providers/my-provider/src/adapter.ts
import { ProviderAdapter } from '@bandofai/unido-provider-base';
import type { UniversalTool, UniversalResponse } from '@bandofai/unido-core';
import type { ZodSchema } from 'zod';

export class MyProviderAdapter implements ProviderAdapter {
  private config: MyProviderConfig;

  constructor(config: MyProviderConfig) {
    this.config = config;
  }

  async convertSchema(zodSchema: ZodSchema): Promise<MyProviderSchema> {
    // Convert Zod schema to provider-specific format
    // Example: JSON Schema, GraphQL schema, etc.
    return {
      // Your schema format
    };
  }

  async convertTool(tool: UniversalTool): Promise<MyProviderTool> {
    // Convert universal tool to provider format
    return {
      name: tool.name,
      description: tool.description,
      // Provider-specific fields
    };
  }

  async convertResponse(response: UniversalResponse): Promise<MyProviderResponse> {
    // Convert universal response to provider format
    return {
      // Provider-specific response format
    };
  }

  async startServer(): Promise<void> {
    // Initialize server/transport
    // Examples: HTTP server, WebSocket, stdin/stdout, etc.
  }

  async stopServer(): Promise<void> {
    // Cleanup resources
  }
}
```

**2. Create Factory Function**

```typescript
// packages/providers/my-provider/src/index.ts
import { MyProviderAdapter } from './adapter.js';
import type { ProviderConfig } from '@bandofai/unido-core';

export interface MyProviderConfig {
  port: number;
  host: string;
  // Provider-specific config
}

export function myProvider(config: MyProviderConfig): ProviderConfig {
  return {
    enabled: true,
    adapter: new MyProviderAdapter(config)
  };
}
```

**3. Update Core Types**

```typescript
// packages/core/src/types.ts
export interface AppConfig {
  name: string;
  version: string;
  providers: {
    openai?: ProviderConfig;
    myProvider?: ProviderConfig;  // Add new provider
  };
}
```

**4. Use in App**

```typescript
import { createApp } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { myProvider } from '@bandofai/unido-provider-my-provider';

const app = createApp({
  name: 'my-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 }),
    myProvider: myProvider({ port: 3001, host: 'localhost' })
  }
});
```

---

## Testing Strategies

### Local Development Testing

#### Method 1: Helper Script (Fastest)

```bash
./scripts/local-test.sh basic my-test-app
cd my-test-app
pnpm run dev
```

**Advantages:**
- Creates app with workspace links
- Changes reflected immediately
- Auto cleanup instructions

#### Method 2: NPM Scripts

```bash
pnpm run test:basic      # Creates test-basic-app
pnpm run test:weather    # Creates test-weather-app

cd test-basic-app
pnpm run dev
```

#### Method 3: Direct CLI

```bash
# Build CLI first
cd packages/cli
pnpm run build

# Run CLI
node dist/index.js my-app --template basic --skip-git

# Setup app
cd my-app
pnpm install --ignore-workspace  # Links to workspace packages
pnpm run dev
```

### MCP Inspector Testing

**Setup:**

```bash
cd test-app
pnpm add -D @modelcontextprotocol/inspector
```

**List Tools:**

```bash
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/list
```

**List Resources:**

```bash
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method resources/list
```

**Call Tool:**

```bash
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/call --params '{"name":"tool_name","arguments":{"param":"value"}}'
```

### Automated Testing

**Smoke Tests:**

```bash
./scripts/smoke-test.sh
```

Tests:
- ✅ All packages build
- ✅ Both templates scaffold correctly
- ✅ TypeScript compiles
- ✅ Server starts successfully

**Unit Tests:**

```bash
# All packages
pnpm run test

# Specific package
cd packages/core
pnpm run test
```

**Type Checking:**

```bash
pnpm run type-check
```

**Linting:**

```bash
pnpm run lint         # Check
pnpm run lint:fix     # Fix
```

### MCP SDK Automation

```bash
node --import tsx <<'NODE'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const client = new Client({ name: 'test-client', version: '0.0.0' });
const transport = new SSEClientTransport(new URL('http://localhost:3000/sse'));

try {
  await client.connect(transport);

  const tools = await client.listTools();
  console.log('Available tools:', tools);

  const resources = await client.listResources();
  console.log('Available resources:', resources);

  // Call a tool
  const result = await client.callTool('tool_name', { param: 'value' });
  console.log('Tool result:', result);

} finally {
  await transport.close();
}
NODE
```

---

## Code Standards

### 1. ES Modules Only

All packages use `"type": "module"`:

```typescript
// ✅ Correct - .js extension required
import { createApp } from './app.js';
import type { Tool } from './types.js';

// ❌ Wrong - missing extension
import { createApp } from './app';

// ❌ Wrong - CommonJS not supported
const app = require('./app');
module.exports = { app };
```

### 2. Strict TypeScript

All packages use strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### 3. Workspace Dependencies

```json
{
  "dependencies": {
    // Internal packages use workspace protocol
    "@bandofai/unido-core": "workspace:*",
    "@bandofai/unido-provider-base": "workspace:*",

    // External packages use semver
    "zod": "^3.25.0",
    "express": "^4.18.0"
  }
}
```

### 4. Code Style (Biome)

```javascript
// Indentation: 2 spaces
function example() {
  const value = 123;
  return value;
}

// Quotes: Single quotes
const str = 'hello';

// Semicolons: Always
const x = 1;
const y = 2;

// Trailing commas: Yes (multiline)
const obj = {
  a: 1,
  b: 2,
};

// Line length: 100 characters (soft limit)
```

### 5. Documentation

```typescript
/**
 * Creates a new Unido application.
 *
 * @param config - Application configuration
 * @returns Unido application instance
 *
 * @example
 * ```ts
 * const app = createApp({
 *   name: 'my-app',
 *   version: '1.0.0',
 *   providers: {
 *     openai: openAI({ port: 3000 })
 *   }
 * });
 * ```
 */
export function createApp(config: AppConfig): Unido {
  // Implementation
}
```

---

## Common Patterns

### Component Path Resolution

```typescript
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Resolves component path in both src/ and dist/ contexts.
 * Required because apps can run from source (dev) or build (prod).
 */
function resolveComponentPath(relativePath: string): string {
  const normalized = relativePath.startsWith('./')
    ? relativePath.slice(2)
    : relativePath;

  // Try dist/ first
  const distUrl = new URL(
    normalized.startsWith('components/')
      ? './' + normalized
      : './components/' + normalized,
    import.meta.url
  );
  const distPath = fileURLToPath(distUrl);

  if (existsSync(distPath)) return distPath;

  // Fall back to src/
  return fileURLToPath(new URL('../src/' + normalized, import.meta.url));
}

// Usage
app.component({
  type: 'my-card',
  sourcePath: resolveComponentPath('components/MyCard.tsx'),
  // ...
});
```

### Error Handling in Tool Handlers

```typescript
app.tool('fetch_data', {
  title: 'Fetch Data',
  description: 'Fetch data from API',
  input: z.object({
    endpoint: z.string().url()
  }),
  handler: async ({ endpoint }) => {
    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return textResponse(JSON.stringify(data, null, 2));

    } catch (error) {
      // Return error as text response (shown to AI/user)
      const message = error instanceof Error ? error.message : String(error);
      return textResponse(`Error: ${message}`);
    }
  }
});
```

### Conditional Component Rendering

```typescript
app.tool('get_status', {
  title: 'Get Status',
  description: 'Get system status',
  input: z.object({
    includeDetails: z.boolean().default(false)
  }),
  handler: async ({ includeDetails }) => {
    const status = await getSystemStatus();

    // Return component or text based on details flag
    if (includeDetails) {
      return componentResponse(
        'status-card',
        { ...status, timestamp: Date.now() },
        `Status: ${status.state}`
      );
    } else {
      return textResponse(`System is ${status.state}`);
    }
  }
});
```

---

## Troubleshooting

### Build Issues

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

**Problem:** `Type error in imports`

**Solution:**

1. Check `.js` extensions on all imports
2. Verify path aliases in `tsconfig.base.json`
3. Rebuild dependencies: `pnpm run build`
4. Clear TypeScript cache: `rm -rf packages/*/tsconfig.tsbuildinfo`

### CLI Issues

**Problem:** CLI changes not reflected

**Solution:**

```bash
cd packages/cli
pnpm run build

# If using global link
pnpm link --global

# Or use direct execution
node dist/index.js test-app
```

### Runtime Issues

**Problem:** Port already in use

**Solution:**

```bash
# Find process
lsof -ti:3000

# Kill process
kill $(lsof -ti:3000)

# Or use different port
openAI({ port: 3001 })
```

**Problem:** Component not rendering

**Solution:**

1. Verify component registered: `app.component({ type: 'my-card', ... })`
2. Check source path exists: `console.log(resolveComponentPath('...'))`
3. Inspect MCP resources: Inspector → `resources/list`
4. Verify metadata: `"openai/outputTemplate": "ui://widget/my-card.html"`

---

## Additional Resources

### Internal Documentation

- [CLAUDE.md](CLAUDE.md) - Comprehensive guide (this format)
- [AGENTS.md](AGENTS.md) - Guide for AI coding assistants
- [QUICKSTART.md](QUICKSTART.md) - Daily development reference
- [DEVELOPMENT.md](DEVELOPMENT.md) - Full development guide
- [README.md](README.md) - User documentation
- [scripts/README.md](scripts/README.md) - Helper scripts

### Examples

- [examples/weather-app/](examples/weather-app/) - Complete example app

### External Resources

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [Zod Documentation](https://zod.dev/) - Schema validation
- [OpenAI Platform](https://platform.openai.com/) - ChatGPT integration
- [Turborepo](https://turbo.build/repo) - Monorepo management
- [pnpm Workspaces](https://pnpm.io/workspaces) - Package manager

---

**Happy coding! For questions, refer to [DEVELOPMENT.md](DEVELOPMENT.md) or consult the maintainers.**
