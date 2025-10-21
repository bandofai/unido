# MCP Client

The MCP Client provides programmatic access to widgets and tools from an MCP server, mimicking how ChatGPT loads and interacts with widgets.

## Features

- **Connection Management**: Connect, disconnect, and auto-reconnect to MCP servers
- **Widget Discovery**: List all available widgets from the server
- **Widget Loading**: Load widget HTML via MCP resources
- **Tool Execution**: Execute tool calls on the MCP server
- **Caching**: Built-in widget HTML caching for performance
- **Error Handling**: Comprehensive error handling and timeout support
- **Debug Logging**: Optional debug logging for troubleshooting

## Installation

The MCP client is included in `@bandofai/unido-dev`:

```bash
pnpm add @bandofai/unido-dev
```

## Basic Usage

```typescript
import { McpWidgetClient } from '@bandofai/unido-dev';

// Create client
const client = new McpWidgetClient({
  serverUrl: 'http://localhost:3000',
  debug: true
});

// Connect
await client.connect();

// List widgets
const widgets = await client.listWidgets();
console.log('Available widgets:', widgets);

// Load widget HTML
const html = await client.loadWidget('weather-card');

// Call a tool
const result = await client.callTool('get_weather', {
  city: 'Portland'
});

// Disconnect
await client.disconnect();
```

## API Reference

### `McpWidgetClient`

#### Constructor Options

```typescript
interface McpClientOptions {
  /** Server URL (e.g., 'http://localhost:3000') */
  serverUrl: string;

  /** Connection timeout in milliseconds (default: 10000) */
  timeout?: number;

  /** Enable auto-reconnect on connection loss (default: true) */
  autoReconnect?: boolean;

  /** Maximum number of reconnection attempts (default: 3) */
  maxReconnectAttempts?: number;

  /** Reconnection delay in milliseconds (default: 1000) */
  reconnectDelay?: number;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

#### Methods

##### `connect(): Promise<void>`

Connect to the MCP server.

```typescript
await client.connect();
```

**Throws**: `Error` if connection fails

##### `disconnect(): Promise<void>`

Disconnect from the MCP server.

```typescript
await client.disconnect();
```

##### `listWidgets(): Promise<WidgetInfo[]>`

List all available widgets from the MCP server.

```typescript
const widgets = await client.listWidgets();
// [
//   {
//     type: 'weather-card',
//     title: 'Weather Card',
//     description: 'Display weather information',
//     uri: 'ui://widget/weather-card.html',
//     mimeType: 'text/html'
//   }
// ]
```

**Returns**: Array of `WidgetInfo` objects

**Throws**: `Error` if not connected or request fails

##### `loadWidget(type: string, useCache?: boolean): Promise<string>`

Load widget HTML from the MCP server.

```typescript
const html = await client.loadWidget('weather-card');
// Returns: '<html>...</html>'

// Force fresh load (skip cache)
const freshHtml = await client.loadWidget('weather-card', false);
```

**Parameters**:
- `type`: Widget type (e.g., 'weather-card')
- `useCache`: Whether to use cached HTML (default: true)

**Returns**: Widget HTML content as string

**Throws**: `Error` if not connected, widget not found, or request fails

##### `callTool(name: string, args: unknown): Promise<ToolCallResult>`

Execute a tool call on the MCP server.

```typescript
const result = await client.callTool('get_weather', {
  city: 'Portland'
});
// {
//   result: { temperature: 72, condition: 'sunny' },
//   isError: false
// }
```

**Parameters**:
- `name`: Tool name
- `args`: Tool arguments (object)

**Returns**: `ToolCallResult` with result data and error flag

**Throws**: `Error` if not connected or tool call fails

##### `clearCache(type?: string): void`

Clear the widget cache.

```typescript
// Clear all cached widgets
client.clearCache();

// Clear specific widget
client.clearCache('weather-card');
```

##### `getConnectionState(): ConnectionState`

Get current connection state.

```typescript
const state = client.getConnectionState();
// 'disconnected' | 'connecting' | 'connected' | 'error'
```

##### `isConnected(): boolean`

Check if client is connected.

```typescript
if (client.isConnected()) {
  // Client is ready
}
```

## Types

### `WidgetInfo`

Widget information from MCP resources:

```typescript
interface WidgetInfo {
  /** Widget type (e.g., 'weather-card') */
  type: string;

  /** Widget display title */
  title: string;

  /** Widget description */
  description?: string;

  /** MCP resource URI */
  uri: string;

  /** MIME type of the resource */
  mimeType?: string;
}
```

### `ToolCallResult`

Tool call result from MCP:

```typescript
interface ToolCallResult {
  /** Tool execution result data */
  result: unknown;

  /** Whether the tool call was successful */
  isError?: boolean;
}
```

### `ConnectionState`

Client connection state:

```typescript
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
```

## Advanced Usage

### Auto-Reconnect

The client supports automatic reconnection with configurable retry logic:

```typescript
const client = new McpWidgetClient({
  serverUrl: 'http://localhost:3000',
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 2000, // Wait 2s between attempts
  debug: true
});

await client.connect();
// If connection drops, client will automatically attempt to reconnect
```

### Error Handling

```typescript
try {
  await client.connect();
  const widgets = await client.listWidgets();
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Connection timeout - is the server running?');
  } else if (error.message.includes('not connected')) {
    console.error('Client is not connected');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Widget Caching

The client automatically caches loaded widgets for performance:

```typescript
// First load: fetches from server
const html1 = await client.loadWidget('weather-card');

// Second load: returns from cache (instant)
const html2 = await client.loadWidget('weather-card');

// Force refresh: bypasses cache
const html3 = await client.loadWidget('weather-card', false);

// Clear cache when needed
client.clearCache('weather-card');
```

## Integration with Widget Preview

The MCP client is designed to integrate with the widget preview system:

```typescript
import { McpWidgetClient } from '@bandofai/unido-dev';

// In your preview server
const client = new McpWidgetClient({
  serverUrl: 'http://localhost:3000'
});

await client.connect();

// Load widget for preview
app.get('/preview/:type', async (req, res) => {
  try {
    const html = await client.loadWidget(req.params.type);
    res.send(html);
  } catch (error) {
    res.status(404).send('Widget not found');
  }
});
```

## Troubleshooting

### Connection Timeout

If you see connection timeout errors:

```
Error: Connection timeout after 10000ms
```

**Solutions**:
- Verify the MCP server is running
- Check the server URL is correct
- Increase timeout in client options
- Check firewall/network settings

### Widget Not Found

If widget loading fails:

```
Error: Failed to load widget "my-widget": No content returned
```

**Solutions**:
- Verify widget is registered in your Unido app
- Check widget name spelling
- Use `listWidgets()` to see available widgets
- Check server logs for errors

### Tool Call Errors

If tool calls fail:

```
Error: Tool call "my_tool" failed: Tool not found
```

**Solutions**:
- Verify tool is registered in your Unido app
- Check tool name spelling
- Ensure tool has `openai/widgetAccessible: true` metadata
- Check tool arguments match the schema

## Examples

See [examples/mcp-client-usage.ts](./examples/mcp-client-usage.ts) for a complete working example.

## Related Documentation

- [Widget Server](./README.md) - Development server for widgets
- [window.openai Types](./src/types/window-openai.ts) - OpenAI Apps SDK types
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification

## License

MIT
