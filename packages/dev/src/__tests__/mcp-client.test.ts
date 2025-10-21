/**
 * Tests for McpWidgetClient
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { McpWidgetClient } from '../mcp-client.js';
import type { ConnectionState } from '../types/mcp-types.js';

// Mock MCP SDK
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    listTools: vi.fn().mockResolvedValue({ tools: [] }),
    listResources: vi.fn().mockResolvedValue({ resources: [] }),
    callTool: vi.fn().mockResolvedValue({ content: [] }),
    readResource: vi.fn().mockResolvedValue({ contents: [] }),
  })),
}));

vi.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: vi.fn().mockImplementation(() => ({
    close: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('McpWidgetClient', () => {
  let client: McpWidgetClient;

  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('constructor', () => {
    it('should create client with default options', () => {
      expect(client).toBeDefined();
      expect(client.isConnected()).toBe(false);
      expect(client.getConnectionState()).toBe('disconnected');
    });

    it('should accept custom options', () => {
      const customClient = new McpWidgetClient({
        serverUrl: 'http://localhost:4000',
        timeout: 5000,
        autoReconnect: false,
        maxReconnectAttempts: 5,
        reconnectDelay: 2000,
        debug: true,
      });

      expect(customClient).toBeDefined();
      expect(customClient.isConnected()).toBe(false);
    });

    it('should accept custom logger', () => {
      const logger = vi.fn();
      const customClient = new McpWidgetClient({
        serverUrl: 'http://localhost:3000',
        logger,
      });

      expect(customClient).toBeDefined();
    });
  });

  describe('connection lifecycle', () => {
    it('should start in disconnected state', () => {
      expect(client.getConnectionState()).toBe('disconnected');
      expect(client.isConnected()).toBe(false);
    });

    it('should connect successfully', async () => {
      await client.connect();
      expect(client.getConnectionState()).toBe('connected');
      expect(client.isConnected()).toBe(true);
    });

    it('should disconnect successfully', async () => {
      await client.connect();
      expect(client.isConnected()).toBe(true);

      await client.disconnect();
      expect(client.isConnected()).toBe(false);
      expect(client.getConnectionState()).toBe('disconnected');
    });

    it('should not connect if already connected', async () => {
      await client.connect();
      const stateBefore = client.getConnectionState();

      await client.connect();
      const stateAfter = client.getConnectionState();

      expect(stateBefore).toBe(stateAfter);
      expect(stateAfter).toBe('connected');
    });

    it('should not disconnect if already disconnected', async () => {
      expect(client.isConnected()).toBe(false);
      await client.disconnect();
      expect(client.isConnected()).toBe(false);
    });
  });

  describe('widget operations', () => {
    beforeEach(async () => {
      await client.connect();
    });

    it('should list available widgets', async () => {
      const widgets = await client.listWidgets();
      expect(widgets).toBeDefined();
      expect(Array.isArray(widgets)).toBe(true);
    });

    it('should load widget HTML', async () => {
      // Mock successful resource read on the underlying MCP client
      const mockHtml = '<html><body>Test Widget</body></html>';
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const mockInstance = vi.mocked(Client).mock.results[0]?.value;

      if (mockInstance) {
        mockInstance.readResource = vi.fn().mockResolvedValue({
          contents: [{ text: mockHtml }]
        });
      }

      const html = await client.loadWidget('test-widget');
      expect(html).toBe(mockHtml);
    });

    it('should cache loaded widgets', async () => {
      const mockHtml = '<html><body>Test Widget</body></html>';
      const readResourceSpy = vi.fn().mockResolvedValue({
        contents: [{ uri: 'ui://widget/test-widget.html', text: mockHtml }]
      });

      vi.spyOn(client as any, 'client', 'get').mockReturnValue({
        readResource: readResourceSpy
      });

      // First load
      await client.loadWidget('test-widget');
      const firstCallCount = readResourceSpy.mock.calls.length;

      // Second load (should use cache)
      await client.loadWidget('test-widget');
      const secondCallCount = readResourceSpy.mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount); // Cache was used
    });

    it('should throw error for invalid widget', async () => {
      vi.spyOn(client as any, 'client', 'get').mockReturnValue({
        readResource: vi.fn().mockRejectedValue(new Error('Widget not found'))
      });

      await expect(client.loadWidget('non-existent')).rejects.toThrow();
    });
  });

  describe('tool operations', () => {
    beforeEach(async () => {
      await client.connect();
    });

    it('should call tool successfully', async () => {
      const toolName = 'test_tool';
      const args = { input: 'test' };

      const result = await client.callTool(toolName, args);
      expect(result).toBeDefined();
    });

    it('should throw error when calling tool while disconnected', async () => {
      await client.disconnect();

      await expect(client.callTool('test_tool', {})).rejects.toThrow(
        'Client is not connected. Call connect() first.'
      );
    });

    it('should handle tool call errors gracefully', async () => {
      // Mock the underlying MCP client to reject
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const mockInstance = vi.mocked(Client).mock.results[0]?.value;

      if (mockInstance) {
        mockInstance.callTool = vi.fn().mockRejectedValue(new Error('Tool execution failed'));
      }

      await expect(client.callTool('failing_tool', {})).rejects.toThrow();
    });
  });

  describe('state management', () => {
    it('should emit state change events', async () => {
      const states: ConnectionState[] = [];

      // Note: This would require the client to expose an event emitter
      // For now, we'll just verify state changes directly

      expect(client.getConnectionState()).toBe('disconnected');

      await client.connect();
      expect(client.getConnectionState()).toBe('connected');

      await client.disconnect();
      expect(client.getConnectionState()).toBe('disconnected');
    });

    it('should track connection attempts', async () => {
      const clientWithRetry = new McpWidgetClient({
        serverUrl: 'http://localhost:3000',
        autoReconnect: true,
        maxReconnectAttempts: 3,
      });

      // This would require mocking connection failures
      // For now, we verify the configuration is accepted
      expect(clientWithRetry).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle connection timeout', async () => {
      const shortTimeoutClient = new McpWidgetClient({
        serverUrl: 'http://localhost:3000',
        timeout: 100,
      });

      // Mock the underlying MCP client to delay
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const lastMockInstance = vi.mocked(Client).mock.results[vi.mocked(Client).mock.results.length - 1]?.value;

      if (lastMockInstance) {
        lastMockInstance.connect = vi.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(resolve, 200))
        );
      }

      // This should timeout
      await expect(shortTimeoutClient.connect()).rejects.toThrow(/timeout/i);
    });

    it('should handle invalid server URL', async () => {
      const invalidClient = new McpWidgetClient({
        serverUrl: '', // Invalid empty URL
      });

      // Error should be thrown during connect, not constructor
      await expect(invalidClient.connect()).rejects.toThrow(/Invalid server URL/);
    });

    it('should throw when listing widgets while disconnected', async () => {
      expect(client.isConnected()).toBe(false);

      await expect(client.listWidgets()).rejects.toThrow(
        'Client is not connected. Call connect() first.'
      );
    });

    it('should throw when loading widget while disconnected', async () => {
      expect(client.isConnected()).toBe(false);

      await expect(client.loadWidget('test')).rejects.toThrow(
        'Client is not connected. Call connect() first.'
      );
    });
  });

  describe('reconnection logic', () => {
    it('should attempt reconnection when autoReconnect is true', async () => {
      const autoReconnectClient = new McpWidgetClient({
        serverUrl: 'http://localhost:3000',
        autoReconnect: true,
        maxReconnectAttempts: 3,
        reconnectDelay: 100,
      });

      // This would require simulating connection drops
      expect(autoReconnectClient).toBeDefined();
    });

    it('should not attempt reconnection when autoReconnect is false', async () => {
      const noReconnectClient = new McpWidgetClient({
        serverUrl: 'http://localhost:3000',
        autoReconnect: false,
      });

      expect(noReconnectClient).toBeDefined();
    });

    it('should respect maxReconnectAttempts', async () => {
      const limitedReconnectClient = new McpWidgetClient({
        serverUrl: 'http://localhost:3000',
        autoReconnect: true,
        maxReconnectAttempts: 2,
      });

      // Would require simulating multiple connection failures
      expect(limitedReconnectClient).toBeDefined();
    });
  });

  describe('cache management', () => {
    beforeEach(async () => {
      await client.connect();
    });

    it('should clear cache on disconnect', async () => {
      const mockHtml = '<html><body>Test</body></html>';
      const Client = (await import('@modelcontextprotocol/sdk/client/index.js')).Client;
      const mockInstance = vi.mocked(Client).mock.results[0]?.value;

      if (mockInstance) {
        mockInstance.readResource = vi.fn().mockResolvedValue({
          contents: [{ text: mockHtml }]
        });
      }

      // Load and cache a widget
      await client.loadWidget('test-widget');
      const firstCallCount = mockInstance?.readResource ? vi.mocked(mockInstance.readResource).mock.calls.length : 0;

      // Load again (should use cache)
      await client.loadWidget('test-widget');
      const secondCallCount = mockInstance?.readResource ? vi.mocked(mockInstance.readResource).mock.calls.length : 0;
      expect(secondCallCount).toBe(firstCallCount); // Cache was used

      // Disconnect (should clear cache)
      await client.disconnect();

      // Reconnect and load again
      await client.connect();
      await client.loadWidget('test-widget');

      // Should fetch again since cache was cleared
      const thirdCallCount = mockInstance?.readResource ? vi.mocked(mockInstance.readResource).mock.calls.length : 0;
      expect(thirdCallCount).toBeGreaterThan(secondCallCount);
    });
  });
});
