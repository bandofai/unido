<div align="center">

# 🌐 Unido

### Build AI tools once. Deploy everywhere.

**The universal framework for building AI applications that work across ChatGPT and future AI platforms.**

[![npm version](https://img.shields.io/npm/v/create-unido?label=create-unido)](https://www.npmjs.com/package/create-unido)
[![npm version](https://img.shields.io/npm/v/@bandofai/unido-core?label=@bandofai/unido-core)](https://www.npmjs.com/package/@bandofai/unido-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples) • [Roadmap](#-roadmap)

</div>

---

## 🎯 The Problem

Building custom AI tools means writing the same code multiple times:

```typescript
// ❌ Today: Different code for each platform
writeOpenAITool()     // HTTP + JSON Schema
writeFutureTool()     // Different API
```

**Unido's Solution:**

```typescript
// ✅ With Unido: Write once, run everywhere
app.tool('my_tool', { /* ... */ })
// Automatically works in ChatGPT and future platforms
```

---

## ✨ Why Unido?

| Feature | Platform SDKs | Unido |
|---------|--------------|-------|
| **Multi-Platform** | Write separate code for each | ✅ Single codebase |
| **Type Safety** | Manual types per platform | ✅ Zod + TypeScript inference |
| **Protocol** | Learn each platform's API | ✅ Built on MCP standard |
| **Development Speed** | Slow (duplicate work) | ✅ Fast (write once) |
| **Maintenance** | Update N codebases | ✅ Update 1 codebase |

---

## ⚡ Quick Start

### 1. Create a new Unido app

```bash
pnpm create unido
```

Follow the prompts to choose your template (basic or weather example).

### 2. Run your app

```bash
cd your-app-name
pnpm run dev
```

Your server is now running on `http://localhost:3000` 🎉

### 3. Connect to ChatGPT

1. Open ChatGPT → **Settings → Custom Tools → Add Server**
2. Enter `http://localhost:3000`
3. Ask ChatGPT to use your tools!

---

## 📖 Complete Example

Here's a complete weather tool that works across all platforms:

```typescript
import { fileURLToPath } from 'node:url';
import { createApp, componentResponse } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';

// Create app with OpenAI provider
const app = createApp({
  name: 'weather-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});

// Register the widget component once
const weatherCardPath = fileURLToPath(new URL('./components/WeatherCard.tsx', import.meta.url));

app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Displays temperature, condition, and humidity for a city.',
  sourcePath: weatherCardPath,
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,
      },
    },
  },
});

// Define your tool with Zod schema for type safety
app.tool('get_weather', {
  title: 'Get Weather',
  description: 'Get current weather for any city',
  input: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius')
  }),
  handler: async ({ city, units }) => {
    // Your business logic
    const weather = await fetchWeatherAPI(city);

    // Return rich response with fallback
    return componentResponse(
      'weather-card',
      {
        city,
        temperature: weather.temp,
        condition: weather.condition,
        humidity: weather.humidity,
        units,
      },
      `Weather in ${city}: ${weather.temp}°${units === 'celsius' ? 'C' : 'F'}`
    );
  }
});

// Start the server
await app.listen();
console.log('✅ Server started on http://localhost:3000');
```

**That's it!** Your tool now:
- ✅ Has full TypeScript type safety
- ✅ Validates inputs automatically
- ✅ Works in ChatGPT
- ✅ Ready for future platforms (just add provider config)

---

## 🎨 Key Features

### 🔄 Write Once, Run Everywhere

Define tools using Unido's universal API. The framework automatically converts them for each platform.

```typescript
// One definition...
app.tool('calculator', { /* ... */ });

// ...works everywhere
providers: {
  openai: openAI({ port: 3000 })    // → HTTP + JSON Schema
  // Add more providers as they become available
}
```

### 🛡️ Type-Safe with Zod

Get compile-time and runtime safety with [Zod](https://zod.dev/) schemas:

```typescript
input: z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
  country: z.enum(['US', 'UK', 'CA'])
})

// TypeScript automatically knows handler receives:
handler: async ({ email, age, country }) => {
  // email: string (validated email)
  // age: number (18-120)
  // country: 'US' | 'UK' | 'CA'
}
```

### 🧩 Smart Component System

Return rich UI that adapts per platform:

```typescript
return componentResponse(
  'weather-card',
  { city, temp, condition },
  'Fallback text for unsupported platforms'
);
```

- **OpenAI**: Renders as React component
- **Future platforms**: Automatically adapts
- **Automatic bundling**: Components registered with `app.component()` are bundled once on startup and exposed to ChatGPT as MCP resources (`ui://widget/<name>.html`).
- **Widget accessibility**: Mark widgets as interactive via `metadata.openai.renderHints.widgetAccessible = true` to allow follow-up tool calls from UI actions.

### 🔌 Built on Industry Standards

- **MCP (Model Context Protocol)**: Industry-standard protocol for AI tools
- **JSON-RPC 2.0**: Battle-tested RPC protocol
- **JSON Schema**: Universal schema format
- **OpenAPI-compatible**: Easy integration

---

## 📚 Documentation

### Core Concepts

#### Tools

Tools are functions AI assistants can call:

```typescript
app.tool('tool_name', {
  title: 'Human-readable name',        // Shows in UI
  description: 'What this tool does',  // Helps AI decide when to use it
  input: z.object({ /* params */ }),   // Zod schema for validation
  handler: async (params) => {         // Your business logic
    return textResponse('Result');
  }
});
```

#### Providers

Providers adapt your tools for specific platforms:

```typescript
import { openAI } from '@bandofai/unido-provider-openai';

const app = createApp({
  providers: {
    openai: openAI({ port: 3000 })    // For ChatGPT
  }
});
```

#### Response Types

Return structured responses:

```typescript
import { textResponse, componentResponse } from '@bandofai/unido-core';

// Simple text
return textResponse('Hello world');

// Rich component (with fallback text)
return componentResponse('card',
  { title: 'Hello', description: 'World' },
  'Hello World'  // Fallback for platforms without components
);

// Multiple content blocks
return {
  content: [
    { type: 'text', text: 'Here is your data:' },
    { type: 'text', text: JSON.stringify(data, null, 2) }
  ]
};
```

### Configuration

#### OpenAI Provider Options

```typescript
openAI({
  port: 3000,              // Server port (default: 3000)
  host: 'localhost',       // Server host (default: 'localhost')
  cors: true,              // Enable CORS (default: true)
  corsOrigin: '*'          // CORS origin (default: '*')
})
```

---

## 🏗️ Examples

### Basic Calculator

```typescript
app.tool('calculate', {
  title: 'Calculator',
  description: 'Perform arithmetic operations',
  input: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  handler: async ({ operation, a, b }) => {
    let result: number;
    switch (operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide': result = b !== 0 ? a / b : NaN; break;
    }
    return textResponse(`${a} ${operation} ${b} = ${result}`);
  }
});
```

### Database Query Tool

```typescript
app.tool('query_database', {
  title: 'Query Database',
  description: 'Execute SQL queries on the database',
  input: z.object({
    query: z.string().describe('SQL query to execute'),
    limit: z.number().max(100).default(10)
  }),
  handler: async ({ query, limit }) => {
    const results = await db.query(query, { limit });
    return textResponse(JSON.stringify(results, null, 2));
  }
});
```

### Multi-Step Tool with Error Handling

```typescript
app.tool('send_email', {
  title: 'Send Email',
  description: 'Send an email to a recipient',
  input: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string()
  }),
  handler: async ({ to, subject, body }) => {
    try {
      await emailService.send({ to, subject, body });
      return textResponse(`✅ Email sent to ${to}`);
    } catch (error) {
      return textResponse(`❌ Failed to send email: ${error.message}`);
    }
  }
});
```

### Complete Weather App

See [examples/weather-app](examples/weather-app/src/index.ts) for a full-featured example with:
- Multiple tools
- Component responses
- External API integration
- Error handling
- Graceful shutdown

```bash
cd examples/weather-app
pnpm install
pnpm run dev
```

---

## 🔧 Manual Setup

Prefer to set up manually? Here's how:

### 1. Create Project

```bash
mkdir my-app && cd my-app
pnpm init
```

### 2. Install Dependencies

```bash
pnpm add @bandofai/unido-core @bandofai/unido-provider-openai zod
pnpm add -D typescript @types/node tsx
```

### 3. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true
  }
}
```

### 4. Setup package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc"
  }
}
```

### 5. Create Your App

Create `src/index.ts` with the [example above](#-complete-example).

### 6. Run It

```bash
pnpm run dev
```

---

## 🐛 Troubleshooting

### "Cannot find package '@bandofai/unido-core'"

Make sure you installed the dependencies:
```bash
pnpm add @bandofai/unido-core @bandofai/unido-provider-openai zod
```

### "Port 3000 already in use"

Change the port in your config:
```typescript
openai: openAI({ port: 3001 })
```

### "Missing factory function" warning

Update your code to use the factory function pattern:
```typescript
// ❌ Old way
providers: { openai: { enabled: true, port: 3000 } }

// ✅ New way
providers: { openai: openAI({ port: 3000 }) }
```

### TypeScript errors about implicit types

Add explicit type annotations to handlers:
```typescript
handler: async ({ city, units }: { city: string; units?: string }) => {
  // ...
}
```

### Server starts but ChatGPT can't connect

1. Check server is running: `curl http://localhost:3000/health`
2. Ensure firewall allows connections
3. Use `http://` not `https://` for local development

---

## 📦 Package Structure

Unido is a monorepo with the following packages:

| Package | Version | Description |
|---------|---------|-------------|
| [`create-unido`](packages/cli) | [![npm](https://img.shields.io/npm/v/create-unido)](https://npmjs.com/package/create-unido) | CLI for scaffolding new apps |
| [`@bandofai/unido-core`](packages/core) | [![npm](https://img.shields.io/npm/v/@bandofai/unido-core)](https://npmjs.com/package/@bandofai/unido-core) | Core framework |
| [`@bandofai/unido-provider-openai`](packages/providers/openai) | [![npm](https://img.shields.io/npm/v/@bandofai/unido-provider-openai)](https://npmjs.com/package/@bandofai/unido-provider-openai) | OpenAI ChatGPT adapter |
| [`@bandofai/unido-provider-base`](packages/providers/base) | [![npm](https://img.shields.io/npm/v/@bandofai/unido-provider-base)](https://npmjs.com/package/@bandofai/unido-provider-base) | Base provider classes |
| `@bandofai/unido-components` | Coming Soon | UI component library |

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (Complete)
- [x] Core framework with type system
- [x] Zod schema integration
- [x] OpenAI adapter with MCP
- [x] CLI tool (`create-unido`)
- [x] Published to npm

### 📋 Phase 2: Developer Experience (In Progress)
- [ ] Hot reload development server
- [ ] Better error messages
- [ ] Debug mode
- [ ] More templates (database, file system, etc.)
- [ ] Documentation site

### 🔮 Phase 3: Ecosystem
- [ ] Custom provider SDK
- [ ] Component library
- [ ] Plugin system
- [ ] Production deployment guides
- [ ] Additional provider adapters

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

```bash
# Clone the repo
git clone https://github.com/bandofai/unido.git
cd unido

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Development mode (watch)
pnpm run dev
```

### Project Structure

```
unido/
├── packages/
│   ├── cli/              # create-unido CLI
│   ├── core/             # Core framework
│   ├── components/       # UI components
│   ├── dev/              # Dev utilities
│   └── providers/
│       ├── base/         # Base adapter
│       └── openai/       # OpenAI adapter
├── examples/
│   └── weather-app/      # Example app
└── docs/                 # Documentation
```

### Areas for Contribution

- 🐛 Bug fixes
- 📝 Documentation improvements
- ✨ New features (check roadmap)
- 🧪 Tests
- 💡 Example apps
- 🔌 New provider adapters

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🔗 Resources

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - The standard Unido builds on
- **[Zod Documentation](https://zod.dev/)** - Schema validation library
- **[OpenAI Platform](https://platform.openai.com/)** - OpenAI API docs

---

## 💬 Community & Support

- 💬 **Questions?** [Open a discussion](https://github.com/bandofai/unido/discussions)
- 🐛 **Bug reports:** [File an issue](https://github.com/bandofai/unido/issues)
- 🌟 **Star us on GitHub** if you find this useful!
- 🐦 **Follow updates:** [@bandofai](https://twitter.com/bandofai)

---

<div align="center">

**Built with ❤️ for the AI developer community**

[Get Started](#-quick-start) • [Examples](#-examples) • [Contributing](#-contributing)

</div>
