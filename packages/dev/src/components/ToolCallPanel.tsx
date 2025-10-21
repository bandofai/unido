/**
 * Tool Call Panel Component
 *
 * Interactive panel for testing MCP tool calls with a UI for selecting tools,
 * entering arguments, and viewing responses.
 */

import React, { useEffect, useState } from 'react';
import type { McpWidgetClient } from '../mcp-client.js';

/**
 * Props for ToolCallPanel component
 */
export interface ToolCallPanelProps {
  /**
   * MCP client instance
   */
  client: McpWidgetClient;

  /**
   * Callback when tool call completes
   */
  onToolCall?: (result: { name: string; args: unknown; result: unknown; error?: Error }) => void;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * CSS class name
   */
  className?: string;
}

interface ToolInfo {
  name: string;
  description?: string;
}

/**
 * Tool Call Panel Component
 *
 * Provides an interactive UI for testing MCP tool calls.
 * Lists available tools, allows entering arguments as JSON,
 * and displays responses.
 *
 * @example
 * ```tsx
 * <ToolCallPanel
 *   client={mcpClient}
 *   onToolCall={(result) => {
 *     console.log('Tool called:', result.name);
 *     console.log('Result:', result.result);
 *   }}
 * />
 * ```
 */
export const ToolCallPanel: React.FC<ToolCallPanelProps> = ({
  client,
  onToolCall,
  style,
  className,
}) => {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [args, setArgs] = useState<string>('{}');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTools, setLoadingTools] = useState(false);

  // Load available tools
  const loadTools = async () => {
    if (!client.isConnected()) return;

    setLoadingTools(true);
    try {
      // Note: This would need a listTools() method on McpWidgetClient
      // For now, we'll show a manual input
      setTools([]);
    } catch (err) {
      console.error('Failed to load tools:', err);
    } finally {
      setLoadingTools(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, [client]);

  // Execute tool call
  const handleExecute = async () => {
    if (!selectedTool) {
      setError('Please select or enter a tool name');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse arguments
      const parsedArgs = JSON.parse(args);

      // Call tool
      const response = await client.callTool(selectedTool, parsedArgs);

      setResult(response.result);
      onToolCall?.({
        name: selectedTool,
        args: parsedArgs,
        result: response.result,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      onToolCall?.({
        name: selectedTool,
        args: JSON.parse(args),
        result: null,
        error: err instanceof Error ? err : new Error(errorMessage),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Tool Call Tester
        </h3>
        <button
          onClick={loadTools}
          disabled={loadingTools}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            backgroundColor: '#f8fafc',
            cursor: loadingTools ? 'not-allowed' : 'pointer',
          }}
        >
          {loadingTools ? 'Loading...' : 'Refresh Tools'}
        </button>
      </div>

      {/* Tool Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>
          Tool Name
        </label>
        {tools.length > 0 ? (
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            style={{
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
            }}
          >
            <option value="">Select a tool...</option>
            {tools.map((tool) => (
              <option key={tool.name} value={tool.name}>
                {tool.name} {tool.description && `- ${tool.description}`}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            placeholder="e.g., get_weather"
            style={{
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
            }}
          />
        )}
      </div>

      {/* Arguments Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>
          Arguments (JSON)
        </label>
        <textarea
          value={args}
          onChange={(e) => setArgs(e.target.value)}
          placeholder='{"city": "Portland"}'
          rows={4}
          style={{
            padding: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={loading || !client.isConnected()}
        style={{
          padding: '10px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#ffffff',
          backgroundColor: loading ? '#94a3b8' : '#3b82f6',
          border: 'none',
          borderRadius: '6px',
          cursor: loading || !client.isConnected() ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Executing...' : 'Execute Tool Call'}
      </button>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '13px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result Display */}
      {result !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>
            Result
          </label>
          <pre
            style={{
              padding: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: '200px',
              margin: 0,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Connection Warning */}
      {!client.isConnected() && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#fefce8',
            border: '1px solid #fde047',
            borderRadius: '4px',
            color: '#ca8a04',
            fontSize: '12px',
          }}
        >
          ⚠️ MCP client not connected. Tool calls will fail.
        </div>
      )}
    </div>
  );
};
