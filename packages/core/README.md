# @bandofai/unido-core

**Core framework for building universal AI applications.**

[![npm version](https://img.shields.io/npm/v/@bandofai/unido-core)](https://www.npmjs.com/package/@bandofai/unido-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

The heart of the Unido framework. This package provides the universal API for defining AI tools that work across multiple platforms.

---

## Installation

```bash
pnpm add @bandofai/unido-core zod

# Also install a provider adapter
pnpm add @bandofai/unido-provider-openai
```

---

## Quick Example

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
  title: 'Greet User',
  description: 'Greet a user by name',
  input: z.object({
    name: z.string().describe('User\'s name')
  }),
  handler: async ({ name }) => {
    return textResponse(`Hello, ${name}!`);
  }
});

await app.listen();
```

---

## API Reference

### `createApp(config)`

Creates a new Unido application instance.

**Parameters:**

```typescript
{
  name: string;          // Application name
  version: string;       // Semantic version
  providers: {
    [key: string]: ProviderConfig;
  }
}
```

**Returns:** `Unido` - Application instance

**Example:**

```typescript
const app = createApp({
  name: 'weather-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});
```

---

### `app.tool(name, definition)`

Registers a new tool that AI assistants can call.

**Parameters:**

- `name: string` - Tool identifier (lowercase, underscores allowed)
- `definition: ToolDefinition`
  ```typescript
  {
    title?: string;                     // Human-readable name
    description: string;                // What the tool does
    input: z.ZodType;                   // Zod schema for parameters
    handler: (params) => Promise<Response>;  // Your logic
  }
  ```

**Returns:** `void`

**Example:**

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
      case 'divide': result = a / b; break;
    }
    return textResponse(`Result: ${result}`);
  }
});
```

---

### `app.listen()`

Starts all configured providers and begins listening for requests.

**Returns:** `Promise<void>`

**Example:**

```typescript
await app.listen();
console.log('Server running!');
```

---

### `app.close()`

Gracefully shuts down all providers.

**Returns:** `Promise<void>`

**Example:**

```typescript
process.on('SIGINT', async () => {
  await app.close();
  process.exit(0);
});
```

---

## Response Helpers

### `textResponse(text)`

Creates a simple text response.

**Parameters:**
- `text: string` - The text to return

**Returns:** `UniversalResponse`

**Example:**

```typescript
return textResponse('Operation completed successfully!');
```

---

### `componentResponse(name, props, fallbackText)`

Creates a rich component response with fallback.

**Parameters:**
- `name: string` - Component identifier
- `props: Record<string, unknown>` - Component properties
- `fallbackText: string` - Text for platforms without component support

**Returns:** `UniversalResponse`

**Example:**

```typescript
return componentResponse(
  'weather-card',
  {
    city: 'London',
    temperature: 18,
    condition: 'Cloudy'
  },
  'Weather in London: 18°C, Cloudy'
);
```

---

## Type System

### Input Schemas with Zod

All tool inputs use [Zod](https://zod.dev/) for validation and type inference:

```typescript
import { z } from 'zod';

// String with description
z.string().describe('User email address')

// Number with constraints
z.number().min(0).max(100)

// Enum for fixed choices
z.enum(['small', 'medium', 'large'])

// Optional with default
z.string().default('default value')

// Object with nested fields
z.object({
  name: z.string(),
  age: z.number().optional(),
  email: z.string().email()
})

// Array of items
z.array(z.string())
```

**TypeScript automatically infers types:**

```typescript
input: z.object({
  email: z.string().email(),
  age: z.number().min(18)
})

// Handler automatically knows:
handler: async ({ email, age }) => {
  // email: string (validated as email)
  // age: number (must be >= 18)
}
```

---

## Advanced Features

### Multiple Providers

Run your tools on multiple platforms simultaneously:

```typescript
const app = createApp({
  name: 'multi-platform-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 }),
    claude: claude()  // Coming soon
  }
});

// Tools automatically work on both platforms
app.tool('greet', { /* ... */ });

await app.listen();
// ✅ OpenAI server on http://localhost:3000
// ✅ Claude stdio server ready
```

---

### Custom Response Format

Build responses manually for full control:

```typescript
handler: async ({ query }) => {
  return {
    content: [
      { type: 'text', text: 'Here are your results:' },
      { type: 'text', text: JSON.stringify(results, null, 2) }
    ],
    component: {
      type: 'data-table',
      props: { data: results }
    }
  };
}
```

---

### Error Handling

Handle errors gracefully:

```typescript
handler: async ({ userId }) => {
  try {
    const user = await database.getUser(userId);
    return textResponse(JSON.stringify(user));
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return textResponse(`User ${userId} not found`);
    }
    throw error;  // Let framework handle unexpected errors
  }
}
```

---

### Async Operations

Tools are async by default, perfect for API calls:

```typescript
app.tool('fetch_data', {
  description: 'Fetch data from external API',
  input: z.object({
    endpoint: z.string().url()
  }),
  handler: async ({ endpoint }) => {
    const response = await fetch(endpoint);
    const data = await response.json();
    return textResponse(JSON.stringify(data, null, 2));
  }
});
```

---

## Type Definitions

### `UniversalTool`

```typescript
interface UniversalTool {
  name: string;
  title?: string;
  description: string;
  input: z.ZodType;
  handler: ToolHandler;
}
```

### `ToolHandler`

```typescript
type ToolHandler<T = any> = (
  params: T,
  context: ToolContext
) => Promise<UniversalResponse>;
```

### `UniversalResponse`

```typescript
interface UniversalResponse {
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  component?: {
    type: string;
    props: Record<string, unknown>;
  };
}
```

### `ToolContext`

```typescript
interface ToolContext {
  provider: string;  // Which provider is calling this tool
}
```

---

## Best Practices

### 1. Use Descriptive Names

```typescript
// ❌ Bad
app.tool('gt', { ... });

// ✅ Good
app.tool('get_temperature', { ... });
```

### 2. Write Clear Descriptions

```typescript
// ❌ Bad
description: 'Gets stuff'

// ✅ Good
description: 'Retrieves the current temperature for a given city in Celsius or Fahrenheit'
```

### 3. Describe Schema Fields

```typescript
// ❌ Bad
input: z.object({
  c: z.string()
})

// ✅ Good
input: z.object({
  city: z.string().describe('Name of the city to get temperature for')
})
```

### 4. Provide Useful Error Messages

```typescript
// ❌ Bad
return textResponse('Error');

// ✅ Good
return textResponse(`Failed to fetch weather: City "${city}" not found. Please check the spelling.`);
```

### 5. Use Components for Rich Data

```typescript
// ❌ Less ideal
return textResponse(JSON.stringify(largeObject));

// ✅ Better
return componentResponse('data-viewer', largeObject, 'Data loaded successfully');
```

---

## Examples

### Weather Tool

```typescript
app.tool('get_weather', {
  title: 'Get Weather',
  description: 'Get current weather for a city',
  input: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius')
  }),
  handler: async ({ city, units }) => {
    const weather = await weatherAPI.get(city);
    return componentResponse(
      'weather-card',
      { city, temp: weather.temperature, condition: weather.condition },
      `${city}: ${weather.temperature}°${units[0].toUpperCase()}, ${weather.condition}`
    );
  }
});
```

### Database Query Tool

```typescript
app.tool('query_db', {
  title: 'Query Database',
  description: 'Execute a SQL query',
  input: z.object({
    query: z.string().describe('SQL query to execute'),
    limit: z.number().max(1000).default(100)
  }),
  handler: async ({ query, limit }) => {
    const results = await db.query(query, { limit });
    return componentResponse(
      'data-table',
      { rows: results },
      `Found ${results.length} results`
    );
  }
});
```

### File System Tool

```typescript
app.tool('read_file', {
  title: 'Read File',
  description: 'Read contents of a file',
  input: z.object({
    path: z.string().describe('File path to read')
  }),
  handler: async ({ path }) => {
    try {
      const content = await fs.readFile(path, 'utf-8');
      return textResponse(content);
    } catch (error) {
      return textResponse(`Error reading file: ${error.message}`);
    }
  }
});
```

---

## Troubleshooting

### "Tool handler must be async"

Make sure your handler is an async function:

```typescript
// ❌ Wrong
handler: ({ name }) => {
  return textResponse(`Hello ${name}`);
}

// ✅ Correct
handler: async ({ name }) => {
  return textResponse(`Hello ${name}`);
}
```

### "Invalid input schema"

Ensure you're using Zod schemas:

```typescript
// ❌ Wrong
input: { name: 'string' }

// ✅ Correct
input: z.object({ name: z.string() })
```

### TypeScript can't infer types

Add explicit type annotations:

```typescript
handler: async ({ city, units }: { city: string; units?: string }) => {
  // Now TypeScript knows the types
}
```

---

## Links

- **[Main Documentation](../../README.md)** - Full framework docs
- **[npm Package](https://www.npmjs.com/package/@bandofai/unido-core)** - View on npm
- **[Examples](../../examples/)** - Complete example apps
- **[Zod Documentation](https://zod.dev/)** - Schema validation

---

## License

MIT License - see [LICENSE](../../LICENSE) for details.
