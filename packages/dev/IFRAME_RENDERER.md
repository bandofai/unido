## Iframe Renderer & window.openai Emulation

Complete ChatGPT environment emulation for local widget development. Render widgets in an isolated iframe with the full `window.openai` API injected.

---

## Features

- **✅ Complete window.openai API** - All properties and methods implemented
- **✅ MCP Integration** - Load widgets via MCP, bridge tool calls
- **✅ State Management** - Persist widget state across re-renders
- **✅ Display Modes** - Support inline, PiP, and fullscreen modes
- **✅ Event System** - Full `openai:set_globals` and `openai:tool_response` events
- **✅ React Component** - Easy-to-use React component
- **✅ TypeScript** - Full type safety and IDE support
- **✅ Error Handling** - Graceful error states and loading indicators

---

## Quick Start

```tsx
import { McpWidgetClient, WidgetIframeRenderer } from '@bandofai/unido-dev';

// Create MCP client
const client = new McpWidgetClient({
  serverUrl: 'http://localhost:3000'
});

await client.connect();

// Render widget
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="weather-card"
  toolOutput={{ city: 'Portland', temperature: 72 }}
  displayMode="inline"
  onStateChange={(state) => console.log('State:', state)}
/>
```

---

## Components

### `WidgetIframeRenderer`

React component that renders a widget in an isolated iframe with window.openai API.

#### Props

```typescript
interface WidgetIframeRendererProps {
  // Required
  mcpClient: McpWidgetClient;  // MCP client for loading widgets
  widgetType: string;            // Widget to render (e.g., 'weather-card')

  // Widget Data
  toolInput?: unknown;           // Tool arguments
  toolOutput?: unknown;          // Tool result (structuredContent)
  initialWidgetState?: Record<string, unknown>;

  // Display Settings
  displayMode?: 'inline' | 'pip' | 'fullscreen';  // Default: 'inline'
  theme?: 'light' | 'dark';      // Default: 'light'
  maxHeight?: number;            // Default: 600
  locale?: string;               // Default: 'en-US'

  // Callbacks
  onStateChange?: (state: Record<string, unknown>) => void;
  onDisplayModeRequest?: (mode: DisplayMode) => DisplayMode;
  onOpenExternal?: (href: string) => void;
  onFollowupTurn?: (prompt: string) => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;

  // Customization
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error) => React.ReactNode;
  sandbox?: string;              // Default: 'allow-scripts allow-same-origin'
  iframeStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  className?: string;
}
```

#### Example

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="weather-card"
  toolOutput={{
    city: 'Portland',
    temperature: 72,
    condition: 'Sunny'
  }}
  displayMode="inline"
  theme="light"
  maxHeight={600}
  onStateChange={(state) => {
    console.log('Widget state:', state);
  }}
  onDisplayModeRequest={(mode) => {
    console.log('Display mode request:', mode);
    return mode; // Grant the request
  }}
  onOpenExternal={(href) => {
    window.open(href, '_blank');
  }}
  onFollowupTurn={(prompt) => {
    console.log('Follow-up:', prompt);
  }}
/>
```

### `WindowOpenAIEmulator`

Low-level class for creating window.openai API implementations.

#### Constructor Options

```typescript
interface WindowOpenAIEmulatorOptions {
  mcpClient: McpWidgetClient;
  toolInput?: unknown;
  toolOutput?: unknown;
  initialWidgetState?: Record<string, unknown>;
  displayMode?: DisplayMode;
  theme?: Theme;
  maxHeight?: number;
  locale?: string;
  targetWindow?: Window;
  onStateChange?: (state: Record<string, unknown>) => void;
  onDisplayModeRequest?: (mode: DisplayMode) => DisplayMode;
  onOpenExternal?: (href: string) => void;
  onFollowupTurn?: (prompt: string) => void;
}
```

#### Example

```typescript
// Create emulator
const emulator = new WindowOpenAIEmulator({
  mcpClient,
  toolOutput: { city: 'Portland', temperature: 72 },
  displayMode: 'inline',
});

// Inject into iframe
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
emulator.injectIntoWindow(iframe.contentWindow);

// Or get API object
const api = emulator.getAPI();
console.log(api.toolOutput); // { city: 'Portland', temperature: 72 }

// Update properties
emulator.setToolOutput({ city: 'Seattle', temperature: 65 });
emulator.setDisplayMode('fullscreen');
emulator.setTheme('dark');

// Cleanup
emulator.cleanup();
```

---

## window.openai API Implementation

The emulator provides a complete implementation of the ChatGPT `window.openai` API.

### Properties (Read-only)

```typescript
interface WindowOpenAI {
  // Tool data
  readonly toolInput?: unknown;       // Arguments passed to tool
  readonly toolOutput?: unknown;      // Tool response data
  readonly widgetState?: Record<string, unknown>;  // Persisted state

  // Display settings
  readonly displayMode?: 'inline' | 'pip' | 'fullscreen';
  readonly maxHeight?: number;        // Max height in pixels
  readonly locale?: string;           // BCP 47 locale (e.g., 'en-US')
  readonly theme?: 'light' | 'dark';  // Current theme
}
```

### Methods

#### `setWidgetState(state)`

Persist widget state across re-renders.

```typescript
await window.openai?.setWidgetState?.({
  selectedCity: 'Portland',
  favorites: ['Portland', 'Seattle']
});
```

#### `callTool(name, args)`

Execute a tool call on the MCP server.

```typescript
const result = await window.openai?.callTool?.('refresh_weather', {
  city: 'Portland'
});
console.log(result.result); // Fresh weather data
```

#### `sendFollowupTurn(request)`

Insert a message into the conversation.

```typescript
await window.openai?.sendFollowupTurn?.({
  prompt: 'Show me more cities'
});
```

#### `requestDisplayMode(request)`

Request a layout change.

```typescript
const response = await window.openai?.requestDisplayMode?.({
  mode: 'fullscreen'
});
console.log(response.mode); // Granted mode (may differ)
```

#### `openExternal(request)`

Open an external link.

```typescript
window.openai?.openExternal?.({
  href: 'https://weather.com'
});
```

### Events

#### `openai:set_globals`

Fired when properties change (displayMode, theme, toolOutput, etc.).

```typescript
window.addEventListener('openai:set_globals', (event) => {
  console.log('Updated:', event.detail);
  // { displayMode: 'fullscreen' }
});
```

#### `openai:tool_response`

Fired when a tool call completes.

```typescript
window.addEventListener('openai:tool_response', (event) => {
  console.log('Tool:', event.detail.name);
  console.log('Args:', event.detail.args);
  console.log('Result:', event.detail.result);
});
```

---

## Advanced Usage

### Custom Loading Component

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="weather-card"
  loadingComponent={
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <Spinner />
      <p>Loading widget...</p>
    </div>
  }
/>
```

### Custom Error Component

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="weather-card"
  errorComponent={(error) => (
    <div style={{ padding: '20px', background: '#fee' }}>
      <h3>Error Loading Widget</h3>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  )}
/>
```

### Multiple Widgets

```tsx
const widgets = ['weather-card', 'stock-card', 'news-card'];

<div style={{ display: 'grid', gap: '20px' }}>
  {widgets.map((type) => (
    <WidgetIframeRenderer
      key={type}
      mcpClient={client}
      widgetType={type}
      displayMode="inline"
    />
  ))}
</div>
```

### State Persistence

```tsx
const [widgetState, setWidgetState] = useState({});

<WidgetIframeRenderer
  mcpClient={client}
  widgetType="weather-card"
  initialWidgetState={widgetState}
  onStateChange={(state) => {
    setWidgetState(state);
    // Optionally save to localStorage
    localStorage.setItem('widget-state', JSON.stringify(state));
  }}
/>
```

### Display Mode Control

```tsx
const [displayMode, setDisplayMode] = useState<DisplayMode>('inline');

<div>
  <select value={displayMode} onChange={(e) => setDisplayMode(e.target.value)}>
    <option value="inline">Inline</option>
    <option value="pip">Picture-in-Picture</option>
    <option value="fullscreen">Fullscreen</option>
  </select>

  <WidgetIframeRenderer
    mcpClient={client}
    widgetType="weather-card"
    displayMode={displayMode}
    onDisplayModeRequest={(requestedMode) => {
      // Widget can request mode change
      setDisplayMode(requestedMode);
      return requestedMode;
    }}
  />
</div>
```

### Tool Call Monitoring

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="weather-card"
  toolOutput={data}
  onLoad={() => {
    console.log('Widget loaded');
    // Set up tool call monitoring
    const iframe = document.querySelector('iframe');
    iframe?.contentWindow?.addEventListener('openai:tool_response', (event) => {
      console.log(`Tool "${event.detail.name}" called with:`, event.detail.args);
      console.log('Result:', event.detail.result);

      // Track analytics, log to server, etc.
    });
  }}
/>
```

---

## Security

### Iframe Sandboxing

By default, iframes use `sandbox="allow-scripts allow-same-origin"`:

- `allow-scripts` - Required for widget JavaScript to run
- `allow-same-origin` - Required for API injection and communication

**Important**: Do not add `allow-top-navigation` or `allow-popups` unless necessary, as this reduces isolation.

### Custom Sandbox

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="weather-card"
  sandbox="allow-scripts allow-same-origin allow-popups"
/>
```

### Content Security Policy

Consider adding CSP headers to your preview server:

```typescript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  next();
});
```

---

## Troubleshooting

### Widget Not Loading

**Problem**: "Error loading widget: Failed to load widget"

**Solutions**:
- Verify MCP client is connected: `client.isConnected()`
- Check widget exists: `await client.listWidgets()`
- Verify widget name spelling
- Check server logs for errors

### window.openai Not Available

**Problem**: `window.openai is undefined` in widget

**Solutions**:
- Ensure API is injected BEFORE HTML loads (handled automatically)
- Check iframe sandbox allows `allow-same-origin`
- Verify emulator is created before iframe loads HTML
- Check browser console for errors

### Tool Calls Failing

**Problem**: `callTool()` throws errors

**Solutions**:
- Verify tool exists in MCP server
- Check tool has `openai/widgetAccessible: true` metadata
- Verify MCP client is still connected
- Check tool arguments match schema
- Review server logs

### Display Mode Not Changing

**Problem**: Display mode stays the same

**Solutions**:
- Implement `onDisplayModeRequest` callback
- Return granted mode from callback
- Check for CSS conflicts
- Verify iframe style updates

### State Not Persisting

**Problem**: Widget state resets

**Solutions**:
- Implement `onStateChange` callback
- Save state to external storage (localStorage, database)
- Pass `initialWidgetState` on re-render
- Check for component re-mounts

---

## Performance

### Widget Caching

The MCP client automatically caches widget HTML:

```typescript
// First load: fetches from server
const html1 = await client.loadWidget('weather-card');

// Subsequent loads: returns from cache
const html2 = await client.loadWidget('weather-card'); // Instant!

// Force refresh: bypass cache
const html3 = await client.loadWidget('weather-card', false);
```

### Memory Management

```typescript
// Component automatically cleans up on unmount
// But you can manually cleanup if needed:

useEffect(() => {
  return () => {
    client.clearCache('weather-card');
    // Or clear all
    client.clearCache();
  };
}, []);
```

### Multiple Widgets

When rendering multiple widgets:

```tsx
// ✅ Good: Single MCP client shared
const client = useMemo(() => new McpWidgetClient({...}), []);

<div>
  {widgets.map(type => (
    <WidgetIframeRenderer mcpClient={client} widgetType={type} />
  ))}
</div>

// ❌ Bad: New client per widget
{widgets.map(type => {
  const client = new McpWidgetClient({...}); // DON'T DO THIS
  return <WidgetIframeRenderer mcpClient={client} widgetType={type} />;
})}
```

---

## Examples

See [examples/iframe-renderer-usage.tsx](./examples/iframe-renderer-usage.tsx) for complete examples:

- Basic widget rendering
- Custom loading/error components
- Multiple widgets
- State persistence
- Display mode control
- Tool call monitoring

---

## API Reference

### Components
- [`WidgetIframeRenderer`](#widgetiframerenderer) - Main React component

### Classes
- [`WindowOpenAIEmulator`](#windowopenaieulator) - Low-level API emulator

### Types
- `WidgetIframeRendererProps` - Component props
- `WindowOpenAIEmulatorOptions` - Emulator options
- `WindowOpenAI` - window.openai API interface
- All window.openai types (DisplayMode, Theme, etc.)

---

## Related Documentation

- [MCP_CLIENT.md](./MCP_CLIENT.md) - MCP client documentation
- [window.openai Types](./src/types/window-openai.ts) - Type definitions
- [OpenAI Apps SDK Docs](../../docs/providers/openai/OPENAI_APPS_SDK.md) - OpenAI integration guide

---

## License

MIT
