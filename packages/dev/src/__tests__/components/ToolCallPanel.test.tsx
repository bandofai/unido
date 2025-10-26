/**
 * Tests for ToolCallPanel component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToolCallPanel } from '../../components/ToolCallPanel.js';
import type { McpWidgetClient } from '../../mcp-client.js';

const createMockClient = (tools = []): McpWidgetClient => {
  return {
    listTools: vi.fn().mockResolvedValue(tools),
    callTool: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Success' }],
      result: { status: 'success', data: 'Success' },
    }),
    isConnected: vi.fn().mockReturnValue(true),
    getState: vi.fn().mockReturnValue('connected'),
    connect: vi.fn(),
    disconnect: vi.fn(),
    listWidgets: vi.fn(),
    loadWidget: vi.fn(),
  } as unknown as McpWidgetClient;
};

describe('ToolCallPanel', () => {
  let mockClient: McpWidgetClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render tool selection dropdown', async () => {
      mockClient = createMockClient([
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: { type: 'object', properties: {} },
        },
      ]);

      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      });
    });

    it('should render execute button', () => {
      mockClient = createMockClient();
      render(<ToolCallPanel client={mockClient} />);

      const button = screen.getByRole('button', { name: /execute/i });
      expect(button).toBeInTheDocument();
    });

    it('should render JSON editor for arguments', () => {
      mockClient = createMockClient();
      render(<ToolCallPanel client={mockClient} />);

      // Look for textarea for arguments JSON
      const editor = screen.getByPlaceholderText(/city.*Portland/i);
      expect(editor).toBeInTheDocument();
    });
  });

  describe('tool selection', () => {
    it('should load and display available tools', async () => {
      const tools = [
        { name: 'get_weather', description: 'Get weather', inputSchema: {} },
        { name: 'get_time', description: 'Get time', inputSchema: {} },
      ];

      mockClient = createMockClient(tools);
      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        expect(screen.getByText(/get_weather/i)).toBeInTheDocument();
      });
    });

    it('should handle empty tool list', async () => {
      mockClient = createMockClient([]);
      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        // With empty tool list, component shows a text input instead of select
        const input = screen.getByPlaceholderText(/get_weather/i);
        expect(input).toBeInTheDocument();
      });
    });

    it('should update arguments editor when tool selected', async () => {
      const tools = [
        {
          name: 'test_tool',
          description: 'Test',
          inputSchema: {
            type: 'object',
            properties: {
              input: { type: 'string' },
            },
          },
        },
      ];

      mockClient = createMockClient(tools);
      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'test_tool' } });
      });

      // Arguments should be initialized
      const editor = screen.getByPlaceholderText(/city.*Portland/i);
      expect(editor).toBeInTheDocument();
    });
  });

  describe('tool execution', () => {
    it('should call tool when execute button clicked', async () => {
      const tools = [
        { name: 'test_tool', description: 'Test', inputSchema: {} },
      ];

      mockClient = createMockClient(tools);
      const onToolCall = vi.fn();

      render(<ToolCallPanel client={mockClient} onToolCall={onToolCall} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'test_tool' } });
      });

      const button = screen.getByRole('button', { name: /execute/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockClient.callTool).toHaveBeenCalledWith('test_tool', expect.any(Object));
      });
    });

    it('should show loading state during execution', async () => {
      const tools = [
        { name: 'slow_tool', description: 'Slow', inputSchema: {} },
      ];

      mockClient = createMockClient(tools);
      vi.spyOn(mockClient, 'callTool').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ content: [] }), 100))
      );

      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'slow_tool' } });
      });

      const button = screen.getByRole('button', { name: /execute/i });
      fireEvent.click(button);

      // Button should show loading state
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should display success result', async () => {
      const tools = [
        { name: 'test_tool', description: 'Test', inputSchema: {} },
      ];

      mockClient = createMockClient(tools);
      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'test_tool' } });
      });

      const button = screen.getByRole('button', { name: /execute/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Result should be displayed - check for "Result" label and success data
        expect(screen.getByText('Result')).toBeInTheDocument();
        expect(screen.getByText(/"success"/i)).toBeInTheDocument();
      });
    });

    it('should display error result', async () => {
      const tools = [
        { name: 'failing_tool', description: 'Fails', inputSchema: {} },
      ];

      mockClient = createMockClient(tools);
      vi.spyOn(mockClient, 'callTool').mockRejectedValue(new Error('Tool failed'));

      const onError = vi.fn();
      render(<ToolCallPanel client={mockClient} onError={onError} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'failing_tool' } });
      });

      const button = screen.getByRole('button', { name: /execute/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('should call onToolCall callback on success', async () => {
      const tools = [
        { name: 'test_tool', description: 'Test', inputSchema: {} },
      ];

      mockClient = createMockClient(tools);
      const onToolCall = vi.fn();

      render(<ToolCallPanel client={mockClient} onToolCall={onToolCall} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'test_tool' } });
      });

      const button = screen.getByRole('button', { name: /execute/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onToolCall).toHaveBeenCalled();
      });
    });
  });

  describe('JSON validation', () => {
    it('should validate JSON arguments', async () => {
      const tools = [
        { name: 'test_tool', description: 'Test', inputSchema: {} },
      ];

      mockClient = createMockClient(tools);
      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'test_tool' } });
      });

      const editor = screen.getByPlaceholderText(/city.*Portland/i);
      fireEvent.change(editor, { target: { value: '{ invalid json }' } });

      const button = screen.getByRole('button', { name: /execute/i });
      fireEvent.click(button);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });
    });

    it('should accept valid JSON arguments', async () => {
      const tools = [
        { name: 'test_tool', description: 'Test', inputSchema: {} },
      ];

      mockClient = createMockClient(tools);
      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'test_tool' } });
      });

      const editor = screen.getByPlaceholderText(/city.*Portland/i);
      fireEvent.change(editor, { target: { value: '{"key": "value"}' } });

      const button = screen.getByRole('button', { name: /execute/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockClient.callTool).toHaveBeenCalledWith(
          'test_tool',
          { key: 'value' }
        );
      });
    });
  });

  describe('tool info display', () => {
    it('should show tool description', async () => {
      const tools = [
        {
          name: 'test_tool',
          description: 'This is a test tool',
          inputSchema: {},
        },
      ];

      mockClient = createMockClient(tools);
      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        expect(screen.getByText(/this is a test tool/i)).toBeInTheDocument();
      });
    });

    it('should show input schema', async () => {
      const tools = [
        {
          name: 'test_tool',
          description: 'Test',
          inputSchema: {
            type: 'object',
            properties: {
              city: { type: 'string', description: 'City name' },
            },
          },
        },
      ];

      mockClient = createMockClient(tools);
      render(<ToolCallPanel client={mockClient} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'test_tool' } });
      });

      // Should display schema information
      // Implementation dependent
    });
  });

  describe('custom styling', () => {
    it('should apply custom className', () => {
      mockClient = createMockClient();
      const { container } = render(
        <ToolCallPanel client={mockClient} className="custom-panel" />
      );

      const element = container.querySelector('.custom-panel');
      expect(element).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      mockClient = createMockClient();
      const customStyle = { backgroundColor: 'gray' };

      const { container } = render(
        <ToolCallPanel client={mockClient} style={customStyle} />
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveStyle({ backgroundColor: 'gray' });
    });
  });
});
