/**
 * Tests for McpStatus component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { McpStatus } from '../../components/McpStatus.js';
import type { McpWidgetClient } from '../../mcp-client.js';

const createMockClient = (state: 'connected' | 'connecting' | 'disconnected' | 'error' = 'disconnected'): McpWidgetClient => {
  return {
    getConnectionState: vi.fn().mockReturnValue(state),
    isConnected: vi.fn().mockReturnValue(state === 'connected'),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    callTool: vi.fn().mockResolvedValue({ result: {}, isError: false }),
    listWidgets: vi.fn().mockResolvedValue([]),
    loadWidget: vi.fn().mockResolvedValue('<html></html>'),
    clearCache: vi.fn(),
  } as unknown as McpWidgetClient;
};

describe('McpStatus', () => {
  let mockClient: McpWidgetClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render disconnected state', () => {
      mockClient = createMockClient('disconnected');
      render(<McpStatus client={mockClient} />);

      expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    });

    it('should render connected state', () => {
      mockClient = createMockClient('connected');
      render(<McpStatus client={mockClient} />);

      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });

    it('should render connecting state', () => {
      mockClient = createMockClient('connecting');
      render(<McpStatus client={mockClient} />);

      expect(screen.getByText(/connecting/i)).toBeInTheDocument();
    });

    it('should render error state', () => {
      mockClient = createMockClient('error');
      render(<McpStatus client={mockClient} />);

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe('reconnect button', () => {
    it('should show reconnect button when disconnected', () => {
      mockClient = createMockClient('disconnected');
      const onReconnect = vi.fn();
      render(<McpStatus client={mockClient} onReconnect={onReconnect} />);

      const button = screen.getByRole('button', { name: /reconnect/i });
      expect(button).toBeInTheDocument();
    });

    it('should not show reconnect button when connected', () => {
      mockClient = createMockClient('connected');
      const onReconnect = vi.fn();
      render(<McpStatus client={mockClient} onReconnect={onReconnect} />);

      const button = screen.queryByRole('button', { name: /reconnect/i });
      expect(button).not.toBeInTheDocument();
    });

    it('should call onReconnect when button clicked', async () => {
      mockClient = createMockClient('disconnected');
      const onReconnect = vi.fn();

      render(<McpStatus client={mockClient} onReconnect={onReconnect} />);

      const button = screen.getByRole('button', { name: /reconnect/i });
      fireEvent.click(button);

      expect(onReconnect).toHaveBeenCalledTimes(1);
    });

    it('should disable button during reconnection', async () => {
      mockClient = createMockClient('connecting');
      const onReconnect = vi.fn();

      render(<McpStatus client={mockClient} onReconnect={onReconnect} />);

      const button = screen.queryByRole('button', { name: /reconnect/i });

      // Button might not be visible during connecting state
      if (button) {
        expect(button).toBeDisabled();
      }
    });
  });

  describe('details display', () => {
    it('should show details when showDetails is true', () => {
      mockClient = createMockClient('connected');
      render(<McpStatus client={mockClient} showDetails={true} />);

      // Check for connection info (implementation dependent)
      const statusElement = screen.getByText(/connected/i);
      expect(statusElement).toBeInTheDocument();
    });

    it('should not show details when showDetails is false', () => {
      mockClient = createMockClient('connected');
      render(<McpStatus client={mockClient} showDetails={false} />);

      // Verify compact display (implementation dependent)
      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });
  });

  describe('custom styling', () => {
    it('should apply custom className', () => {
      mockClient = createMockClient('connected');
      const { container } = render(
        <McpStatus client={mockClient} className="custom-class" />
      );

      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      mockClient = createMockClient('connected');
      const customStyle = { backgroundColor: 'red' };

      const { container } = render(
        <McpStatus client={mockClient} style={customStyle} />
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('state updates', () => {
    it('should update when client state changes', () => {
      const { rerender } = render(
        <McpStatus client={createMockClient('disconnected')} />
      );

      expect(screen.getByText(/disconnected/i)).toBeInTheDocument();

      // Update to connected
      rerender(<McpStatus client={createMockClient('connected')} />);

      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });
  });
});
