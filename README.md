# 🌐 Unido

**Build AI applications once, deploy them everywhere.**

Unido is a TypeScript framework that lets you create custom tools and interfaces for AI assistants (ChatGPT, Claude, Gemini) using a single codebase. Write your tool logic once, and Unido automatically adapts it to work with different AI platforms.

[![npm version](https://img.shields.io/npm/v/create-unido)](https://www.npmjs.com/package/create-unido)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.17-orange)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 🎯 What Problem Does Unido Solve?

Every AI platform has its own way of defining custom tools:
- **OpenAI** uses HTTP servers with JSON Schema
- **Claude** uses stdio with Model Context Protocol
- **Gemini** has its own tool format
- **Future platforms** will likely have different approaches

**The problem:** If you want to build a custom tool (like a weather app, calculator, or database query tool), you need to write separate implementations for each platform.

**Unido's solution:** Write your tool **once** using Unido's universal API, and it automatically works across all supported AI platforms.

---

## ⚡ Quick Example

Here's a complete weather tool that works in both ChatGPT and Claude Desktop:

```typescript
import { createApp, textResponse } from '@unido/core';
import { openAI } from '@unido/provider-openai';
import { claude } from '@unido/provider-claude';
import { z } from 'zod';

// Create your app with multiple providers
const app = createApp({
  name: 'weather-app',
  providers: {
    openai: openAI({ port: 3000 }),      // For ChatGPT
    claude: claude({ transport: 'stdio' }) // For Claude Desktop
  }
});

// Define your tool once
app.tool('get_weather', {
  description: 'Get current weather for a city',
  input: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius')
  }),
  handler: async ({ city, units }) => {
    // Your business logic
    const weather = await fetchWeatherFromAPI(city, units);

    return textResponse(
      `Weather in ${city}: ${weather.temp}°${units === 'celsius' ? 'C' : 'F'}`
    );
  }
});

// Start the server
await app.listen();
// ✅ OpenAI server running on http://localhost:3000
// ✅ Claude stdio server ready
```

That's it! Your weather tool now works in:
- ✅ ChatGPT (via OpenAI Apps)
- ✅ Claude Desktop (via MCP)
- ✅ Any future platform you add

---

## 🚀 Getting Started

### Quick Start with CLI (Recommended)

The fastest way to get started is using the interactive CLI:

```bash
# Create a new Unido app
pnpm create unido

# Or with npm
npm create unido

# Or with npx
npx create-unido
```

This will scaffold a complete project with:
- ✅ Your choice of template (basic, weather, or multi-provider)
- ✅ TypeScript configuration
- ✅ All necessary dependencies
- ✅ Ready-to-run example code

> **Note:** The CLI (`create-unido`) is published and available on npm, but the core Unido packages (`@unido/core`, `@unido/provider-openai`, `@unido/provider-claude`) need to be published before the generated projects will work. See [Publishing Status](#publishing-status) below.

### Manual Setup

If you prefer to set up your project manually without the CLI, follow these steps:

#### Step 1: Create a New Project

```bash
# Create project directory
mkdir my-unido-app
cd my-unido-app

# Initialize package.json
pnpm init
# or
npm init -y
```

#### Step 2: Install Dependencies

```bash
# Install Unido packages
pnpm add @unido/core @unido/provider-openai zod

# For Claude support, also add:
pnpm add @unido/provider-claude

# Or use npm:
npm install @unido/core @unido/provider-openai @unido/provider-claude zod
```

#### Step 3: Install Dev Dependencies

```bash
pnpm add -D typescript @types/node tsx

# Or with npm:
npm install --save-dev typescript @types/node tsx
```

#### Step 4: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Step 5: Update package.json

Add these fields to your `package.json`:

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Step 6: Create Your Application

Create `src/index.ts`:

```typescript
import { createApp, textResponse } from '@unido/core';
import { openAI } from '@unido/provider-openai';
import { z } from 'zod';

const app = createApp({
  name: 'my-unido-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});

// Define your first tool
app.tool('greet', {
  description: 'Greet a user by name',
  input: z.object({
    name: z.string().describe('User\'s name')
  }),
  handler: async ({ name }) => {
    return textResponse(`Hello, ${name}! 👋`);
  }
});

// Start the server
await app.listen();
console.log('🚀 Unido app is running!');
```

#### Step 7: Create .gitignore

Create `.gitignore`:

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
*.tsbuildinfo

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Logs
*.log
```

#### Step 8: Run Your App

```bash
# Development mode (with hot reload)
pnpm run dev

# Or with npm:
npm run dev
```

#### Step 9: Connect to ChatGPT

1. Your server is now running on `http://localhost:3000`
2. Open ChatGPT
3. Go to **Settings → Apps**
4. Click **Add Server**
5. Enter your server URL: `http://localhost:3000`
6. Test it by asking ChatGPT: "Greet me with my name"

That's it! Now ChatGPT can use your custom tool!

---

### Manual Setup for Claude Desktop

If you want to use Claude Desktop instead of (or in addition to) OpenAI:

#### Step 1: Update src/index.ts

```typescript
import { createApp, textResponse } from '@unido/core';
import { claude } from '@unido/provider-claude';
import { z } from 'zod';

const app = createApp({
  name: 'my-unido-app',
  version: '1.0.0',
  providers: {
    claude: claude({ transport: 'stdio' })
  }
});

app.tool('greet', {
  description: 'Greet a user by name',
  input: z.object({
    name: z.string().describe('User\'s name')
  }),
  handler: async ({ name }) => {
    return textResponse(`Hello, ${name}! 👋`);
  }
});

await app.listen();
```

#### Step 2: Build Your App

```bash
pnpm run build
```

#### Step 3: Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-unido-app": {
      "command": "node",
      "args": ["/absolute/path/to/my-unido-app/dist/index.js"]
    }
  }
}
```

#### Step 4: Restart Claude Desktop

Restart the Claude Desktop app, and your tools will be available!

---

## 💡 Key Features

### 🔄 Write Once, Run Everywhere
Define your tools using Unido's universal API. The framework handles all the platform-specific conversions automatically.

### 🛡️ Type-Safe with Zod
Use [Zod](https://zod.dev/) schemas for input validation. Get full TypeScript type inference and runtime validation automatically.

```typescript
input: z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120)
})
// TypeScript knows the exact types in your handler
```

### 🧩 Component System
Return rich UI components that adapt to each platform's capabilities:

```typescript
import { componentResponse } from '@unido/core';

return componentResponse(
  'weather-card',
  { city, temperature, condition },
  'Weather loaded successfully' // Fallback text
);
```

- **OpenAI**: Renders as interactive React component
- **Claude**: Falls back to formatted text
- **Future platforms**: Automatically adapts

### 🔌 Built on Standards
Uses the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) under the hood, ensuring compatibility with the AI ecosystem.

---

## 📚 Core Concepts

### Tools

Tools are functions that AI assistants can call. Each tool has:
- **Description**: What the tool does (helps the AI decide when to use it)
- **Input Schema**: What parameters it accepts (defined with Zod)
- **Handler**: Your business logic (async function)

```typescript
app.tool('tool_name', {
  description: 'Clear description for the AI',
  input: z.object({ /* parameters */ }),
  handler: async (params) => {
    // Your logic here
    return textResponse('Result');
  }
});
```

### Providers

Providers are adapters for different AI platforms. Unido currently supports:

- **OpenAI** (`@unido/provider-openai`) - For ChatGPT
- **Claude** (`@unido/provider-claude`) - For Claude Desktop
- **More coming soon** (Gemini, custom platforms)

Each provider handles:
- Platform-specific protocols
- Schema conversion
- Transport layer (HTTP, stdio, WebSocket)

### Responses

Return structured responses from your tools:

```typescript
import { textResponse, componentResponse, errorResponse } from '@unido/core';

// Simple text
return textResponse('Hello world');

// Rich component (with fallback)
return componentResponse('card', { title: 'Hello' }, 'Hello world');

// Error handling
return errorResponse('Something went wrong', 'NOT_FOUND');
```

---

## 🏗️ Real-World Example

Check out the complete [weather app example](examples/weather-app/src/index.ts) that demonstrates:
- Multiple tools in one app
- Component responses
- Provider configuration
- Error handling
- Graceful shutdown

Run it locally:

```bash
cd examples/weather-app
pnpm install
pnpm run dev
```

---

## 🔧 Development Setup

This is a monorepo project using pnpm workspaces. If you want to contribute or modify Unido itself:

```bash
# Clone the repository
git clone https://github.com/yourusername/unido.git
cd unido

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run in development mode
pnpm run dev

# Run tests
pnpm run test
```

---

## 📦 Package Structure

Unido is organized as a monorepo:

- **`@unido/core`** - Main framework (createApp, tool registration, types)
- **`@unido/provider-base`** - Base classes for provider adapters
- **`@unido/provider-openai`** - OpenAI/ChatGPT adapter
- **`@unido/provider-claude`** - Claude Desktop adapter
- **`@unido/components`** - Reusable UI components
- **`@unido/dev`** - Development utilities
- **`create-unido`** - CLI tool for scaffolding ✅ Published

---

## 📦 Publishing Status

### Published Packages

- ✅ **`create-unido@0.2.0`** - CLI tool available on npm
  - npm: https://www.npmjs.com/package/create-unido
  - Usage: `pnpm create unido`

### Packages Pending Publication

The following packages need to be published to npm for the full framework to work:

- ⏳ **`@unido/core`** - Core framework (required)
- ⏳ **`@unido/provider-base`** - Base provider classes (required)
- ⏳ **`@unido/provider-openai`** - OpenAI adapter (required for ChatGPT)
- ⏳ **`@unido/provider-claude`** - Claude adapter (required for Claude Desktop)
- ⏳ **`@unido/components`** - UI components (optional)
- ⏳ **`@unido/dev`** - Development utilities (optional)

### For Now: Manual Setup Required

Until the core packages are published, use the [Manual Setup](#manual-setup) guide above to:
1. Clone this repository
2. Build packages locally
3. Link them in your project

We're working on publishing all packages soon!

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (Complete)
- Core framework with type system
- OpenAI adapter
- Component system foundation

### 🚧 Phase 2: Claude Support (In Progress)
- Claude Desktop adapter
- stdio transport implementation
- Cross-platform testing

### 📋 Phase 3: Developer Experience
- CLI tool (`create-unido`)
- Project templates
- Hot reload development server
- More example apps

### 🔮 Phase 4: Ecosystem
- Gemini adapter
- Custom provider SDK
- Component library
- Production deployment guides

---

## 🤔 FAQ

### Why use Unido instead of platform SDKs?

**Platform SDKs:**
- Tied to one platform
- Different APIs for each provider
- Duplicate code for multi-platform support

**Unido:**
- Single codebase for all platforms
- Consistent API across providers
- Automatic schema conversion

### Can I use this in production?

Unido is in active development (v0.1.x). The core API is stable, but we recommend waiting for v1.0 for production use.

### Which AI platforms are supported?

Currently:
- ✅ OpenAI ChatGPT (via OpenAI Apps)
- 🚧 Anthropic Claude (via MCP stdio)
- 📋 Google Gemini (planned)

### How does Unido handle provider differences?

Unido uses an adapter pattern. Each provider implements:
- Schema conversion (Zod → platform schema)
- Response formatting (universal → platform-specific)
- Transport layer (HTTP, stdio, WebSocket)

This means you write code once, and adapters handle the differences.

### Is it compatible with Model Context Protocol?

Yes! Unido is built on top of MCP and implements the specification for compatible providers (OpenAI, Claude).

---

## 🤝 Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) (coming soon) for:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🔗 Learn More

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - The standard Unido builds on
- **[OpenAI Apps SDK](https://developers.openai.com/apps-sdk)** - OpenAI's tool integration docs
- **[Zod Documentation](https://zod.dev/)** - Schema validation library
- **[Examples](examples/)** - Complete example applications

---

**Built with ❤️ for the AI developer community**

*Have questions? Open an issue or start a discussion!*
