/**
 * Claude Provider Adapter
 * Implements MCP server for Anthropic Claude Desktop with stdio transport
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type {
  ProviderCapabilities,
  ServerConfig,
  ToolContext,
  UniversalResponse,
  UniversalTool,
} from '@unido/core';
import {
  BaseProviderAdapter,
  type ProviderResponse,
  type ProviderSchema,
  type ProviderServer,
  type ProviderServerInfo,
  type ProviderToolDefinition,
} from '@unido/provider-base';
import { zodToJsonSchema } from '@unido/provider-claude/schema.js';
import type { z } from 'zod';

// ============================================================================
// Claude Adapter
// ============================================================================

export class ClaudeAdapter extends BaseProviderAdapter {
  readonly name = 'claude' as const;
  readonly capabilities: ProviderCapabilities = {
    supportsComponents: false, // Claude uses text fallback for components
    supportsOAuth: false,
    supportsFileUpload: true,
    supportsStreaming: true,
    transports: ['stdio'],
    mcpVersion: '2025-06-18',
  };

  private mcpServer?: Server;
  private stdioTransport?: StdioServerTransport;

  // =========================================================================
  // Initialization
  // =========================================================================

  async initialize(config: ServerConfig): Promise<void> {
    await super.initialize(config);

    // Create MCP server for Claude
    this.mcpServer = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Set up tool handlers using MCP SDK schemas
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: config.tools.map((tool) => {
          const converted = this.convertTool(tool);
          return {
            name: converted.name,
            description: converted.description,
            inputSchema: converted.inputSchema,
          };
        }),
      };
    });

    // Set up tool call handler
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const tool = config.tools.find((t) => t.name === name);
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      const context: ToolContext = {
        provider: 'claude',
      };

      const result = await this.handleToolCall(tool, args, context);
      return result as any;
    });

    // Set up resources handler (for future use)
    this.mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [],
      };
    });
  }

  // =========================================================================
  // Schema Conversion
  // =========================================================================

  convertSchema(zodSchema: z.ZodType): ProviderSchema {
    return zodToJsonSchema(zodSchema);
  }

  // =========================================================================
  // Tool Conversion
  // =========================================================================

  convertTool(tool: UniversalTool): ProviderToolDefinition {
    const inputSchema = this.convertSchema(tool.inputSchema);

    // Claude uses standard MCP format without special metadata
    return {
      name: tool.name,
      title: tool.title,
      description: tool.description,
      inputSchema,
      metadata: tool.metadata?.claude ?? {},
    };
  }

  // =========================================================================
  // Response Conversion
  // =========================================================================

  convertResponse(response: UniversalResponse, _tool?: UniversalTool): ProviderResponse {
    // Convert content to MCP format
    const content = response.content.map((item) => {
      switch (item.type) {
        case 'text':
          return {
            type: 'text',
            text: item.text,
          };
        case 'image':
          return {
            type: 'image',
            data: item.data,
            mimeType: item.mimeType,
          };
        case 'resource':
          return {
            type: 'resource',
            resource: item.resource,
          };
        case 'error':
          return {
            type: 'text',
            text: `Error: ${item.error.message}`,
          };
        default:
          return item;
      }
    });

    // Claude doesn't support components directly, so we handle graceful degradation
    // If a component is present and no text fallback was provided, we can add a note
    if (response.component && content.length === 0) {
      content.push({
        type: 'text',
        text: `[Component: ${response.component.type}]`,
      });
    }

    return {
      content,
    };
  }

  // =========================================================================
  // Tool Invocation
  // =========================================================================

  async handleToolCall(
    tool: UniversalTool,
    input: unknown,
    context: ToolContext
  ): Promise<ProviderResponse> {
    // Validate input
    const validation = this.validateInput(tool.inputSchema, input);

    if (!validation.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Input validation error: ${validation.error.message}`,
          },
        ],
      };
    }

    // Execute tool handler
    try {
      const response = await tool.handler(validation.data, context);
      return this.convertResponse(response, tool);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Tool execution error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // =========================================================================
  // Server Lifecycle
  // =========================================================================

  async startServer(): Promise<ProviderServer> {
    if (!this.mcpServer) {
      throw new Error('Adapter not initialized. Call initialize() first.');
    }

    // Create stdio transport for Claude Desktop
    this.stdioTransport = new StdioServerTransport();

    // Connect transport to server
    await this.mcpServer.connect(this.stdioTransport);

    const serverInfo: ProviderServerInfo = {
      provider: 'claude',
      transport: 'stdio',
      status: 'running',
    };

    this.server = {
      provider: 'claude',
      start: async () => {
        // Server is already started via connect
      },
      stop: async () => {
        await this.stopServer();
      },
      getInfo: () => serverInfo,
    };

    return this.server;
  }

  async stopServer(): Promise<void> {
    if (this.stdioTransport) {
      await this.stdioTransport.close();
      this.stdioTransport = undefined;
    }

    if (this.mcpServer) {
      await this.mcpServer.close();
      this.mcpServer = undefined;
    }

    await super.stopServer();
  }

  // =========================================================================
  // Cleanup
  // =========================================================================

  async cleanup(): Promise<void> {
    await this.stopServer();
    await super.cleanup();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create Claude provider adapter
 */
export function createClaudeAdapter(): ClaudeAdapter {
  return new ClaudeAdapter();
}
