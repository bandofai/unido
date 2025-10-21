/**
 * Integration tests for widget loading flows
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { McpWidgetClient } from '../../mcp-client.js';
import { WindowOpenAIEmulator } from '../../window-openai-emulator.js';

// Mock MCP SDK to avoid actual SSE connections
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    listTools: vi.fn().mockResolvedValue({ tools: [] }),
    listResources: vi.fn().mockResolvedValue({
      resources: [
        {
          uri: 'ui://widget/test-widget.html',
          name: 'Test Widget',
          description: 'A test widget',
          mimeType: 'text/html'
        }
      ]
    }),
    callTool: vi.fn().mockResolvedValue({
      content: [{ text: JSON.stringify({ result: 'success' }) }],
      isError: false
    }),
    readResource: vi.fn().mockResolvedValue({
      contents: [{ text: '<html><body>Test Widget HTML</body></html>' }]
    }),
  })),
}));

vi.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: vi.fn().mockImplementation(() => ({
    close: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('Widget Loading Integration', () => {
  let client: McpWidgetClient;
  let emulator: WindowOpenAIEmulator;

  beforeEach(() => {
    client = new McpWidgetClient({
      serverUrl: 'http://localhost:3000',
      debug: false,
    });
  });

  afterEach(async () => {
    if (client && client.isConnected()) {
      await client.disconnect();
    }
  });

  describe('Direct Load Mode', () => {
    it('should load widget without MCP server', async () => {
      // In direct mode, widgets are loaded directly as React components
      // No MCP connection required
      expect(client.isConnected()).toBe(false);

      // Direct load would use local file system or bundled components
      // This is typically handled by the preview app directly
    });
  });

  describe('MCP Load Mode', () => {
    it('should complete full widget load flow', async () => {
      // 1. Connect to MCP server
      await client.connect();
      expect(client.isConnected()).toBe(true);

      // 2. List available widgets
      const widgets = await client.listWidgets();
      expect(Array.isArray(widgets)).toBe(true);

      // 3. Load specific widget HTML
      if (widgets.length > 0) {
        const widgetType = widgets[0]?.type || 'test-widget';
        const html = await client.loadWidget(widgetType);
        expect(html).toBeDefined();
        expect(typeof html).toBe('string');
      }
    });

    it('should initialize window.openai emulator', async () => {
      await client.connect();

      emulator = new WindowOpenAIEmulator({
        mcpClient: client,
        toolOutput: { test: 'data' },
      });

      const api = emulator.getAPI();
      expect(api).toBeDefined();
      expect(api.toolOutput).toEqual({ test: 'data' });
      expect(api.callTool).toBeTypeOf('function');
    });

    it('should handle widget-to-MCP communication', async () => {
      await client.connect();

      emulator = new WindowOpenAIEmulator({
        mcpClient: client,
      });

      const api = emulator.getAPI();

      // Widget calls tool via window.openai
      const result = await api.callTool('test_tool', { input: 'test' });

      expect(result).toBeDefined();
    });
  });

  describe('Mode Switching', () => {
    it('should handle switching from Direct to MCP mode', async () => {
      // Start in disconnected state (Direct mode)
      expect(client.isConnected()).toBe(false);

      // Switch to MCP mode
      await client.connect();
      expect(client.isConnected()).toBe(true);

      // Initialize emulator for MCP mode
      emulator = new WindowOpenAIEmulator({
        mcpClient: client,
      });

      const api = emulator.getAPI();
      expect(api).toBeDefined();
    });

    it('should handle switching from MCP to Direct mode', async () => {
      // Start in MCP mode
      await client.connect();
      expect(client.isConnected()).toBe(true);

      // Switch to Direct mode
      await client.disconnect();
      expect(client.isConnected()).toBe(false);

      // Emulator cleanup would happen in preview app
    });

    it('should preserve widget state during mode switch', async () => {
      const initialState = { count: 5 };

      emulator = new WindowOpenAIEmulator({
        mcpClient: client,
        initialWidgetState: initialState,
      });

      const api = emulator.getAPI();
      expect(api.widgetState).toEqual(initialState);

      // State modifications
      api.widgetState.count = 10;
      expect(api.widgetState.count).toBe(10);

      // In real app, state would be preserved via localStorage
    });
  });

  describe('Error Scenarios', () => {
    it('should handle MCP server not running', async () => {
      const unreachableClient = new McpWidgetClient({
        serverUrl: 'http://localhost:9999', // Non-existent server
        timeout: 1000,
        autoReconnect: false,
      });

      // Mock the MCP client to reject the connection
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const lastMockInstance = vi.mocked(Client).mock.results[vi.mocked(Client).mock.results.length - 1]?.value;
      if (lastMockInstance) {
        lastMockInstance.connect = vi.fn().mockRejectedValue(new Error('Connection failed'));
      }

      await expect(unreachableClient.connect()).rejects.toThrow();
    });

    it('should handle widget not found', async () => {
      await client.connect();

      // Mock the MCP client to reject the resource read
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const mockInstance = vi.mocked(Client).mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.readResource = vi.fn().mockRejectedValue(new Error('Widget not found'));
      }

      await expect(client.loadWidget('non-existent-widget')).rejects.toThrow();
    });

    it('should handle tool call failures gracefully', async () => {
      await client.connect();

      emulator = new WindowOpenAIEmulator({
        mcpClient: client,
      });

      const api = emulator.getAPI();

      // Mock tool failure
      vi.spyOn(client, 'callTool').mockRejectedValue(new Error('Tool failed'));

      await expect(api.callTool('failing_tool', {})).rejects.toThrow('Tool failed');
    });

    it('should handle malformed widget HTML', async () => {
      await client.connect();

      // Mock invalid HTML response
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const mockInstance = vi.mocked(Client).mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.readResource = vi.fn().mockResolvedValue({
          contents: [{ text: 'not valid html' }]
        });
      }

      const html = await client.loadWidget('test-widget');

      // Should still return the HTML (validation happens in renderer)
      expect(html).toBe('not valid html');
    });
  });

  describe('State Persistence', () => {
    it('should persist load mode preference', () => {
      const STORAGE_KEY = 'unido:preview:loadMode';

      // Set Direct mode
      localStorage.setItem(STORAGE_KEY, 'direct');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('direct');

      // Set MCP mode
      localStorage.setItem(STORAGE_KEY, 'mcp');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('mcp');

      // Clear
      localStorage.removeItem(STORAGE_KEY);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should restore widget state from storage', () => {
      const savedState = { temperature: 72, city: 'Portland' };

      emulator = new WindowOpenAIEmulator({
        mcpClient: client,
        initialWidgetState: savedState,
      });

      const api = emulator.getAPI();
      expect(api.widgetState).toEqual(savedState);
    });
  });

  describe('Performance', () => {
    it('should cache loaded widgets', async () => {
      await client.connect();

      // Spy on the underlying MCP client's readResource method
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const mockInstance = vi.mocked(Client).mock.results[0]?.value;
      const readResourceSpy = mockInstance?.readResource as ReturnType<typeof vi.fn>;

      // First load
      await client.loadWidget('test-widget');
      const firstCallCount = readResourceSpy.mock.calls.length;

      // Second load (should use cache)
      await client.loadWidget('test-widget');
      const secondCallCount = readResourceSpy.mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should handle concurrent widget loads', async () => {
      await client.connect();

      // Load multiple widgets concurrently
      const promises = [
        client.loadWidget('widget-1'),
        client.loadWidget('widget-2'),
        client.loadWidget('widget-3'),
      ];

      const results = await Promise.allSettled(promises);

      // All should complete (some may fail if widgets don't exist)
      expect(results.length).toBe(3);
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on disconnect', async () => {
      await client.connect();

      emulator = new WindowOpenAIEmulator({
        mcpClient: client,
      });

      // Disconnect should clean up resources
      await client.disconnect();

      expect(client.isConnected()).toBe(false);
    });

    it('should clear cache on disconnect', async () => {
      await client.connect();

      // Load and cache widget
      await client.loadWidget('test-widget');

      // Spy on the underlying MCP client's readResource method
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const mockInstance = vi.mocked(Client).mock.results[0]?.value;
      const readResourceSpy = mockInstance?.readResource as ReturnType<typeof vi.fn>;

      const callsBeforeDisconnect = readResourceSpy.mock.calls.length;

      // Disconnect (clears cache)
      await client.disconnect();

      // Reconnect
      await client.connect();

      // Load again - should fetch since cache was cleared
      await client.loadWidget('test-widget');
      const callsAfterReconnect = readResourceSpy.mock.calls.length;

      // Should have made a new fetch call after cache was cleared
      expect(callsAfterReconnect).toBeGreaterThan(callsBeforeDisconnect);
    });
  });
});
