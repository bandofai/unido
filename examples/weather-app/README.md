# Weather App Example

Example application demonstrating Unido's multi-provider capabilities.

## Features

- ✅ OpenAI custom widget (MCP resource + React component)
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
│   ├── components/
│   │   └── WeatherCard.tsx  # React widget rendered in ChatGPT
│   └── index.ts             # Main app with tools + component registration
├── package.json
└── tsconfig.json
```

The app uses:
- `@bandofai/unido-core` - Core framework
- `@bandofai/unido-provider-openai` - OpenAI adapter
- `@unido/dev` - Dev server with hot reload

## Extensibility

The Unido framework is designed to support multiple AI platforms. Currently, OpenAI is fully supported, and the architecture allows for easy addition of new providers in the future.
