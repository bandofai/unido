# @bandofai/unido-dev

**Unido Development Utilities & Widget Preview**

Development tools for building and testing Unido widgets with full ChatGPT environment emulation.

---

## Features

### 🎨 Widget Preview Application
Interactive preview environment with two rendering modes:
- **Direct Load**: Fast React component rendering for rapid development
- **MCP Load**: Full ChatGPT environment emulation for integration testing

### 🔌 MCP Client
Production-ready Model Context Protocol client with:
- SSE (Server-Sent Events) transport
- Auto-reconnection with exponential backoff
- Widget loading and tool call execution
- Connection state management

### 🖼️ Widget Iframe Renderer
React component for rendering widgets in isolated iframes with:
- Complete `window.openai` API emulation
- Tool call handling
- State persistence
- Performance monitoring

### 📊 Development UI Components
- **McpStatus**: Real-time connection status indicator
- **ToolCallPanel**: Interactive tool testing panel
- **LogPanel**: Real-time logging with filtering

---

## Installation

```bash
# Install in your Unido project
pnpm add -D @bandofai/unido-dev

# Or use within the monorepo
cd packages/dev
pnpm install
```

---

## Quick Start

### Starting the Preview App

**1. Start your Unido MCP server:**
```bash
cd your-unido-app
pnpm run dev

# Server should start at http://localhost:3000
```

**2. Start the widget preview:**
```bash
cd packages/dev
pnpm run dev

# Opens browser at http://localhost:5173
```

**3. Use the preview:**
- Select a widget from the sidebar
- Choose "Direct Load" for fast development
- Choose "MCP Load" for full testing
- Edit props in the Prop Editor
- See live preview

---

## Usage

### Using the MCP Client

```typescript
import { McpWidgetClient } from '@bandofai/unido-dev';

// Create client
const client = new McpWidgetClient({
  serverUrl: 'http://localhost:3000',
  autoReconnect: true,
  maxReconnectAttempts: 5,
  logger: (level, message, data) => {
    console.log(`[${level}] ${message}`, data);
  },
});

// Connect to server
await client.connect();

// List available widgets
const widgets = await client.listWidgets();
console.log(widgets);
// [
//   {
//     type: 'weather-card',
//     title: 'Weather Card',
//     uri: 'ui://widget/weather-card.html'
//   }
// ]

// Load widget HTML
const html = await client.loadWidget('weather-card');

// Call a tool
const result = await client.callTool('get_weather', {
  city: 'San Francisco'
});

// Disconnect
client.disconnect();
```

### Using the Widget Iframe Renderer

```typescript
import { WidgetIframeRenderer } from '@bandofai/unido-dev';
import { McpWidgetClient } from '@bandofai/unido-dev';

function App() {
  const [client] = useState(() => new McpWidgetClient({
    serverUrl: 'http://localhost:3000',
  }));

  useEffect(() => {
    client.connect();
    return () => client.disconnect();
  }, []);

  return (
    <WidgetIframeRenderer
      mcpClient={client}
      widgetType="weather-card"
      toolOutput={{ city: 'San Francisco', temperature: 72 }}
      displayMode="inline"
      theme="light"
      onLoad={() => console.log('Widget loaded')}
      onError={(error) => console.error('Widget error:', error)}
      onToolCall={(name, args, result) => {
        console.log('Tool called:', name, args, result);
      }}
    />
  );
}
```

### Using UI Components

```typescript
import { McpStatus, ToolCallPanel, LogPanel } from '@bandofai/unido-dev';
import type { LogEntry } from '@bandofai/unido-dev';

function DevTools() {
  const [client] = useState(() => new McpWidgetClient({
    serverUrl: 'http://localhost:3000',
  }));
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (level: LogEntry['level'], message: string, data?: unknown) => {
    setLogs(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      level,
      message,
      data,
    }]);
  };

  return (
    <div>
      {/* Connection Status */}
      <McpStatus
        client={client}
        onReconnect={() => client.connect()}
        showDetails={true}
      />

      {/* Tool Testing */}
      <ToolCallPanel
        client={client}
        onToolCall={(name, args, result) => {
          addLog('info', `Tool ${name} called`, { args, result });
        }}
        onError={(error) => addLog('error', 'Tool error', error)}
      />

      {/* Logs */}
      <LogPanel
        logs={logs}
        onClear={() => setLogs([])}
        maxLogs={200}
      />
    </div>
  );
}
```

---

## API Reference

### McpWidgetClient

**Constructor Options:**

```typescript
interface McpClientOptions {
  serverUrl: string;              // MCP server URL (required)
  timeout?: number;               // Connection timeout (default: 10000ms)
  autoReconnect?: boolean;        // Auto-reconnect on disconnect (default: true)
  maxReconnectAttempts?: number;  // Max reconnection attempts (default: 3)
  reconnectDelay?: number;        // Delay between reconnects (default: 1000ms)
  logger?: LoggerFunction;        // Custom logger callback
}
```

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `connect()` | `Promise<void>` | Connect to MCP server |
| `disconnect()` | `void` | Disconnect from server |
| `isConnected()` | `boolean` | Check connection status |
| `getConnectionState()` | `ConnectionState` | Get detailed connection state |
| `listWidgets()` | `Promise<WidgetInfo[]>` | List available widgets |
| `loadWidget(type)` | `Promise<string>` | Load widget HTML |
| `callTool(name, args)` | `Promise<ToolCallResult>` | Execute MCP tool |

### WindowOpenAIEmulator

```typescript
interface WindowOpenAIEmulatorOptions {
  toolInput?: Record<string, any>;           // Tool input parameters
  toolOutput?: Record<string, any>;          // Tool output data
  displayMode?: 'inline' | 'fullscreen' | 'sidebar';
  theme?: 'light' | 'dark';
  onCallTool?: (name: string, args: unknown) => Promise<{ result: unknown }>;
  onSetWidgetState?: (state: Record<string, any>) => void;
  onSetDisplayMode?: (mode: DisplayMode) => void;
}
```

**Methods:**

| Method | Description |
|--------|-------------|
| `injectIntoWindow(window)` | Inject window.openai API into iframe |
| `getAPI()` | Get window.openai API object |
| `updateToolOutput(output)` | Update tool output data |
| `updateDisplayMode(mode)` | Update display mode |
| `updateTheme(theme)` | Update theme |

### WidgetIframeRenderer Props

```typescript
interface WidgetIframeRendererProps {
  mcpClient: McpWidgetClient;           // MCP client instance (required)
  widgetType: string;                   // Widget type identifier (required)
  toolInput?: Record<string, any>;      // Tool input parameters
  toolOutput?: Record<string, any>;     // Tool output data
  displayMode?: DisplayMode;            // Display mode (default: 'inline')
  theme?: Theme;                        // UI theme (default: 'light')
  loadingTimeout?: number;              // Load timeout (default: 30000ms)
  validateHtml?: boolean;               // Validate HTML (default: true)
  onLoad?: () => void;                  // Load callback
  onError?: (error: Error) => void;     // Error callback
  onToolCall?: (name: string, args: unknown, result: unknown) => void;
  onStateChange?: (state: Record<string, any>) => void;
  onPerformanceMetric?: (metric: PerformanceMetric) => void;
}
```

### UI Component Props

**McpStatus:**
```typescript
interface McpStatusProps {
  client: McpWidgetClient;         // MCP client instance
  onReconnect?: () => void;        // Reconnect callback
  showDetails?: boolean;           // Show connection details (default: false)
  style?: React.CSSProperties;     // Custom styles
  className?: string;              // CSS class name
}
```

**ToolCallPanel:**
```typescript
interface ToolCallPanelProps {
  client: McpWidgetClient;         // MCP client instance
  onToolCall?: (name: string, args: unknown, result: unknown) => void;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
  className?: string;
}
```

**LogPanel:**
```typescript
interface LogPanelProps {
  logs: LogEntry[];                // Log entries
  onClear?: () => void;            // Clear logs callback
  maxLogs?: number;                // Max logs to display (default: 100)
  style?: React.CSSProperties;
  className?: string;
}

interface LogEntry {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
}
```

---

## Configuration

### Preview App Configuration

Edit `packages/dev/public/src/preview-app.tsx`:

```typescript
// Change default MCP server URL
const [mcpClient] = useState(() => new McpWidgetClient({
  serverUrl: 'http://localhost:3001',  // Custom port
}));

// Change default mode
const [loadMode, setLoadMode] = useState<LoadMode>('mcp');  // Default to MCP

// Change log limit
<LogPanel logs={logs} maxLogs={500} />
```

### Environment Variables

Create `.env` in `packages/dev/`:

```bash
VITE_MCP_SERVER_URL=http://localhost:3000
VITE_DEFAULT_MODE=direct
VITE_LOG_LEVEL=debug
```

---

## Development

### Project Structure

```
packages/dev/
├── src/
│   ├── components/
│   │   ├── McpStatus.tsx          # Connection status indicator
│   │   ├── ToolCallPanel.tsx      # Tool testing panel
│   │   ├── LogPanel.tsx           # Log display
│   │   └── WidgetIframeRenderer.tsx # Widget renderer
│   ├── types/
│   │   └── mcp-types.ts           # TypeScript types
│   ├── mcp-client.ts              # MCP client
│   ├── window-openai-emulator.ts  # ChatGPT API emulator
│   └── index.ts                   # Main exports
├── public/
│   ├── src/
│   │   ├── preview-app.tsx        # Preview application
│   │   ├── prop-editor.tsx        # Props editor
│   │   └── error-boundary.tsx     # Error boundary
│   └── index.html                 # HTML template
├── package.json
├── tsconfig.json
└── vite.config.ts                 # Vite configuration
```

### Building

```bash
# Build TypeScript
pnpm run build

# Watch mode
pnpm run dev

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

### Testing

```bash
# Unit tests (TODO)
pnpm run test

# Manual testing with preview app
pnpm run dev
```

---

## Examples

### Complete Example App

```typescript
// app.ts - Your Unido app
import { createApp } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';

const app = createApp({
  providers: {
    openai: openAI({ port: 3000 }),
  },
});

// Register component
app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Display weather information',
  sourcePath: './components/WeatherCard.tsx',
});

// Register tool
app.tool('get_weather', {
  description: 'Get weather for a city',
  input: z.object({
    city: z.string().describe('City name'),
  }),
  handler: async ({ city }) => {
    // Fetch weather data
    return {
      content: [{
        type: 'text',
        text: `Weather in ${city}: 72°F, Sunny`,
      }],
      component: {
        type: 'weather-card',
        props: { city, temperature: 72, condition: 'Sunny' },
      },
    };
  },
});

await app.start();
```

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

**Usage:**

1. Start app: `pnpm run dev` (in app directory)
2. Start preview: `cd packages/dev && pnpm run dev`
3. Select "Weather Card" widget
4. Switch between Direct/MCP modes
5. Edit props to see live updates

---

## Troubleshooting

### Widget Not Loading

**Check:**
- MCP server is running (`lsof -i :3000`)
- Connection status shows 🟢 Connected
- Widget is registered in app
- Browser console for errors

**Solutions:**
- Click "Reconnect" button
- Restart MCP server
- Check server logs
- Verify widget registration

### Tool Calls Failing

**Check:**
- Tool is registered in app
- Arguments match tool schema
- Tool Call Panel shows available tools

**Solutions:**
- Test tool in Tool Call Panel first
- Verify argument types
- Check server logs for errors
- Add error handling to tool handler

### More Help

See full troubleshooting guide: [docs/development/WIDGET_PREVIEW_TROUBLESHOOTING.md](../../docs/development/WIDGET_PREVIEW_TROUBLESHOOTING.md)

---

## Documentation

- **[Widget Preview Guide](../../docs/development/WIDGET_PREVIEW.md)** - Complete documentation
- **[Troubleshooting](../../docs/development/WIDGET_PREVIEW_TROUBLESHOOTING.md)** - Common issues and solutions
- **[OpenAI Integration](../../docs/providers/openai/OPENAI_APPS_SDK.md)** - OpenAI-specific documentation

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |

Requires modern ES2020+ support. No IE11 support.

---

## Contributing

### Development Setup

```bash
# Clone monorepo
git clone https://github.com/bandofai/unido.git
cd unido

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start dev server
cd packages/dev
pnpm run dev
```

### Adding Features

1. Create feature branch
2. Make changes
3. Add tests
4. Update documentation
5. Submit PR

---

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

## Links

- **Repository**: https://github.com/bandofai/unido
- **Issues**: https://github.com/bandofai/unido/issues
- **Discussions**: https://github.com/bandofai/unido/discussions
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

**Version**: 0.1.6
**Last Updated**: October 17, 2025
