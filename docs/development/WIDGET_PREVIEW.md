# Widget Preview System

**Unido Widget Preview with MCP Loading & ChatGPT Emulation**

Last Updated: October 17, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Usage Guide](#usage-guide)
5. [API Reference](#api-reference)
6. [Configuration](#configuration)
7. [Examples](#examples)
8. [Best Practices](#best-practices)
9. [Performance](#performance)
10. [Browser Compatibility](#browser-compatibility)

---

## Overview

The Unido Widget Preview system is a development tool for building and testing AI application widgets. It provides two rendering modes:

### Direct Load Mode
Fast, direct React component rendering for rapid iteration during development.

**Use When:**
- Developing widget UI and styling
- Testing component props
- Debugging React component logic
- No MCP integration needed

**Features:**
- Instant rendering (< 100ms)
- React DevTools support
- Hot module reload
- Direct prop updates

### MCP Load Mode
Full ChatGPT environment emulation with Model Context Protocol (MCP) integration.

**Use When:**
- Testing complete widget integration
- Verifying tool call behavior
- Testing window.openai API usage
- Preparing for production deployment
- Debugging MCP-specific issues

**Features:**
- Complete window.openai API emulation
- MCP tool call testing
- Connection status monitoring
- Real-time logging
- Performance metrics
- Production-equivalent environment

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Preview Application                       │
│  (packages/dev/public/src/preview-app.tsx)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Mode Toggle  │  │ Prop Editor  │  │ Component    │      │
│  │              │  │              │  │ Selector     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Preview Area                        │  │
│  │                                                       │  │
│  │  Direct Mode:                  MCP Mode:             │  │
│  │  ┌────────────────┐            ┌────────────────┐    │  │
│  │  │ React          │            │ Iframe +       │    │  │
│  │  │ Component      │            │ window.openai  │    │  │
│  │  └────────────────┘            └────────────────┘    │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  MCP Mode Only:                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ MCP Status   │  │ Tool Call    │  │ Log Panel    │      │
│  │ Indicator    │  │ Panel        │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌──────────────────────────┐
              │   MCP Client             │
              │   (SSE Transport)        │
              └──────────────────────────┘
                            │
                            ▼
              ┌──────────────────────────┐
              │   Unido MCP Server       │
              │   (localhost:3000)       │
              └──────────────────────────┘
```

### Data Flow

**Direct Mode:**
```
User Input → Prop Editor → React Component → Direct Render
```

**MCP Mode:**
```
User Input → Prop Editor → MCP Client → Iframe Renderer
                                            │
                                            ▼
                              window.openai Emulator
                                            │
                                            ▼
                              Widget HTML + React Bundle
                                            │
                                            ▼
                              Tool Calls → MCP Server
```

### Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Model Context Protocol** - Widget/tool communication
- **SSE (Server-Sent Events)** - Real-time MCP transport
- **Vite** - Development server and bundling
- **Iframe Sandboxing** - Widget isolation

---

## Getting Started

### Prerequisites

```bash
# Node.js 18+ and pnpm
node --version  # v18.0.0+
pnpm --version  # 8.0.0+

# Unido monorepo cloned and dependencies installed
cd /path/to/unido
pnpm install
pnpm run build
```

### Starting the Preview App

**Step 1: Start MCP Server** (if using MCP mode)

```bash
# Use example app or your own
cd examples/weather-app
pnpm run dev

# Server should start at http://localhost:3000
# You should see: "MCP server listening on http://localhost:3000"
```

**Step 2: Start Preview App**

```bash
cd packages/dev
pnpm run dev

# Opens browser automatically
# URL: http://localhost:5173 (or similar)
```

### Verifying Setup

You should see:
- Widget preview interface loads
- Component list in sidebar
- Default mode: "Direct Load"

To verify MCP mode:
1. Ensure MCP server is running (Step 1)
2. Click "MCP Load" button in header
3. Status should show: 🟢 Connected
4. Select a widget - it should load in iframe

---

## Usage Guide

### Basic Workflow

#### 1. Select a Widget

Click any widget in the sidebar:
- **Weather Card** - Simple display widget
- **Todo List** - Interactive widget with state
- **Custom** - Your registered widgets

#### 2. Edit Props

Use the Prop Editor panel to modify widget properties:

```typescript
{
  "city": "San Francisco",
  "temperature": 72,
  "condition": "sunny"
}
```

Props update in real-time in both modes.

#### 3. Choose Rendering Mode

**Direct Load** (recommended for development):
- Fast rendering
- React DevTools available
- Immediate prop updates
- No server required

**MCP Load** (recommended for integration testing):
- Full ChatGPT environment
- Test tool calls
- Production-equivalent
- Requires MCP server

### Mode Toggle

Switch between modes using the header buttons:

```
┌─────────────────────────────────────────────────────┐
│  🎨 Unido Widget Preview                           │
│                                                     │
│  Load Mode: [Direct Load] [MCP Load]               │
│  View: [Single] [Gallery]                          │
└─────────────────────────────────────────────────────┘
```

**Mode Persistence:**
- Your selection is saved in localStorage
- Persists across browser sessions
- Key: `unido:preview:loadMode`

### Using MCP Mode Features

#### Connection Status

Monitor MCP connection in the status bar:

- **🟢 Connected** - Ready to use
- **🟡 Connecting...** - Establishing connection
- **🔴 Disconnected** - Server not available
- **⚠️ Error** - Connection error occurred

If disconnected, click **Reconnect** button.

#### Tool Call Panel

Test MCP tool calls interactively:

**Step 1:** Select a tool from dropdown
```
Available Tools:
- get_weather
- search_location
- get_forecast
```

**Step 2:** Enter JSON arguments
```json
{
  "city": "New York",
  "units": "fahrenheit"
}
```

**Step 3:** Click **Execute Tool**

**Step 4:** View result
```json
{
  "temperature": 68,
  "condition": "Partly Cloudy",
  "humidity": 65
}
```

#### Log Panel

Monitor all events in real-time:

**Filter by Level:**
- All - Show everything
- Debug - Performance metrics
- Info - Normal operations
- Warn - Non-critical issues
- Error - Failures

**Log Entry Format:**
```
[13:45:23.456] [INFO] Widget weather-card loaded
[13:45:24.789] [DEBUG] Performance: widget_render 234ms
[13:45:30.123] [ERROR] Tool call failed: connection timeout
```

**Clear Logs:** Click **Clear** button

### Display Modes

**Single View:**
- Focus on one widget
- Full prop editor
- Detailed preview
- Tool testing (MCP mode)

**Gallery View:**
- See all widgets at once
- Quick comparison
- No prop editing
- Useful for visual overview

---

## API Reference

### McpWidgetClient

Main client for MCP communication.

```typescript
import { McpWidgetClient } from '@bandofai/unido-dev';

const client = new McpWidgetClient({
  serverUrl: 'http://localhost:3000',
  timeout: 10000,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  logger: (level, message, data) => {
    console.log(`[${level}] ${message}`, data);
  },
});

// Connect to server
await client.connect();

// Check connection
const isConnected = client.isConnected();
const state = client.getConnectionState();

// List available widgets
const widgets = await client.listWidgets();

// Load widget HTML
const html = await client.loadWidget('weather-card');

// Call a tool
const result = await client.callTool('get_weather', {
  city: 'San Francisco'
});

// Disconnect
client.disconnect();
```

**Constructor Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `serverUrl` | `string` | required | MCP server URL |
| `timeout` | `number` | `10000` | Connection timeout (ms) |
| `autoReconnect` | `boolean` | `true` | Auto-reconnect on disconnect |
| `maxReconnectAttempts` | `number` | `3` | Max reconnection attempts |
| `reconnectDelay` | `number` | `1000` | Delay between reconnects (ms) |
| `logger` | `LoggerFunction` | `undefined` | Custom logger callback |

**Methods:**

- `connect(): Promise<void>` - Connect to MCP server
- `disconnect(): void` - Disconnect from server
- `isConnected(): boolean` - Check connection status
- `getConnectionState(): ConnectionState` - Get detailed state
- `listWidgets(): Promise<WidgetInfo[]>` - List available widgets
- `loadWidget(type: string): Promise<string>` - Load widget HTML
- `callTool(name: string, args: unknown): Promise<ToolCallResult>` - Execute tool

### WindowOpenAIEmulator

Emulates ChatGPT's `window.openai` API.

```typescript
import { WindowOpenAIEmulator } from '@bandofai/unido-dev';

const emulator = new WindowOpenAIEmulator({
  toolInput: { city: 'San Francisco' },
  toolOutput: { temperature: 72 },
  displayMode: 'inline',
  theme: 'light',
  onCallTool: async (name, args) => {
    console.log(`Tool called: ${name}`, args);
    return { result: 'success' };
  },
  onSetWidgetState: (state) => {
    console.log('Widget state updated:', state);
  },
  onSetDisplayMode: (mode) => {
    console.log('Display mode changed:', mode);
  },
});

// Inject into iframe
const iframeWindow = iframe.contentWindow;
emulator.injectIntoWindow(iframeWindow);

// Get API object (for inspection)
const api = emulator.getAPI();

// Update tool output
emulator.updateToolOutput({ temperature: 75 });

// Update display mode
emulator.updateDisplayMode('fullscreen');

// Update theme
emulator.updateTheme('dark');
```

**Constructor Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `toolInput` | `Record<string, any>` | `{}` | Tool input parameters |
| `toolOutput` | `Record<string, any>` | `{}` | Tool execution result |
| `displayMode` | `DisplayMode` | `'inline'` | Widget display mode |
| `theme` | `Theme` | `'light'` | UI theme |
| `onCallTool` | `Function` | `undefined` | Tool call callback |
| `onSetWidgetState` | `Function` | `undefined` | State change callback |
| `onSetDisplayMode` | `Function` | `undefined` | Display mode callback |

### WidgetIframeRenderer

React component for rendering widgets in iframe.

```typescript
import { WidgetIframeRenderer } from '@bandofai/unido-dev';

<WidgetIframeRenderer
  mcpClient={mcpClient}
  widgetType="weather-card"
  toolInput={{ city: 'San Francisco' }}
  toolOutput={{ temperature: 72 }}
  displayMode="inline"
  theme="light"
  loadingTimeout={30000}
  validateHtml={true}
  onLoad={() => console.log('Widget loaded')}
  onError={(error) => console.error('Widget error:', error)}
  onToolCall={(name, args, result) => {
    console.log('Tool call:', name, args, result);
  }}
  onStateChange={(state) => {
    console.log('State changed:', state);
  }}
  onPerformanceMetric={(metric) => {
    console.log('Performance:', metric);
  }}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mcpClient` | `McpWidgetClient` | required | MCP client instance |
| `widgetType` | `string` | required | Widget type identifier |
| `toolInput` | `object` | `{}` | Tool input parameters |
| `toolOutput` | `object` | `{}` | Tool output data |
| `displayMode` | `DisplayMode` | `'inline'` | Display mode |
| `theme` | `Theme` | `'light'` | UI theme |
| `loadingTimeout` | `number` | `30000` | Load timeout (ms) |
| `validateHtml` | `boolean` | `true` | Validate HTML |
| `onLoad` | `Function` | `undefined` | Load callback |
| `onError` | `Function` | `undefined` | Error callback |
| `onToolCall` | `Function` | `undefined` | Tool call callback |
| `onStateChange` | `Function` | `undefined` | State change callback |
| `onPerformanceMetric` | `Function` | `undefined` | Performance callback |

### UI Components

#### McpStatus

Connection status indicator.

```typescript
import { McpStatus } from '@bandofai/unido-dev';

<McpStatus
  client={mcpClient}
  onReconnect={handleReconnect}
  showDetails={true}
  style={{ marginBottom: '16px' }}
/>
```

#### ToolCallPanel

Interactive tool testing panel.

```typescript
import { ToolCallPanel } from '@bandofai/unido-dev';

<ToolCallPanel
  client={mcpClient}
  onToolCall={(name, args, result) => {
    console.log('Tool executed:', name, args, result);
  }}
  onError={(error) => console.error(error)}
/>
```

#### LogPanel

Real-time log display.

```typescript
import { LogPanel, type LogEntry } from '@bandofai/unido-dev';

const [logs, setLogs] = useState<LogEntry[]>([]);

<LogPanel
  logs={logs}
  onClear={() => setLogs([])}
  maxLogs={200}
/>
```

---

## Configuration

### MCP Server Configuration

Configure your Unido app's MCP server:

```typescript
// examples/weather-app/src/index.ts
import { createApp } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';

const app = createApp({
  providers: {
    openai: openAI({
      port: 3000,              // Preview app expects this port
      enableWidgets: true,      // Enable widget loading
      enableToolCalls: true,    // Enable tool call testing
    }),
  },
});

// Register widgets
app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Display weather information',
  sourcePath: './components/WeatherCard.tsx',
});

// Start server
await app.start();
```

### Preview App Configuration

Customize the preview app:

```typescript
// packages/dev/public/src/preview-app.tsx

// Change default MCP server URL
const [mcpClient] = useState(() => new McpWidgetClient({
  serverUrl: 'http://localhost:3001',  // Custom port
  autoReconnect: true,
  maxReconnectAttempts: 10,            // More attempts
  logger: customLogger,                // Custom logging
}));

// Change default mode
const [loadMode, setLoadMode] = useState<LoadMode>('mcp');  // Default to MCP

// Change default log limit
<LogPanel logs={logs} maxLogs={500} />
```

### Environment Variables

```bash
# Development
VITE_MCP_SERVER_URL=http://localhost:3000
VITE_DEFAULT_MODE=direct
VITE_LOG_LEVEL=debug

# Production
VITE_MCP_SERVER_URL=https://your-server.com
VITE_DEFAULT_MODE=mcp
VITE_LOG_LEVEL=info
```

---

## Examples

### Example 1: Basic Widget

Simple read-only widget:

```typescript
// components/WeatherCard.tsx
import React from 'react';

interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  city,
  temperature,
  condition,
}) => {
  return (
    <div style={{ padding: '20px', borderRadius: '8px', background: '#f0f9ff' }}>
      <h2>{city}</h2>
      <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
        {temperature}°F
      </div>
      <div style={{ fontSize: '18px', color: '#64748b' }}>
        {condition}
      </div>
    </div>
  );
};
```

**Register in app:**
```typescript
app.component({
  type: 'weather-card',
  title: 'Weather Card',
  sourcePath: './components/WeatherCard.tsx',
});
```

**Use in Preview:**
1. Start app: `pnpm run dev`
2. Open preview: `cd packages/dev && pnpm run dev`
3. Select "Weather Card" from sidebar
4. Edit props: `{ "city": "Tokyo", "temperature": 68, "condition": "Clear" }`
5. See live preview

### Example 2: Interactive Widget with Tool Calls

Widget that calls MCP tools:

```typescript
// components/CitySearch.tsx
import React, { useState } from 'react';

// Access window.openai API
declare global {
  interface Window {
    openai?: {
      callTool: (name: string, args: unknown) => Promise<{ result: unknown }>;
    };
  }
}

export const CitySearch: React.FC = () => {
  const [city, setCity] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSearch = async () => {
    if (!window.openai) {
      alert('window.openai not available');
      return;
    }

    try {
      const response = await window.openai.callTool('search_city', { city });
      setResult(response.result);
    } catch (error) {
      console.error('Tool call failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
        style={{ padding: '8px', marginRight: '8px' }}
      />
      <button onClick={handleSearch}>Search</button>

      {result && (
        <div style={{ marginTop: '16px' }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

**Register tool in app:**
```typescript
app.tool('search_city', {
  description: 'Search for city information',
  input: z.object({
    city: z.string().describe('City name'),
  }),
  handler: async ({ city }) => {
    // Fetch city data
    return textResponse(`Found: ${city}`);
  },
});
```

**Test in Preview (MCP Mode):**
1. Switch to "MCP Load"
2. Verify 🟢 Connected
3. Select "City Search" widget
4. Click search button in widget
5. See tool call in Log Panel
6. Result displayed in widget

### Example 3: Stateful Widget

Widget with persistent state:

```typescript
// components/TodoList.tsx
import React, { useState, useEffect } from 'react';

// Access window.openai for state management
declare global {
  interface Window {
    openai?: {
      widgetState: Record<string, any>;
      setWidgetState: (state: Record<string, any>) => void;
    };
  }
}

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState('');

  // Load state from window.openai
  useEffect(() => {
    if (window.openai?.widgetState?.todos) {
      setTodos(window.openai.widgetState.todos);
    }
  }, []);

  // Save state to window.openai
  const saveTodos = (newTodos: string[]) => {
    setTodos(newTodos);
    window.openai?.setWidgetState({ todos: newTodos });
  };

  const addTodo = () => {
    if (input.trim()) {
      saveTodos([...todos, input]);
      setInput('');
    }
  };

  const removeTodo = (index: number) => {
    saveTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Todo List</h3>

      <div style={{ marginBottom: '16px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul>
        {todos.map((todo, i) => (
          <li key={i}>
            {todo}
            <button onClick={() => removeTodo(i)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

**Test State Persistence:**
1. Add todos in widget
2. Reload component (change selection and back)
3. State should persist (MCP mode only)

---

## Best Practices

### Development Workflow

**1. Start with Direct Mode**
- Faster iteration
- Use React DevTools
- Focus on UI/UX first

**2. Test in MCP Mode**
- Verify tool calls work
- Test state persistence
- Check production behavior

**3. Use Tool Call Panel**
- Test tools independently
- Verify input validation
- Check error handling

**4. Monitor Logs**
- Watch for errors
- Track performance
- Debug issues

### Widget Development

**DO:**
- ✅ Check for `window.openai` availability
- ✅ Handle tool call errors gracefully
- ✅ Provide loading states
- ✅ Use TypeScript for type safety
- ✅ Test in both modes

**DON'T:**
- ❌ Assume `window.openai` exists (direct mode)
- ❌ Make unhandled tool calls
- ❌ Ignore connection states
- ❌ Skip error boundaries
- ❌ Only test in direct mode

### Error Handling

**Always wrap tool calls:**
```typescript
const handleAction = async () => {
  if (!window.openai) {
    console.warn('window.openai not available');
    return;
  }

  try {
    const result = await window.openai.callTool('action', args);
    // Handle success
  } catch (error) {
    console.error('Tool call failed:', error);
    // Show user-friendly message
  }
};
```

### Performance Optimization

**1. Minimize Re-renders**
```typescript
// Use React.memo for static components
export const WeatherCard = React.memo<WeatherCardProps>(({ ... }) => {
  // Component implementation
});
```

**2. Debounce Tool Calls**
```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query: string) => {
  await window.openai?.callTool('search', { query });
}, 300);
```

**3. Lazy Load Heavy Components**
```typescript
const HeavyChart = React.lazy(() => import('./HeavyChart'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyChart data={data} />
</Suspense>
```

---

## Performance

### Benchmarks

**Direct Mode:**
- Initial load: < 100ms
- Prop update: < 50ms
- Re-render: < 30ms

**MCP Mode:**
- Initial connection: < 500ms
- Widget load: < 1000ms
- Tool call: < 300ms (network dependent)
- State update: < 100ms

### Monitoring

Use `onPerformanceMetric` callback:

```typescript
<WidgetIframeRenderer
  onPerformanceMetric={(metric) => {
    console.log(`${metric.name}: ${metric.duration}ms`);

    // Send to analytics
    if (metric.duration > 1000) {
      console.warn(`Slow ${metric.name}: ${metric.duration}ms`);
    }
  }}
/>
```

**Metrics Tracked:**
- `widget_load` - Widget HTML fetch and parse
- `widget_render` - Iframe render complete
- `tool_call` - Tool execution time
- `state_update` - State persistence time

### Optimization Tips

**1. Reduce Bundle Size**
- Use tree-shaking
- Lazy load components
- Minimize dependencies

**2. Optimize Images**
- Use WebP format
- Lazy load images
- Proper sizing

**3. Cache Aggressively**
- Cache widget HTML
- Cache tool results (when appropriate)
- Use service workers

**4. Minimize Tool Calls**
- Batch requests
- Debounce user input
- Cache results locally

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Direct Mode | MCP Mode | Notes |
|---------|---------|-------------|----------|-------|
| Chrome | 90+ | ✅ | ✅ | Recommended |
| Firefox | 88+ | ✅ | ✅ | Full support |
| Safari | 14+ | ✅ | ✅ | Requires CORS setup |
| Edge | 90+ | ✅ | ✅ | Chromium-based |

### Known Issues

**Safari:**
- SSE reconnection slower than Chrome/Firefox
- Solution: Increase `reconnectDelay` to 2000ms

**Firefox:**
- DevTools may not show iframe console logs
- Solution: Use Log Panel in MCP mode

**All Browsers:**
- Requires modern ES2020+ support
- No IE11 support

### Feature Detection

```typescript
// Check for required features
const isSupported = () => {
  return (
    'EventSource' in window &&      // SSE support
    'postMessage' in window &&      // iframe communication
    'localStorage' in window &&     // State persistence
    'fetch' in window               // Network requests
  );
};

if (!isSupported()) {
  alert('Browser not supported. Please use Chrome 90+, Firefox 88+, or Safari 14+');
}
```

---

## Troubleshooting

For detailed troubleshooting, see [WIDGET_PREVIEW_TROUBLESHOOTING.md](./WIDGET_PREVIEW_TROUBLESHOOTING.md).

**Quick Fixes:**

**Problem:** Widget won't load in MCP mode
- Check MCP server is running (`lsof -i :3000`)
- Verify 🟢 Connected status
- Check browser console for errors

**Problem:** Tool calls not working
- Verify tool is registered in app
- Check tool call syntax in Log Panel
- Test tool in Tool Call Panel first

**Problem:** State not persisting
- Only works in MCP mode
- Check `window.openai.widgetState` in console
- Verify `setWidgetState` is being called

---

## Additional Resources

- [Troubleshooting Guide](./WIDGET_PREVIEW_TROUBLESHOOTING.md)
- [MCP Client Documentation](../../packages/dev/src/mcp-client.ts)
- [OpenAI Emulator Documentation](../../packages/dev/src/window-openai-emulator.ts)
- [Example Widgets](../../examples/weather-app/)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)

---

**Last Updated:** October 17, 2025
**Version:** 1.0.0
**Maintainers:** Unido Core Team
