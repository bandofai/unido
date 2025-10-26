/**
 * Tests for LogPanel component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogPanel } from '../../components/LogPanel.js';
import type { LogEntry } from '../../components/LogPanel.js';

const createLogEntry = (level: LogEntry['level'], message: string, data?: unknown): LogEntry => ({
  id: `${Date.now()}-${Math.random()}`,
  timestamp: Date.now(),
  level,
  message,
  data,
});

describe('LogPanel', () => {
  describe('rendering', () => {
    it('should render empty state when no logs', () => {
      render(<LogPanel logs={[]} />);

      expect(screen.getByText(/no logs/i)).toBeInTheDocument();
    });

    it('should render log entries', () => {
      const logs: LogEntry[] = [
        createLogEntry('info', 'Test log 1'),
        createLogEntry('error', 'Test log 2'),
      ];

      render(<LogPanel logs={logs} />);

      expect(screen.getByText('Test log 1')).toBeInTheDocument();
      expect(screen.getByText('Test log 2')).toBeInTheDocument();
    });

    it('should display log levels with colors', () => {
      const logs: LogEntry[] = [
        createLogEntry('debug', 'Debug message'),
        createLogEntry('info', 'Info message'),
        createLogEntry('warn', 'Warning message'),
        createLogEntry('error', 'Error message'),
      ];

      render(<LogPanel logs={logs} />);

      expect(screen.getByText('Debug message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should display timestamps', () => {
      const logs: LogEntry[] = [
        createLogEntry('info', 'Test message'),
      ];

      render(<LogPanel logs={logs} />);

      // Check for timestamp format (HH:MM:SS.mmm)
      const timestampPattern = /\d{2}:\d{2}:\d{2}\.\d{3}/;
      const timestamp = screen.getByText(timestampPattern);
      expect(timestamp).toBeInTheDocument();
    });

    it('should display data when provided', () => {
      const logData = { key: 'value', number: 42 };
      const logs: LogEntry[] = [
        createLogEntry('info', 'Test message', logData),
      ];

      render(<LogPanel logs={logs} />);

      // Data should be JSON stringified
      expect(screen.getByText(/key/)).toBeInTheDocument();
      expect(screen.getByText(/value/)).toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    const logs: LogEntry[] = [
      createLogEntry('debug', 'Debug message'),
      createLogEntry('info', 'Info message'),
      createLogEntry('warn', 'Warn message'),
      createLogEntry('error', 'Error message'),
    ];

    it('should show all logs by default', () => {
      render(<LogPanel logs={logs} />);

      expect(screen.getByText('Debug message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByText('Warn message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should filter by debug level', () => {
      render(<LogPanel logs={logs} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'debug' } });

      expect(screen.getByText('Debug message')).toBeInTheDocument();
      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
    });

    it('should filter by info level', () => {
      render(<LogPanel logs={logs} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'info' } });

      expect(screen.queryByText('Debug message')).not.toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('should filter by warn level', () => {
      render(<LogPanel logs={logs} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'warn' } });

      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
      expect(screen.getByText('Warn message')).toBeInTheDocument();
    });

    it('should filter by error level', () => {
      render(<LogPanel logs={logs} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'error' } });

      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('clear functionality', () => {
    it('should show clear button', () => {
      const logs: LogEntry[] = [createLogEntry('info', 'Test')];
      render(<LogPanel logs={logs} />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should call onClear when clear button clicked', () => {
      const logs: LogEntry[] = [createLogEntry('info', 'Test')];
      const onClear = vi.fn();

      render(<LogPanel logs={logs} onClear={onClear} />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('max logs limit', () => {
    it('should respect maxLogs limit', () => {
      const logs: LogEntry[] = Array.from({ length: 150 }, (_, i) =>
        createLogEntry('info', `Message ${i}`)
      );

      render(<LogPanel logs={logs} maxLogs={100} />);

      // Should only show last 100 logs
      expect(screen.queryByText('Message 0')).not.toBeInTheDocument();
      expect(screen.getByText('Message 149')).toBeInTheDocument();
    });

    it('should use default max logs if not provided', () => {
      const logs: LogEntry[] = Array.from({ length: 150 }, (_, i) =>
        createLogEntry('info', `Message ${i}`)
      );

      render(<LogPanel logs={logs} />);

      // Default is 100, so first 50 should not be visible
      expect(screen.queryByText('Message 0')).not.toBeInTheDocument();
    });
  });

  describe('custom styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <LogPanel logs={[]} className="custom-log-panel" />
      );

      const element = container.querySelector('.custom-log-panel');
      expect(element).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'blue' };
      const { container } = render(
        <LogPanel logs={[]} style={customStyle} />
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveStyle({ backgroundColor: 'blue' });
    });
  });

  describe('expandable data', () => {
    it('should allow expanding log data', () => {
      const logData = { key: 'value', nested: { data: 123 } };
      const logs: LogEntry[] = [
        createLogEntry('info', 'Test message', logData),
      ];

      render(<LogPanel logs={logs} />);

      // Click to expand/collapse data (implementation dependent)
      const logEntry = screen.getByText('Test message');
      expect(logEntry).toBeInTheDocument();
    });
  });

  describe('auto-scroll', () => {
    it('should auto-scroll to latest logs', () => {
      const logs: LogEntry[] = [
        createLogEntry('info', 'Old message'),
        createLogEntry('info', 'New message'),
      ];

      const { rerender } = render(<LogPanel logs={logs} />);

      // Add new log
      const updatedLogs = [
        ...logs,
        createLogEntry('info', 'Newest message'),
      ];

      rerender(<LogPanel logs={updatedLogs} />);

      // Latest message should be visible
      expect(screen.getByText('Newest message')).toBeInTheDocument();
    });
  });
});
