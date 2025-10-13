# 🌐 Unido

**Build AI applications once, deploy them everywhere.**

Unido is a TypeScript framework that lets you create custom tools and interfaces for AI assistants (ChatGPT, Claude, Gemini) using a single codebase. Write your tool logic once, and Unido automatically adapts it to work with different AI platforms.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.17-orange)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-ISC-green)](./LICENSE)

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

### Installation

```bash
# Install Unido packages
pnpm add @unido/core @unido/provider-openai @unido/provider-claude zod

# Or use npm
npm install @unido/core @unido/provider-openai @unido/provider-claude zod
```

### Create Your First Tool

1. **Create a new file** (`my-tool.ts`):

```typescript
import { createApp, textResponse } from '@unido/core';
import { openAI } from '@unido/provider-openai';
import { z } from 'zod';

const app = createApp({
  name: 'my-first-tool',
  providers: {
    openai: openAI({ port: 3000 })
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

2. **Run it**:

```bash
pnpm tsx my-tool.ts
```

3. **Connect to ChatGPT**:
   - Open ChatGPT
   - Go to Settings → Apps
   - Add your app URL: `http://localhost:3000`

Now ChatGPT can use your custom tool!

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
- **`@unido/cli`** - CLI tool for scaffolding (coming soon)

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

ISC License - see [LICENSE](LICENSE) for details.

---

## 🔗 Learn More

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - The standard Unido builds on
- **[OpenAI Apps SDK](https://developers.openai.com/apps-sdk)** - OpenAI's tool integration docs
- **[Zod Documentation](https://zod.dev/)** - Schema validation library
- **[Examples](examples/)** - Complete example applications

---

**Built with ❤️ for the AI developer community**

*Have questions? Open an issue or start a discussion!*
