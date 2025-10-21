# OpenAI Apps SDK Integration Guide

**For AI Assistants**: This guide maps Unido framework concepts to OpenAI Apps SDK patterns. For detailed OpenAI Apps SDK specifications, always query Context7 first.

---

## Quick Reference

### Documentation Sources

**Context7 (Primary Reference - Always Current)**
- Library ID: `/websites/developers_openai_apps-sdk`
- Usage: Query Context7 MCP server with this library ID for up-to-date specifications
- Coverage: 59 code snippets including metadata, widgets, MCP server patterns
- Trust Score: 7.5

**Official Documentation**
- Main: https://developers.openai.com/apps-sdk/
- Reference: https://developers.openai.com/apps-sdk/reference/
- Examples: https://github.com/openai/openai-apps-sdk-examples

### Key Metadata Fields Quick Reference

| Metadata Field | Purpose | Unido API Location |
|---|---|---|
| `openai/outputTemplate` | Widget URI to render | `tool.metadata.openai.outputTemplate` or auto-set |
| `openai/widgetAccessible` | Enable component interactions | `component.metadata.openai.renderHints.widgetAccessible` |
| `openai/widgetDescription` | Describe widget for AI | `component.description` |
| `openai/toolInvocation/invoking` | Status while running | `component.metadata.openai.invoking` |
| `openai/toolInvocation/invoked` | Status after completion | `component.metadata.openai.invoked` |
| `openai/renderHints` | Size/display preferences | `component.metadata.openai.renderHints` |
| `openai/widgetCSP` | Content Security Policy | `component.metadata.openai.widgetCSP` |

---

## Concept Mapping: Unido ↔ OpenAI Apps SDK

Understanding how Unido's universal API maps to OpenAI-specific implementation:

### Application Setup

**Unido API:**
```typescript
import { createApp } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';

const app = createApp({
  name: 'my-app',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});
```

**OpenAI Apps SDK (MCP) Equivalent:**
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const server = new McpServer({
  name: 'my-app',
  version: '1.0.0'
});
```

**What Unido Does**: Creates MCP server automatically, handles HTTP/SSE transport, manages component bundling.

### Tool Registration

**Unido API:**
```typescript
app.tool('get_weather', {
  title: 'Get Weather',
  description: 'Get weather for a city',
  input: z.object({
    city: z.string().describe('City name'),
  }),
  handler: async ({ city }) => {
    return textResponse(`Weather in ${city}: Sunny, 72°F`);
  }
});
```

**OpenAI Apps SDK (MCP) Equivalent:**
```typescript
server.registerTool(
  'get_weather',
  {
    title: 'Get Weather',
    description: 'Get weather for a city',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' }
      },
      required: ['city']
    }
  },
  async ({ city }) => {
    return {
      content: [{ type: 'text', text: `Weather in ${city}: Sunny, 72°F` }]
    };
  }
);
```

**What Unido Does**: Converts Zod schema to JSON Schema, wraps handler, manages validation.

### Component Registration

**Unido API:**
```typescript
app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Displays weather information',
  sourcePath: resolveComponentPath('components/WeatherCard.tsx'),
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

**OpenAI Apps SDK (MCP) Equivalent:**
```typescript
server.registerResource(
  'weather-card',
  'ui://widget/weather-card.html',
  {},
  async () => ({
    contents: [{
      uri: 'ui://widget/weather-card.html',
      mimeType: 'text/html+skybridge',
      text: `
        <div id="root"></div>
        <style>${CSS}</style>
        <script type="module">${BUNDLED_JS}</script>
      `,
      _meta: {
        'openai/widgetDescription': 'Displays weather information',
        'openai/widgetAccessible': true
      }
    }]
  })
);
```

**What Unido Does**: Bundles React component, creates data URL, generates HTML wrapper, registers MCP resource, manages metadata.

### Response with Component

**Unido API:**
```typescript
return componentResponse(
  'weather-card',
  { city, temperature: 72, condition: 'Sunny' },
  `Weather in ${city}: Sunny, 72°F`
);
```

**OpenAI Apps SDK (MCP) Equivalent:**
```typescript
return {
  content: [{ type: 'text', text: `Weather in ${city}: Sunny, 72°F` }],
  structuredContent: { city, temperature: 72, condition: 'Sunny' },
  _meta: {
    'openai/outputTemplate': 'ui://widget/weather-card.html',
    'openai/widgetAccessible': true
  }
};
```

**What Unido Does**: Builds response object, sets metadata, maps props to structuredContent.

### Response Types Mapping

| Unido Helper | OpenAI MCP Response | Use Case |
|---|---|---|
| `textResponse(text)` | `{ content: [{ type: 'text', text }] }` | Plain text response |
| `componentResponse(type, props, fallback)` | `{ content: [...], structuredContent: props, _meta: {...} }` | Rich UI response |
| `errorResponse(message)` | `{ content: [{ type: 'text', text: 'Error: ...' }] }` | Error handling |

---

## Metadata Reference

Complete guide to OpenAI-specific metadata fields and how to set them via Unido API.

### Tool-Level Metadata

Set via `tool.metadata.openai.*` when calling `app.tool()`:

#### `openai/outputTemplate`
- **Purpose**: Specifies which widget to render for this tool's output
- **Format**: `ui://widget/{component-type}.html`
- **When to Use**: Tools that return rich UI
- **Auto-Set**: Unido auto-sets this when you use `componentResponse()` and have registered component
- **Manual Override**:
  ```typescript
  app.tool('my_tool', {
    // ...
    metadata: {
      openai: {
        outputTemplate: 'ui://widget/custom-widget.html'
      }
    }
  });
  ```

#### `openai/widgetAccessible`
- **Purpose**: Enable widget to call tools via `window.openai.callTool()`
- **Format**: boolean
- **When to Use**: Interactive widgets that need to fetch data or trigger actions
- **Unido API**:
  ```typescript
  app.tool('my_tool', {
    // ...
    metadata: {
      openai: {
        widgetAccessible: true
      }
    }
  });
  ```

#### `openai/toolInvocation/invoking` and `openai/toolInvocation/invoked`
- **Purpose**: Custom status messages shown during/after tool execution
- **Format**: string
- **When to Use**: Provide user-friendly status updates
- **Unido API**:
  ```typescript
  app.tool('search_products', {
    // ...
    metadata: {
      openai: {
        'toolInvocation/invoking': 'Searching products...',
        'toolInvocation/invoked': 'Found products!'
      }
    }
  });
  ```

#### `openai/resultCanProduceWidget`
- **Purpose**: Hint that tool can return widgets
- **Format**: boolean
- **Auto-Set**: Unido sets this automatically when components are registered
- **Rarely Need Manual Override**

### Component-Level Metadata

Set via `component.metadata.openai.*` when calling `app.component()`:

#### `openai/widgetDescription`
- **Purpose**: Helps AI understand what the widget displays
- **Format**: string
- **Unido API**: Set via `component.description` (auto-mapped)
  ```typescript
  app.component({
    type: 'weather-card',
    description: 'Displays weather with temperature, conditions, and forecast',
    // ...
  });
  ```

#### `openai/widgetCSP` (Content Security Policy)
- **Purpose**: Define allowed network and resource domains
- **Format**: `{ connect_domains: string[], resource_domains: string[] }`
- **When to Use**: Before deploying to production, specify all external domains
- **Unido API**:
  ```typescript
  app.component({
    type: 'my-widget',
    // ...
    metadata: {
      openai: {
        widgetCSP: {
          connect_domains: ['https://api.example.com'],
          resource_domains: ['https://cdn.example.com']
        }
      }
    }
  });
  ```

#### `openai/renderHints`
- **Purpose**: Suggest display preferences
- **Format**: `{ preferredSize?: 'small' | 'medium' | 'large', widgetAccessible?: boolean }`
- **Unido API**:
  ```typescript
  app.component({
    type: 'dashboard',
    // ...
    metadata: {
      openai: {
        renderHints: {
          preferredSize: 'large',
          widgetAccessible: true
        }
      }
    }
  });
  ```

#### `openai/widgetDomain`
- **Purpose**: Custom subdomain for rendering (advanced)
- **Format**: string (URL)
- **Default**: `https://web-sandbox.oaiusercontent.com`
- **When to Use**: Restrict access to specific origins with public API keys
- **Unido API**:
  ```typescript
  app.component({
    type: 'secure-widget',
    // ...
    metadata: {
      openai: {
        widgetDomain: 'https://chatgpt.com'
      }
    }
  });
  ```

### Response-Level Metadata

Returned dynamically via `_meta` in tool handler responses:

#### Passing Hidden Data to Components
- **Purpose**: Send data to component without exposing to AI model
- **Pattern**: Use `_meta` in response for component-only data
- **Unido API**: Not directly exposed, but you can add custom metadata to response
  ```typescript
  // Currently not supported in Unido - feature request
  // In raw MCP:
  return {
    content: [...],
    structuredContent: { summary: 'Brief data for model' },
    _meta: {
      fullDataset: {...}, // Only component sees this
      'openai/outputTemplate': 'ui://widget/widget.html'
    }
  };
  ```

---

## Widget System Deep Dive

How Unido's component system maps to OpenAI's widget rendering.

### Component Bundle Flow

```
Developer writes React component (WeatherCard.tsx)
                  ↓
Unido bundles with esbuild at server startup
                  ↓
Creates base64 data URL with bundled JS
                  ↓
Generates HTML wrapper with <script type="module">
                  ↓
Registers as MCP resource (ui://widget/weather-card.html)
                  ↓
ChatGPT fetches resource when tool returns widget
                  ↓
Renders in iframe with Skybridge messaging
```

### Data Flow: Unido Props → Component

**1. Define Component Props Interface:**
```typescript
// packages/components/src/WeatherCard.tsx
interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: string;
}

export const WeatherCard: FC<WeatherCardProps> = ({ city, temperature, condition }) => {
  return (
    <div className="weather-card">
      <h2>{city}</h2>
      <div className="temp">{temperature}°F</div>
      <div className="condition">{condition}</div>
    </div>
  );
};
```

**2. Return Component with Props:**
```typescript
app.tool('get_weather', {
  // ...
  handler: async ({ city }) => {
    const weatherData = await fetchWeather(city);

    return componentResponse(
      'weather-card',
      {
        city: weatherData.city,
        temperature: weatherData.temp,
        condition: weatherData.condition
      },
      `Weather in ${city}: ${weatherData.condition}, ${weatherData.temp}°F`
    );
  }
});
```

**3. Unido Converts to MCP Response:**
```typescript
{
  content: [{ type: 'text', text: 'Weather in Portland: Sunny, 72°F' }],
  structuredContent: {  // Props become structuredContent
    city: 'Portland',
    temperature: 72,
    condition: 'Sunny'
  },
  _meta: {
    'openai/outputTemplate': 'ui://widget/weather-card.html'
  }
}
```

**4. Component Accesses Data via window.openai:**

Unido bundles your component with a special wrapper that provides `window.openai`:

```typescript
// In your component (automatic via Unido bundling)
import { useEffect, useState } from 'react';

export const WeatherCard: FC = () => {
  const [data, setData] = useState<WeatherCardProps | null>(null);

  useEffect(() => {
    // window.openai is injected by ChatGPT/Skybridge
    if (window.openai?.toolOutput) {
      setData(window.openai.toolOutput as WeatherCardProps);
    }
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="weather-card">
      <h2>{data.city}</h2>
      <div className="temp">{data.temperature}°F</div>
      <div className="condition">{data.condition}</div>
    </div>
  );
};
```

### Interactive Widgets with `callTool`

For widgets that need to fetch data or trigger server actions:

**1. Enable widgetAccessible:**
```typescript
app.tool('show_weather', {
  // ...
  metadata: {
    openai: {
      widgetAccessible: true  // Critical!
    }
  }
});
```

**2. Create Refresh Tool:**
```typescript
app.tool('refresh_weather', {
  title: 'Refresh Weather',
  description: 'Fetch updated weather data',
  input: z.object({
    city: z.string()
  }),
  handler: async ({ city }) => {
    const freshData = await fetchWeather(city);
    return componentResponse('weather-card', freshData, 'Weather updated');
  }
});
```

**3. Call Tool from Component:**
```typescript
export const WeatherCard: FC = () => {
  const [data, setData] = useState<WeatherCardProps | null>(null);

  const refreshWeather = async () => {
    if (window.openai && data?.city) {
      // Trigger server-side tool
      await window.openai.callTool('refresh_weather', {
        city: data.city
      });
      // Component will re-render with new data automatically
    }
  };

  return (
    <div className="weather-card">
      {/* ... weather display ... */}
      <button onClick={refreshWeather}>Refresh</button>
    </div>
  );
};
```

### window.openai API Reference

**Quick Reference** (Common Properties):

| Property/Method | Type | Description |
|---|---|---|
| `window.openai.toolInput` | `unknown` | Input parameters passed to the tool |
| `window.openai.toolOutput` | `unknown` | structuredContent from tool response (your props) |
| `window.openai.widgetState` | `Record<string, unknown>` | Persisted state from prior renders |
| `window.openai.setWidgetState(state)` | `Promise<void>` | Persist state back to host |
| `window.openai.callTool(name, args)` | `Promise<{ result }>` | Trigger server-side tool (requires widgetAccessible: true) |
| `window.openai.displayMode` | `'inline' \| 'pip' \| 'fullscreen'` | Current display mode in ChatGPT |
| `window.openai.maxHeight` | `number` | Maximum height constraint (pixels) |
| `window.openai.theme` | `'light' \| 'dark'` | Current theme |
| `window.openai.locale` | `string` | User's locale (BCP 47) |

> 📚 **Complete API Documentation**: See [WINDOW_OPENAI_API.md](./WINDOW_OPENAI_API.md) for full reference with 14 API members, usage patterns, React hooks, and edge cases.
>
> 📊 **Implementation Status**: See [WINDOW_OPENAI_COMPARISON.md](./WINDOW_OPENAI_COMPARISON.md) for gap analysis and roadmap.

---

## Common Patterns

### Pattern 1: Simple Text Response

No widget, just text.

```typescript
app.tool('calculate', {
  title: 'Calculate',
  description: 'Perform arithmetic',
  input: z.object({
    expression: z.string()
  }),
  handler: async ({ expression }) => {
    const result = eval(expression); // Don't actually use eval :)
    return textResponse(`Result: ${result}`);
  }
});
```

### Pattern 2: Component with Data (Read-Only)

Display rich UI without interactions.

```typescript
// 1. Register component
app.component({
  type: 'product-card',
  title: 'Product Card',
  description: 'Displays product information',
  sourcePath: resolveComponentPath('components/ProductCard.tsx')
});

// 2. Use in tool
app.tool('get_product', {
  title: 'Get Product',
  input: z.object({ id: z.string() }),
  handler: async ({ id }) => {
    const product = await db.getProduct(id);
    return componentResponse(
      'product-card',
      {
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        rating: product.rating
      },
      `${product.name} - $${product.price}`
    );
  }
});
```

### Pattern 3: Interactive Component

Widget can trigger tool calls.

```typescript
// 1. Register component with widgetAccessible
app.component({
  type: 'todo-list',
  title: 'Todo List',
  description: 'Interactive todo list with add/complete actions',
  sourcePath: resolveComponentPath('components/TodoList.tsx'),
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true
      }
    }
  }
});

// 2. Display tool with widgetAccessible
app.tool('show_todos', {
  title: 'Show Todos',
  input: z.object({}),
  metadata: {
    openai: {
      widgetAccessible: true,
      'toolInvocation/invoking': 'Loading todos...',
      'toolInvocation/invoked': 'Todos loaded'
    }
  },
  handler: async () => {
    const todos = await db.getTodos();
    return componentResponse('todo-list', { todos }, 'Todo list');
  }
});

// 3. Action tools (called by component)
app.tool('add_todo', {
  title: 'Add Todo',
  input: z.object({ text: z.string() }),
  handler: async ({ text }) => {
    await db.addTodo(text);
    const todos = await db.getTodos();
    return componentResponse('todo-list', { todos }, 'Todo added');
  }
});

app.tool('complete_todo', {
  title: 'Complete Todo',
  input: z.object({ id: z.string() }),
  handler: async ({ id }) => {
    await db.completeTodo(id);
    const todos = await db.getTodos();
    return componentResponse('todo-list', { todos }, 'Todo completed');
  }
});
```

**In Component:**
```typescript
const addTodo = async (text: string) => {
  await window.openai?.callTool('add_todo', { text });
};

const completeTodo = async (id: string) => {
  await window.openai?.callTool('complete_todo', { id });
};
```

### Pattern 4: Multiple Components in One App

Different tools use different widgets.

```typescript
// Register multiple components
app.component({
  type: 'weather-card',
  title: 'Weather Card',
  sourcePath: resolveComponentPath('components/WeatherCard.tsx')
});

app.component({
  type: 'forecast-chart',
  title: 'Forecast Chart',
  sourcePath: resolveComponentPath('components/ForecastChart.tsx')
});

// Use different components in different tools
app.tool('current_weather', {
  title: 'Current Weather',
  handler: async ({ city }) => {
    const current = await api.getCurrentWeather(city);
    return componentResponse('weather-card', current, `Weather in ${city}`);
  }
});

app.tool('forecast', {
  title: '7-Day Forecast',
  handler: async ({ city }) => {
    const forecast = await api.getForecast(city);
    return componentResponse('forecast-chart', forecast, `Forecast for ${city}`);
  }
});
```

---

## Context7 Integration Guide

For AI assistants processing this documentation:

### When to Query Context7

Use Context7 when you need:
- Detailed API specifications
- Latest protocol changes
- Security/CSP documentation
- Advanced features (OAuth, state persistence)
- Official code examples
- Troubleshooting specific error messages

### How to Query Context7

**Library ID**: `/websites/developers_openai_apps-sdk`

**Example Queries**:

```
Topic: "widget metadata fields"
Topic: "Content Security Policy CSP"
Topic: "window.openai component bridge"
Topic: "OAuth authentication"
Topic: "state persistence"
Topic: "MCP protocol"
```

### Integration Pattern for AI Assistants

When a developer asks about OpenAI Apps SDK features:

1. **First**: Check this guide for Unido-specific mappings
2. **Then**: Query Context7 for detailed OpenAI specifications
3. **Finally**: Synthesize answer showing Unido API usage

### Example Workflow

**Developer asks**: "How do I secure my widget's network requests?"

**AI Assistant thought process**:
1. Check this guide → Find mention of `openai/widgetCSP`
2. Query Context7: `topic: "Content Security Policy CSP"` → Get detailed specs
3. Respond with Unido-specific example using Context7 details

---

## Additional Resources

### Official OpenAI Docs

- **Apps SDK Home**: https://developers.openai.com/apps-sdk/
- **Core Concepts**: https://developers.openai.com/apps-sdk/core-concepts/
- **Build Guide**: https://developers.openai.com/apps-sdk/build/
- **Reference**: https://developers.openai.com/apps-sdk/reference/
- **Examples Repository**: https://github.com/openai/openai-apps-sdk-examples

### MCP Protocol

- **Spec**: https://modelcontextprotocol.io/
- **SDK**: https://github.com/modelcontextprotocol/sdk
- **Version**: 2025-06-18 (as of Unido v0.1.x)

### Unido-Specific Documentation

**Core Documentation**:
- **Main README**: [../../README.md](../../README.md)
- **Development Guide**: [../../DEVELOPMENT.md](../../DEVELOPMENT.md)
- **Examples**: [../../examples/weather-app/](../../examples/weather-app/)

**OpenAI Provider Documentation**:
- **window.openai API Reference**: [WINDOW_OPENAI_API.md](./WINDOW_OPENAI_API.md) - Complete API specification
- **Implementation Comparison**: [WINDOW_OPENAI_COMPARISON.md](./WINDOW_OPENAI_COMPARISON.md) - Gap analysis & roadmap
- **Research Summary**: [WINDOW_OPENAI_SUMMARY.md](./WINDOW_OPENAI_SUMMARY.md) - Executive summary
- **Troubleshooting**: [troubleshooting.md](troubleshooting.md) - Common issues & solutions

**Widget Examples**:
- **Basic Widget**: [examples/basic-widget.md](examples/basic-widget.md)
- **Interactive Widget**: [examples/interactive-widget.md](examples/interactive-widget.md)
- **Multi-Component**: [examples/multi-component.md](examples/multi-component.md)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-01-16
**Unido Version**: 0.6.x
**OpenAI Apps SDK**: Preview (October 2025)

> 📚 This guide focuses on Unido-specific mappings. For authoritative OpenAI Apps SDK documentation, always query Context7 first with library ID `/websites/developers_openai_apps-sdk`.
