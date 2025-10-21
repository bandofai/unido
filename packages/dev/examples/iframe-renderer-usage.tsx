/**
 * Widget Iframe Renderer Usage Example
 *
 * Demonstrates how to use the WidgetIframeRenderer component
 * to render widgets with complete window.openai API emulation.
 */

import React, { useState } from 'react';
import {
  McpWidgetClient,
  WidgetIframeRenderer,
  type DisplayMode,
} from '@bandofai/unido-dev';

/**
 * Example App Component
 */
export function WidgetPreviewApp() {
  // Create MCP client (in real app, this would be created once and reused)
  const [mcpClient] = useState(() => new McpWidgetClient({
    serverUrl: 'http://localhost:3000',
    debug: true,
  }));

  const [connected, setConnected] = useState(false);
  const [widgetType, setWidgetType] = useState('weather-card');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('inline');
  const [widgetState, setWidgetState] = useState<Record<string, unknown>>({});

  // Connect to MCP server
  const handleConnect = async () => {
    try {
      await mcpClient.connect();
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  // Disconnect from MCP server
  const handleDisconnect = async () => {
    await mcpClient.disconnect();
    setConnected(false);
  };

  if (!connected) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Widget Preview</h1>
        <button onClick={handleConnect}>Connect to MCP Server</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>Widget Preview</h1>

      {/* Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Widget Type:
          <input
            type="text"
            value={widgetType}
            onChange={(e) => setWidgetType(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>

        <label>
          Display Mode:
          <select
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="inline">Inline</option>
            <option value="pip">PiP</option>
            <option value="fullscreen">Fullscreen</option>
          </select>
        </label>

        <button onClick={handleDisconnect}>Disconnect</button>
      </div>

      {/* Widget State Display */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Widget State:</strong>
        <pre style={{ margin: '10px 0 0 0', fontSize: '12px' }}>
          {JSON.stringify(widgetState, null, 2)}
        </pre>
      </div>

      {/* Widget Renderer */}
      <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
        <WidgetIframeRenderer
          mcpClient={mcpClient}
          widgetType={widgetType}
          toolOutput={{
            city: 'Portland',
            temperature: 72,
            condition: 'Sunny',
          }}
          displayMode={displayMode}
          theme="light"
          maxHeight={600}
          onStateChange={(state) => {
            console.log('Widget state changed:', state);
            setWidgetState(state);
          }}
          onDisplayModeRequest={(requestedMode) => {
            console.log('Display mode requested:', requestedMode);
            setDisplayMode(requestedMode);
            return requestedMode;
          }}
          onOpenExternal={(href) => {
            console.log('External link requested:', href);
            window.open(href, '_blank');
          }}
          onFollowupTurn={(prompt) => {
            console.log('Follow-up turn requested:', prompt);
            alert(`Follow-up: ${prompt}`);
          }}
          onLoad={() => {
            console.log('Widget loaded successfully');
          }}
          onError={(error) => {
            console.error('Widget error:', error);
          }}
        />
      </div>
    </div>
  );
}

/**
 * Advanced Example with Custom Loading/Error Components
 */
export function WidgetPreviewAdvanced() {
  const [mcpClient] = useState(() => new McpWidgetClient({
    serverUrl: 'http://localhost:3000',
    debug: true,
  }));

  return (
    <div style={{ padding: '20px' }}>
      <h1>Widget Preview (Advanced)</h1>

      <WidgetIframeRenderer
        mcpClient={mcpClient}
        widgetType="weather-card"
        toolInput={{ city: 'Portland' }}
        toolOutput={{
          city: 'Portland',
          temperature: 72,
          condition: 'Sunny',
        }}
        displayMode="inline"
        // Custom loading component
        loadingComponent={
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px' }}>⏳</div>
            <div style={{ marginTop: '10px' }}>Loading widget...</div>
          </div>
        }
        // Custom error component
        errorComponent={(error) => (
          <div style={{ padding: '20px', background: '#fee', borderRadius: '4px' }}>
            <h3 style={{ color: 'red', margin: '0 0 10px 0' }}>Error Loading Widget</h3>
            <p>{error.message}</p>
            <details>
              <summary>Stack Trace</summary>
              <pre style={{ fontSize: '11px', overflow: 'auto' }}>{error.stack}</pre>
            </details>
          </div>
        )}
        // Custom iframe styles
        iframeStyle={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
        // Custom container styles
        containerStyle={{
          maxWidth: '800px',
          margin: '0 auto',
        }}
        className="widget-preview"
      />
    </div>
  );
}

/**
 * Example with Multiple Widgets
 */
export function MultiWidgetPreview() {
  const [mcpClient] = useState(() => new McpWidgetClient({
    serverUrl: 'http://localhost:3000',
    debug: true,
  }));

  const widgets = [
    { type: 'weather-card', toolOutput: { city: 'Portland', temperature: 72 } },
    { type: 'stock-card', toolOutput: { symbol: 'AAPL', price: 150.25 } },
    { type: 'news-card', toolOutput: { headline: 'Breaking News' } },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Multiple Widgets</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {widgets.map((widget) => (
          <WidgetIframeRenderer
            key={widget.type}
            mcpClient={mcpClient}
            widgetType={widget.type}
            toolOutput={widget.toolOutput}
            displayMode="inline"
            maxHeight={400}
          />
        ))}
      </div>
    </div>
  );
}
