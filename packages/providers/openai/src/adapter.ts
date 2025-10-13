/**
 * OpenAI Provider Adapter
 * Implements MCP server for OpenAI ChatGPT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type {
  ComponentReference,
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
import {
  type OpenAIComponentMetadata,
  generateResourceUri,
} from '@unido/provider-openai/resource.js';
import { zodToJsonSchema } from '@unido/provider-openai/schema.js';
import { type OpenAIHttpServer, createHttpServer } from '@unido/provider-openai/server.js';
import type { z } from 'zod';

// ============================================================================
// OpenAI Adapter
// ============================================================================

export class OpenAIAdapter extends BaseProviderAdapter {
  readonly name = 'openai' as const;
  readonly capabilities: ProviderCapabilities = {
    supportsComponents: true,
    supportsOAuth: true,
    supportsFileUpload: true,
    supportsStreaming: true,
    transports: ['http', 'sse'],
    mcpVersion: '2025-06-18',
  };

  private mcpServer?: Server;
  private httpServer?: OpenAIHttpServer;
  private port = 3000;
  private host = 'localhost';

  // =========================================================================
  // Initialization
  // =========================================================================

  async initialize(config: ServerConfig): Promise<void> {
    await super.initialize(config);

    // Extract config from provider config
    const providerConfig = config.providers?.openai;
    if (providerConfig?.port) {
      this.port = providerConfig.port as number;
    }
    if (providerConfig?.host) {
      this.host = providerConfig.host as string;
    }

    // Create MCP server
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

    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const tool = config.tools.find((t) => t.name === name);
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      const context: ToolContext = {
        provider: 'openai',
      };

      const result = await this.handleToolCall(tool, args, context);
      return result as any;
    });

    // Register resources handler for components
    this.mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => {
      // Return list of component resources
      // This would be populated based on registered components
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

    // Extract OpenAI-specific metadata
    const openaiMetadata = tool.metadata?.openai ?? {};

    return {
      name: tool.name,
      title: tool.title,
      description: tool.description,
      inputSchema,
      metadata: {
        'openai/outputTemplate': openaiMetadata.outputTemplate,
        'openai/widgetAccessible': openaiMetadata.widgetAccessible,
        ...openaiMetadata,
      },
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

    // Add component metadata if present
    const metadata: Record<string, unknown> = {};

    if (response.component) {
      const componentMeta = this.convertComponentMetadata(response.component);
      Object.assign(metadata, componentMeta);
    }

    // Merge with any existing metadata
    if (response.metadata) {
      Object.assign(metadata, response.metadata);
    }

    return {
      content,
      ...(Object.keys(metadata).length > 0 ? { _meta: metadata } : {}),
    };
  }

  // =========================================================================
  // Component Handling
  // =========================================================================

  convertComponent(component: ComponentReference): OpenAIComponentMetadata {
    return this.convertComponentMetadata(component);
  }

  private convertComponentMetadata(component: ComponentReference): OpenAIComponentMetadata {
    const resourceUri = generateResourceUri(component.type);
    const widgetAccessible = component.metadata?.widgetAccessible;

    return {
      outputTemplate: resourceUri,
      widgetAccessible: typeof widgetAccessible === 'boolean' ? widgetAccessible : false,
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

    // Create HTTP server with SSE support
    this.httpServer = createHttpServer(this.mcpServer, {
      port: this.port,
      host: this.host,
      cors: true,
    });

    const serverInfo: ProviderServerInfo = {
      provider: 'openai',
      transport: 'sse',
      port: this.port,
      url: this.httpServer.url,
      status: 'running',
    };

    this.server = {
      provider: 'openai',
      start: async () => {
        // Server is already started via createHttpServer
      },
      stop: async () => {
        await this.stopServer();
      },
      getInfo: () => serverInfo,
    };

    return this.server;
  }

  async stopServer(): Promise<void> {
    if (this.httpServer) {
      await this.httpServer.close();
      this.httpServer = undefined;
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
 * Create OpenAI provider adapter
 */
export function createOpenAIAdapter(): OpenAIAdapter {
  return new OpenAIAdapter();
}
