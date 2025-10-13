# Weather App Example

Example application demonstrating Unido's multi-provider capabilities.

## Features

- ✅ Multi-provider support (OpenAI, Claude ready)
- ✅ Type-safe tool definitions with Zod
- ✅ Component-based responses
- ✅ Hot reload development
- ✅ Universal API

## Running

```bash
# Install dependencies (from root)
pnpm install

# Run dev server
cd examples/weather-app
pnpm dev
```

## Tools Available

### `get_weather`
Get current weather for any city.

**Parameters:**
- `city` (string): City name
- `units` ('celsius' | 'fahrenheit'): Temperature units

**Example:**
```
Get weather for London in celsius
```

### `search_cities`
Search for cities by name.

**Parameters:**
- `query` (string): Search query

**Example:**
```
Search cities matching "New"
```

## Architecture

```
weather-app/
├── src/
│   └── index.ts          # Main app with tools
├── package.json
└── tsconfig.json
```

The app uses:
- `@unido/core` - Core framework
- `@unido/provider-openai` - OpenAI adapter
- `@unido/dev` - Dev server with hot reload

## Adding More Providers

To add Claude support:

```typescript
import { ClaudeAdapter } from '@unido/provider-claude';

const app = createApp({
  name: 'weather-app',
  providers: {
    openai: { port: 3000 },
    claude: { transport: 'stdio' },  // Add Claude
  },
});

// Register Claude adapter
const claudeAdapter = new ClaudeAdapter();
await claudeAdapter.initialize(app.getServerConfig());
app.registerProviderAdapter('claude', claudeAdapter);
```

Same code, multiple platforms! 🚀
