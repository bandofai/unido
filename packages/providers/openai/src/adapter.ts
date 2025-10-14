/**
 * OpenAI Provider Adapter
 * Implements MCP server for OpenAI ChatGPT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type {
  ComponentReference,
  ComponentDefinition,
  ProviderCapabilities,
  ServerConfig,
  ToolContext,
  UniversalResponse,
  UniversalTool,
} from '@bandofai/unido-core';
import {
  BaseProviderAdapter,
  type ProviderResponse,
  type ProviderSchema,
  type ProviderServer,
  type ProviderServerInfo,
  type ProviderToolDefinition,
} from '@bandofai/unido-provider-base';
import {
  type McpResource,
  type OpenAIComponentMetadata,
  createComponentResource,
  createOpenAIMetadata,
  generateResourceUri,
  generateComponentHtml,
} from '@bandofai/unido-provider-openai/resource.js';
import { zodToJsonSchema } from '@bandofai/unido-provider-openai/schema.js';
import { type OpenAIHttpServer, createHttpServer } from '@bandofai/unido-provider-openai/server.js';
import { bundleComponents, type BundledComponent } from './bundler.js';
import type { z } from 'zod';

// ============================================================================
// OpenAI Adapter
// ============================================================================

interface ComponentResourceEntry {
  definition: ComponentDefinition;
  bundle: BundledComponent;
  resource: McpResource;
  metadata: OpenAIComponentMetadata;
  html: string;
  dataUrl: string;
}

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
  private componentResourcesByUri = new Map<string, ComponentResourceEntry>();
  private componentResourcesByType = new Map<string, ComponentResourceEntry>();

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

    await this.prepareComponents(config.components ?? []);

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
        tools: config.tools.map((tool: UniversalTool) => {
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

      const tool = config.tools.find((t: UniversalTool) => t.name === name);
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
      return {
        resources: Array.from(this.componentResourcesByUri.values()).map(
          (entry) => entry.resource
        ),
      };
    });

    this.mcpServer.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      const entry = this.componentResourcesByUri.get(uri);

      if (!entry) {
        throw new Error(`Resource not found: ${uri}`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: entry.resource.mimeType,
            text: entry.html,
          },
        ],
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
    const content = response.content.map((item: UniversalResponse['content'][number]) => {
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
      const componentMeta = this.convertComponent(response.component);
      const metaRecord = this.buildComponentMetaRecord(componentMeta, response.component);
      Object.assign(metadata, metaRecord);
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

  private async prepareComponents(components: ComponentDefinition[]): Promise<void> {
    this.componentResourcesByUri.clear();
    this.componentResourcesByType.clear();

    if (!components || components.length === 0) {
      return;
    }

    const bundles = await bundleComponents(components);

    for (const component of components) {
      const bundled = bundles.get(component.type);

      if (!bundled) {
        console.warn(`⚠️  Skipping component "${component.type}" - bundle not generated.`);
        continue;
      }

      const dataUrl = this.createModuleDataUrl(bundled.code);
      const html = generateComponentHtml(dataUrl, component.type);
      const resource = createComponentResource(component, dataUrl);
      const metadata = this.createComponentOpenAIMetadata(component);

      const entry: ComponentResourceEntry = {
        definition: component,
        bundle: bundled,
        resource,
        metadata,
        html,
        dataUrl,
      };

      this.componentResourcesByUri.set(resource.uri, entry);
      this.componentResourcesByType.set(component.type, entry);
    }
  }

  private createModuleDataUrl(code: string): string {
    const encoded = Buffer.from(code, 'utf8').toString('base64');
    return `data:text/javascript;base64,${encoded}`;
  }

  private createComponentOpenAIMetadata(component: ComponentDefinition): OpenAIComponentMetadata {
    const widgetAccessible = this.extractWidgetAccessibleFromDefinition(component);

    return createOpenAIMetadata(component, {
      widgetAccessible,
    });
  }

  convertComponent(component: ComponentReference): OpenAIComponentMetadata {
    return this.getComponentMetadata(component);
  }

  private getComponentMetadata(component: ComponentReference): OpenAIComponentMetadata {
    const entry = this.componentResourcesByType.get(component.type);
    const widgetAccessibleOverride = this.extractWidgetAccessibleFromReference(component);

    if (entry) {
      return {
        ...entry.metadata,
        widgetAccessible:
          widgetAccessibleOverride ?? entry.metadata.widgetAccessible ?? false,
      };
    }

    const resourceUri = generateResourceUri(component.type);

    return {
      outputTemplate: resourceUri,
      widgetAccessible: widgetAccessibleOverride ?? false,
    };
  }

  private buildComponentMetaRecord(
    metadata: OpenAIComponentMetadata,
    component?: ComponentReference
  ): Record<string, unknown> {
    const record: Record<string, unknown> = {};

    if (metadata.outputTemplate) {
      record['openai/outputTemplate'] = metadata.outputTemplate;
    }

    if (typeof metadata.widgetAccessible === 'boolean') {
      record['openai/widgetAccessible'] = metadata.widgetAccessible;
    }

    if (metadata.description) {
      record['openai/description'] = metadata.description;
    }

    if (component?.metadata) {
      for (const [key, value] of Object.entries(component.metadata)) {
        if (key.startsWith('openai/')) {
          record[key] = value;
        }
      }
    }

    return record;
  }

  private extractWidgetAccessibleFromDefinition(
    component: ComponentDefinition
  ): boolean | undefined {
    const providerMetadata = component.metadata?.openai;
    const renderHints = providerMetadata?.renderHints as Record<string, unknown> | undefined;
    const widgetAccessible = renderHints?.widgetAccessible;

    return typeof widgetAccessible === 'boolean' ? widgetAccessible : undefined;
  }

  private extractWidgetAccessibleFromReference(
    component: ComponentReference
  ): boolean | undefined {
    if (!component.metadata) {
      return undefined;
    }

    if (typeof (component.metadata as Record<string, unknown>).widgetAccessible === 'boolean') {
      return (component.metadata as Record<string, unknown>).widgetAccessible as boolean;
    }

    const openaiMetadata = (component.metadata as Record<string, unknown>)['openai/widgetAccessible'];
    if (typeof openaiMetadata === 'boolean') {
      return openaiMetadata;
    }

    return undefined;
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
    this.componentResourcesByUri.clear();
    this.componentResourcesByType.clear();
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
