/**
 * Tests for WidgetIframeRenderer component
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WidgetIframeRenderer } from '../../components/WidgetIframeRenderer.js';
import type { McpWidgetClient } from '../../mcp-client.js';

// Mock MCP client
const createMockClient = (overrides?: Partial<McpWidgetClient>): McpWidgetClient => {
  return {
    getConnectionState: vi.fn().mockReturnValue('connected'),
    isConnected: vi.fn().mockReturnValue(true),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    callTool: vi.fn().mockResolvedValue({ result: {}, isError: false }),
    listTools: vi.fn().mockResolvedValue([]),
    listWidgets: vi.fn().mockResolvedValue([]),
    loadWidget: vi.fn().mockResolvedValue('<html><head></head><body>Test Widget</body></html>'),
    clearCache: vi.fn(),
    ...overrides,
  } as unknown as McpWidgetClient;
};

describe('WidgetIframeRenderer', () => {
  let mockClient: McpWidgetClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering states', () => {
    it('should render loading state initially', () => {
      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
        />
      );

      expect(screen.getByText('Loading widget...')).toBeInTheDocument();
    });

    it('should render custom loading component', () => {
      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          loadingComponent={<div>Custom loading...</div>}
        />
      );

      expect(screen.getByText('Custom loading...')).toBeInTheDocument();
    });

    it('should render iframe after successful load', async () => {
      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
        />
      );

      await waitFor(() => {
        const iframe = screen.queryByTitle('Widget: test-widget');
        expect(iframe).toBeInTheDocument();
      });
    });

    it('should render error state on load failure', async () => {
      const failingClient = createMockClient({
        loadWidget: vi.fn().mockRejectedValue(new Error('Load failed')),
      });

      render(
        <WidgetIframeRenderer
          mcpClient={failingClient}
          widgetType="test-widget"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Error loading widget/i)).toBeInTheDocument();
        expect(screen.getByText(/Load failed/i)).toBeInTheDocument();
      });
    });

    it('should render custom error component', async () => {
      const failingClient = createMockClient({
        loadWidget: vi.fn().mockRejectedValue(new Error('Load failed')),
      });

      const errorComponent = (error: Error) => (
        <div>Custom error: {error.message}</div>
      );

      render(
        <WidgetIframeRenderer
          mcpClient={failingClient}
          widgetType="test-widget"
          errorComponent={errorComponent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Custom error: Load failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('widget loading', () => {
    it('should load widget HTML from MCP client', async () => {
      const loadWidgetSpy = vi.fn().mockResolvedValue('<html><head></head><body>Test</body></html>');
      mockClient.loadWidget = loadWidgetSpy;

      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="weather-card"
        />
      );

      await waitFor(() => {
        expect(loadWidgetSpy).toHaveBeenCalledWith('weather-card');
      });
    });

    it('should connect to MCP if not connected', async () => {
      const disconnectedClient = createMockClient({
        isConnected: vi.fn().mockReturnValue(false),
        connect: vi.fn().mockResolvedValue(undefined),
      });

      render(
        <WidgetIframeRenderer
          mcpClient={disconnectedClient}
          widgetType="test-widget"
        />
      );

      await waitFor(() => {
        expect(disconnectedClient.connect).toHaveBeenCalled();
      });
    });

    it('should handle loading timeout', async () => {
      const slowClient = createMockClient({
        loadWidget: vi.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 5000))
        ),
      });

      render(
        <WidgetIframeRenderer
          mcpClient={slowClient}
          widgetType="test-widget"
          loadingTimeout={100}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/timeout/i)).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should call onLoad callback on successful load', async () => {
      const onLoad = vi.fn();

      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          onLoad={onLoad}
        />
      );

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });

    it('should call onError callback on load failure', async () => {
      const onError = vi.fn();
      const failingClient = createMockClient({
        loadWidget: vi.fn().mockRejectedValue(new Error('Load failed')),
      });

      render(
        <WidgetIframeRenderer
          mcpClient={failingClient}
          widgetType="test-widget"
          onError={onError}
        />
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
      });
    });
  });

  describe('HTML validation', () => {
    it('should validate HTML by default', async () => {
      const invalidClient = createMockClient({
        loadWidget: vi.fn().mockResolvedValue(''),
      });

      render(
        <WidgetIframeRenderer
          mcpClient={invalidClient}
          widgetType="test-widget"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Invalid widget HTML/i)).toBeInTheDocument();
      });
    });

    it('should reject HTML without html tag', async () => {
      const invalidClient = createMockClient({
        loadWidget: vi.fn().mockResolvedValue('<div>No html tag</div>'),
      });

      render(
        <WidgetIframeRenderer
          mcpClient={invalidClient}
          widgetType="test-widget"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/missing <html> tag/i)).toBeInTheDocument();
      });
    });

    it('should skip validation when disabled', async () => {
      const invalidClient = createMockClient({
        loadWidget: vi.fn().mockResolvedValue('<div>No validation</div>'),
      });

      render(
        <WidgetIframeRenderer
          mcpClient={invalidClient}
          widgetType="test-widget"
          validateHtml={false}
        />
      );

      // Should still attempt to render (may fail for other reasons)
      await waitFor(() => {
        // Just verify no validation error
        const validationError = screen.queryByText(/missing <html> tag/i);
        expect(validationError).not.toBeInTheDocument();
      });
    });
  });

  describe('CSP configuration', () => {
    it('should use trusted security level by default', async () => {
      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
        />
      );

      await waitFor(() => {
        const iframe = screen.queryByTitle('Widget: test-widget');
        expect(iframe).toBeInTheDocument();
      });

      // CSP should be applied (trusted level allows inline scripts)
    });

    it('should accept custom security level', async () => {
      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          securityLevel="untrusted"
        />
      );

      await waitFor(() => {
        const iframe = screen.queryByTitle('Widget: test-widget');
        expect(iframe).toBeInTheDocument();
      });

      // CSP should be applied with untrusted level (stricter)
    });

    it('should accept custom CSP configuration', async () => {
      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          csp={{
            level: 'trusted',
            directives: {
              'connect-src': ["'self'", 'https://api.example.com'],
            },
          }}
        />
      );

      await waitFor(() => {
        const iframe = screen.queryByTitle('Widget: test-widget');
        expect(iframe).toBeInTheDocument();
      });
    });

    it('should fall back to trusted on invalid CSP config', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          csp={{
            level: 'untrusted',
            directives: {
              'script-src': ["'unsafe-eval'"], // Invalid for untrusted
            },
          }}
        />
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid CSP configuration'),
          expect.anything()
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('iframe configuration', () => {
    it('should apply default sandbox permissions', async () => {
      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
        />
      );

      await waitFor(() => {
        const iframe = screen.getByTitle('Widget: test-widget') as HTMLIFrameElement;
        expect(iframe.sandbox.toString()).toContain('allow-scripts');
        expect(iframe.sandbox.toString()).toContain('allow-same-origin');
      });
    });

    it('should apply custom sandbox permissions', async () => {
      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          sandbox="allow-scripts"
        />
      );

      await waitFor(() => {
        const iframe = screen.getByTitle('Widget: test-widget') as HTMLIFrameElement;
        expect(iframe.sandbox.toString()).toBe('allow-scripts');
      });
    });

    it('should apply custom iframe styles', async () => {
      const customStyle = { backgroundColor: 'red', border: '2px solid blue' };

      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          iframeStyle={customStyle}
        />
      );

      await waitFor(() => {
        const iframe = screen.getByTitle('Widget: test-widget') as HTMLIFrameElement;
        expect(iframe.style.backgroundColor).toBe('red');
        expect(iframe.style.border).toBe('2px solid blue');
      });
    });

    it('should apply custom container styles', async () => {
      const customStyle = { padding: '20px' };

      const { container } = render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          containerStyle={customStyle}
          className="custom-container"
        />
      );

      await waitFor(() => {
        const element = container.querySelector('.custom-container') as HTMLElement;
        expect(element).toBeInTheDocument();
        expect(element.style.padding).toBe('20px');
      });
    });

    it('should set iframe height based on display mode', async () => {
      const { rerender } = render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          displayMode="inline"
          maxHeight={600}
        />
      );

      await waitFor(() => {
        const iframe = screen.getByTitle('Widget: test-widget') as HTMLIFrameElement;
        expect(iframe.style.height).toBe('600px');
      });

      rerender(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          displayMode="fullscreen"
          maxHeight={600}
        />
      );

      await waitFor(() => {
        const iframe = screen.getByTitle('Widget: test-widget') as HTMLIFrameElement;
        expect(iframe.style.height).toBe('100vh');
      });
    });
  });

  describe('performance metrics', () => {
    it('should track widget load time', async () => {
      const onPerformanceMetric = vi.fn();

      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          onPerformanceMetric={onPerformanceMetric}
        />
      );

      await waitFor(() => {
        expect(onPerformanceMetric).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'widget_load',
            duration: expect.any(Number),
            timestamp: expect.any(Number),
          })
        );
      });
    });

    it('should track widget render time', async () => {
      const onPerformanceMetric = vi.fn();

      render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
          onPerformanceMetric={onPerformanceMetric}
        />
      );

      await waitFor(() => {
        const renderMetric = onPerformanceMetric.mock.calls.find(
          call => call[0]?.name === 'widget_render'
        );
        expect(renderMetric).toBeDefined();
      });
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount', async () => {
      const { unmount } = render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="test-widget"
        />
      );

      await waitFor(() => {
        expect(screen.getByTitle('Widget: test-widget')).toBeInTheDocument();
      });

      unmount();

      // Verify iframe is removed
      expect(screen.queryByTitle('Widget: test-widget')).not.toBeInTheDocument();
    });

    it('should cancel loading on unmount', async () => {
      const slowClient = createMockClient({
        loadWidget: vi.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 5000))
        ),
      });

      const { unmount } = render(
        <WidgetIframeRenderer
          mcpClient={slowClient}
          widgetType="test-widget"
        />
      );

      // Unmount while loading
      unmount();

      // Should not throw or cause issues
      expect(screen.queryByText('Loading widget...')).not.toBeInTheDocument();
    });
  });

  describe('prop updates', () => {
    it('should update widget when widgetType changes', async () => {
      const loadWidgetSpy = vi.fn()
        .mockResolvedValueOnce('<html><head></head><body>Widget 1</body></html>')
        .mockResolvedValueOnce('<html><head></head><body>Widget 2</body></html>');

      mockClient.loadWidget = loadWidgetSpy;

      const { rerender } = render(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="widget-1"
        />
      );

      await waitFor(() => {
        expect(loadWidgetSpy).toHaveBeenCalledWith('widget-1');
      });

      rerender(
        <WidgetIframeRenderer
          mcpClient={mockClient}
          widgetType="widget-2"
        />
      );

      await waitFor(() => {
        expect(loadWidgetSpy).toHaveBeenCalledWith('widget-2');
      });
    });
  });
});
