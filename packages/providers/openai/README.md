# @bandofai/unido-provider-openai

**OpenAI ChatGPT adapter for Unido applications.**

[![npm version](https://img.shields.io/npm/v/@bandofai/unido-provider-openai)](https://www.npmjs.com/package/@bandofai/unido-provider-openai)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Enables your Unido applications to run as custom tools in ChatGPT using OpenAI's Custom Tools (formerly GPT Actions).

---

## Installation

```bash
pnpm add @bandofai/unido-core @bandofai/unido-provider-openai zod
```

---

## Quick Start

```typescript
import { createApp, textResponse } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';

const app = createApp({
  name: 'my-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});

app.tool('greet', {
  description: 'Greet a user',
  input: z.object({
    name: z.string()
  }),
  handler: async ({ name }) => {
    return textResponse(`Hello, ${name}!`);
  }
});

await app.listen();
// Server running on http://localhost:3000
```

---

## Configuration Options

### `openAI(options)`

Creates an OpenAI provider configuration.

**Options:**

```typescript
{
  port?: number;         // Server port (default: 3000)
  host?: string;         // Server host (default: 'localhost')
  cors?: boolean;        // Enable CORS (default: true)
  corsOrigin?: string;   // CORS origin (default: '*')
}
```

**Examples:**

```typescript
// Default configuration
openAI()

// Custom port
openAI({ port: 8080 })

// Production configuration
openAI({
  port: 3000,
  host: '0.0.0.0',
  cors: true,
  corsOrigin: 'https://chat.openai.com'
})

// Restricted CORS
openAI({
  cors: true,
  corsOrigin: 'https://yourdomain.com'
})
```

---

## How It Works

### Architecture

```
ChatGPT → HTTP Request → OpenAI Adapter → Unido Core → Your Tool Handler
                                        ← Universal Response ←
         ← Formatted Response ←
```

The OpenAI provider:

1. **Starts HTTP Server** on the configured port
2. **Implements MCP** (Model Context Protocol) for ChatGPT
3. **Converts Schemas** from Zod to JSON Schema
4. **Handles Requests** via Server-Sent Events (SSE)
5. **Formats Responses** for OpenAI's expected format

---

## Connecting to ChatGPT

### 1. Start Your Server

```bash
pnpm run dev
```

Your server should be accessible at `http://localhost:3000` (or your configured port).

### 2. Add to ChatGPT

1. Open [ChatGPT](https://chat.openai.com/)
2. Click your profile → **Settings**
3. Go to **Custom Tools** section
4. Click **Add Server**
5. Enter your server URL: `http://localhost:3000`
6. Click **Connect**

### 3. Test It

Ask ChatGPT to use your tools:
- "Greet me with my name"
- "Calculate 5 + 3"
- "What's the weather in London?"

---

## Features

### Server-Sent Events (SSE)

The OpenAI adapter uses SSE for real-time communication:

```typescript
// Endpoint: http://localhost:3000/sse
// ChatGPT connects to this endpoint
```

### Health Checks

Built-in health check endpoint:

```bash
curl http://localhost:3000/health
# Returns: {"status":"ok"}
```

### MCP Protocol

Implements Model Context Protocol v2025-06-18:
- `tools/list` - List available tools
- `tools/call` - Execute a tool

---

## Advanced Features

### Component Responses

Return rich UI that ChatGPT can render:

```typescript
import { componentResponse } from '@bandofai/unido-core';

app.tool('show_data', {
  description: 'Display data in a card',
  input: z.object({
    title: z.string(),
    description: z.string()
  }),
  handler: async ({ title, description }) => {
    return componentResponse(
      'card',
      { title, description },
      `${title}: ${description}`  // Fallback text
    );
  }
});
```

Register the underlying widget once when bootstrapping your app so the adapter can bundle it and expose the `ui://` resource to ChatGPT:

```typescript
const userCardPath = fileURLToPath(new URL('./components/UserCard.tsx', import.meta.url));

app.component({
  type: 'user-card',
  title: 'User Card',
  sourcePath: userCardPath,
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,
      },
    },
  },
});
```

On startup the adapter bundles every registered component with `esbuild`, converts it into an inline `ui://widget/<type>.html` resource, and serves it through the MCP `resources/list` and `resources/read` handlers used by ChatGPT Apps.

### OpenAI Metadata

The adapter automatically adds OpenAI-specific metadata to tools:

```json
{
  "_meta": {
    "openai/outputTemplate": "ui://widget/card.html",
    "openai/widgetAccessible": true
  }
}
```

---

## Production Deployment

### Environment Variables

```bash
# .env
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://chat.openai.com
```

Load in your app:

```typescript
import { openAI } from '@bandofai/unido-provider-openai';

const app = createApp({
  providers: {
    openai: openAI({
      port: parseInt(process.env.PORT || '3000'),
      host: process.env.HOST || 'localhost',
      corsOrigin: process.env.CORS_ORIGIN
    })
  }
});
```

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t my-unido-app .
docker run -p 3000:3000 my-unido-app
```

### Hosting Platforms

The OpenAI provider works on any platform that supports HTTP servers:

#### Railway

```bash
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "pnpm start"
```

#### Render

```yaml
# render.yaml
services:
  - type: web
    name: my-unido-app
    env: node
    buildCommand: pnpm install && pnpm run build
    startCommand: pnpm start
```

#### Vercel

```json
{
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

---

## Troubleshooting

### "Cannot find module '@modelcontextprotocol/sdk'"

The SDK is a dependency. Reinstall:

```bash
pnpm install
```

### "Port already in use"

Check what's using the port:

```bash
lsof -i :3000
```

Kill it or use a different port:

```typescript
openAI({ port: 3001 })
```

### ChatGPT can't connect

**Check server is running:**
```bash
curl http://localhost:3000/health
```

**Common issues:**
- Firewall blocking connections
- Using `https://` instead of `http://` for local dev
- Server not bound to correct network interface

**For production:**
- Ensure server is publicly accessible
- Use proper DNS/SSL if required
- Check CORS settings

### "Tool not found" in ChatGPT

Make sure:
1. Server is running
2. Tool is registered before `app.listen()`
3. ChatGPT connection is active (check settings)

### Schema validation errors

Ensure your Zod schemas are valid:

```typescript
// ❌ Wrong
input: z.object({
  age: z.string().number()  // Invalid chain
})

// ✅ Correct
input: z.object({
  age: z.number()
})
```

---

## API Details

### HTTP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root endpoint, returns server info |
| `/health` | GET | Health check (`{"status":"ok"}`) |
| `/sse` | GET | Server-Sent Events endpoint for MCP |

### MCP Methods

| Method | Description |
|--------|-------------|
| `tools/list` | List all available tools |
| `tools/call` | Execute a specific tool |

### Response Format

Tools return responses in this format:

```typescript
{
  content: [
    { type: 'text', text: 'Your response text' }
  ]
}
```

With components:

```typescript
{
  content: [
    { type: 'text', text: 'Fallback text' }
  ],
  component: {
    type: 'weather-card',
    props: { city: 'London', temp: 18 }
  }
}
```

---

## Examples

### Basic Calculator

```typescript
app.tool('calculate', {
  description: 'Perform arithmetic',
  input: z.object({
    op: z.enum(['add', 'sub', 'mul', 'div']),
    a: z.number(),
    b: z.number()
  }),
  handler: async ({ op, a, b }) => {
    const ops = {
      add: a + b,
      sub: a - b,
      mul: a * b,
      div: a / b
    };
    return textResponse(`Result: ${ops[op]}`);
  }
});
```

### Weather Tool with Component

```typescript
app.tool('weather', {
  description: 'Get weather for a city',
  input: z.object({
    city: z.string()
  }),
  handler: async ({ city }) => {
    const weather = await fetchWeather(city);
    return componentResponse(
      'weather-card',
      {
        city,
        temperature: weather.temp,
        condition: weather.condition,
        humidity: weather.humidity
      },
      `${city}: ${weather.temp}°C, ${weather.condition}`
    );
  }
});
```

### Multi-Step Tool

```typescript
app.tool('analyze_code', {
  description: 'Analyze code quality',
  input: z.object({
    code: z.string(),
    language: z.enum(['javascript', 'typescript', 'python'])
  }),
  handler: async ({ code, language }) => {
    // Step 1: Parse
    const ast = await parser.parse(code, language);

    // Step 2: Analyze
    const issues = await analyzer.check(ast);

    // Step 3: Format results
    return componentResponse(
      'code-analysis',
      {
        language,
        issueCount: issues.length,
        issues: issues.map(i => ({
          line: i.line,
          severity: i.severity,
          message: i.message
        }))
      },
      `Found ${issues.length} issues in ${language} code`
    );
  }
});
```

---

## Development

### Running Tests

```bash
cd packages/providers/openai
pnpm test
```

### Building

```bash
pnpm run build
```

### Type Checking

```bash
pnpm run type-check
```

---

## Links

- **[Main Documentation](../../../README.md)** - Full framework docs
- **[Core Package](../../core/)** - Core API documentation
- **[npm Package](https://www.npmjs.com/package/@bandofai/unido-provider-openai)** - View on npm
- **[OpenAI Platform](https://platform.openai.com/)** - OpenAI docs
- **[MCP Specification](https://modelcontextprotocol.io/)** - Protocol details

---

## License

MIT License - see [LICENSE](../../../LICENSE) for details.
