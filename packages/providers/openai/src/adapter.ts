/**
 * OpenAI Provider Adapter
 * Implements MCP server for OpenAI ChatGPT
 */

import type {
  ComponentDefinition,
  ComponentReference,
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
  generateComponentHtml,
  generateResourceUri,
} from '@bandofai/unido-provider-openai/resource.js';
import { zodToJsonSchema } from '@bandofai/unido-provider-openai/schema.js';
import { type OpenAIHttpServer, createHttpServer } from '@bandofai/unido-provider-openai/server.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';
import { type BundledComponent, bundleComponents } from './bundler.js';
import { type Logger, createLogger } from './logger.js';

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
  private serverConfig?: ServerConfig;
  private port = 3000;
  private host = 'localhost';
  private componentResourcesByUri = new Map<string, ComponentResourceEntry>();
  private componentResourcesByType = new Map<string, ComponentResourceEntry>();
  private watcher?: { close: () => void };
  private watchEnabled = false;
  private logger: Logger;

  constructor() {
    super();
    this.logger = createLogger({ prefix: '[unido:adapter]' });
  }

  // =========================================================================
  // Initialization
  // =========================================================================

  async initialize(config: ServerConfig): Promise<void> {
    await super.initialize(config);

    this.logger.debug('Initializing OpenAI adapter', {
      name: config.name,
      version: config.version,
    });

    // Store config for use in factory
    this.serverConfig = config;

    // Extract config from provider config
    const providerConfig = config.providers?.openai;
    if (providerConfig?.port) {
      this.port = providerConfig.port as number;
    }
    if (providerConfig?.host) {
      this.host = providerConfig.host as string;
    }
    if (providerConfig?.watch) {
      this.watchEnabled = providerConfig.watch as boolean;
    }

    this.logger.debug('Configuration loaded', {
      port: this.port,
      host: this.host,
      watchEnabled: this.watchEnabled,
      componentsCount: config.components?.length ?? 0,
      toolsCount: config.tools?.length ?? 0,
    });

    await this.prepareComponents(config.components ?? []);

    // Start file watching if enabled
    if (this.watchEnabled && config.components && config.components.length > 0) {
      this.logger.info('File watching enabled', { componentsCount: config.components.length });
      await this.startWatching(config.components);
    }

    // Create an initial MCP server instance for validation
    this.mcpServer = this.createMcpServerInstance();
    this.logger.debug('MCP server instance created for validation');
  }

  // =========================================================================
  // MCP Server Factory
  // =========================================================================

  /**
   * Create a new MCP Server instance
   * This is called for each SSE connection to ensure proper isolation
   */
  private createMcpServerInstance(): Server {
    const server = new Server(
      {
        name: this.serverConfig?.name ?? 'unido-server',
        version: this.serverConfig?.version ?? '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Set up tool handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.info('📋 MCP Request: tools/list');
      const tools = (this.serverConfig?.tools ?? []).map((tool: UniversalTool) => {
        const converted = this.convertTool(tool);
        return {
          name: converted.name,
          description: converted.description,
          inputSchema: converted.inputSchema,
          ...(converted.metadata && Object.keys(converted.metadata).length > 0
            ? { _meta: converted.metadata }
            : {}),
        };
      });
      this.logger.info('📋 MCP Response: tools/list', {
        toolCount: tools.length,
        toolNames: tools.map(t => t.name),
        fullTools: JSON.stringify(tools, null, 2)
      });
      return { tools };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      this.logger.info('🔧 MCP Request: tools/call', {
        toolName: name,
        arguments: JSON.stringify(args, null, 2)
      });

      const tool = (this.serverConfig?.tools ?? []).find((t: UniversalTool) => t.name === name);
      if (!tool) {
        this.logger.error('❌ Tool not found', new Error(`Tool not found: ${name}`), { toolName: name });
        throw new Error(`Tool not found: ${name}`);
      }

      const context: ToolContext = {
        provider: 'openai',
      };

      const result = await this.handleToolCall(tool, args, context);
      this.logger.info('🔧 MCP Response: tools/call', {
        toolName: name,
        result: JSON.stringify(result, null, 2)
      });
      return result as any;
    });

    // Register resources handler for components
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
      this.logger.info('📦 MCP Request: resources/list');
      const resources = Array.from(this.componentResourcesByUri.values()).map((entry) => entry.resource);
      this.logger.info('📦 MCP Response: resources/list', {
        resourceCount: resources.length,
        resourceUris: resources.map(r => r.uri)
      });
      return { resources };
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      this.logger.info('📄 MCP Request: resources/read', { uri });
      const entry = this.componentResourcesByUri.get(uri);

      if (!entry) {
        this.logger.error('❌ Resource not found', new Error(`Resource not found: ${uri}`), { uri });
        throw new Error(`Resource not found: ${uri}`);
      }

      const response = {
        contents: [
          {
            uri,
            mimeType: entry.resource.mimeType,
            text: entry.html,
          },
        ],
      };
      this.logger.info('📄 MCP Response: resources/read', {
        uri,
        mimeType: entry.resource.mimeType,
        htmlLength: entry.html.length
      });
      return response;
    });

    return server;
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

    // Build metadata object
    const metadata: Record<string, unknown> = {};

    // Add explicit tool metadata if provided
    if (openaiMetadata.outputTemplate) {
      metadata['openai/outputTemplate'] = openaiMetadata.outputTemplate;
    }
    if (typeof openaiMetadata.widgetAccessible === 'boolean') {
      metadata['openai/widgetAccessible'] = openaiMetadata.widgetAccessible;
    }

    // Spread any additional openai metadata
    Object.entries(openaiMetadata).forEach(([key, value]) => {
      if (!key.startsWith('openai/')) {
        metadata[`openai/${key}`] = value;
      } else {
        metadata[key] = value;
      }
    });

    // If tool can produce widgets (has registered components), add widget metadata
    if (this.componentResourcesByType.size > 0) {
      // Signal that this server has widgets available
      if (!metadata['openai/resultCanProduceWidget']) {
        metadata['openai/resultCanProduceWidget'] = true;
      }

      // If there's only one component registered, assume this tool uses it
      // This is a common pattern for simple apps
      if (this.componentResourcesByType.size === 1) {
        const componentEntry = Array.from(this.componentResourcesByType.values())[0];
        if (!componentEntry) return { name: tool.name, title: tool.title, description: tool.description, inputSchema, metadata };
        const componentMetadata = componentEntry.metadata;

        // Add component metadata to tool definition
        if (!metadata['openai/outputTemplate']) {
          metadata['openai/outputTemplate'] = componentMetadata.outputTemplate;
        }
        if (!metadata['openai/widgetAccessible'] && typeof componentMetadata.widgetAccessible === 'boolean') {
          metadata['openai/widgetAccessible'] = componentMetadata.widgetAccessible;
        }
        if (!metadata['openai/toolInvocation/invoking'] && componentMetadata.invoking) {
          metadata['openai/toolInvocation/invoking'] = componentMetadata.invoking;
        }
        if (!metadata['openai/toolInvocation/invoked'] && componentMetadata.invoked) {
          metadata['openai/toolInvocation/invoked'] = componentMetadata.invoked;
        }
      }
    }

    return {
      name: tool.name,
      title: tool.title,
      description: tool.description,
      inputSchema,
      metadata,
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
    let structuredContent: Record<string, unknown> | undefined;

    if (response.component) {
      const componentMeta = this.convertComponent(response.component);
      const metaRecord = this.buildComponentMetaRecord(componentMeta, response.component);
      Object.assign(metadata, metaRecord);

      // Add structured content with component props for ChatGPT
      if (response.component.props) {
        structuredContent = response.component.props;
      }
    }

    // Merge with any existing metadata
    if (response.metadata) {
      Object.assign(metadata, response.metadata);
    }

    return {
      content,
      ...(structuredContent ? { structuredContent } : {}),
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
      this.logger.debug('No components to prepare');
      return;
    }

    this.logger.info('Preparing components', { count: components.length });
    const bundles = await bundleComponents(components);
    this.logger.debug('Components bundled', { successCount: bundles.size });

    for (const component of components) {
      const bundled = bundles.get(component.type);

      if (!bundled) {
        this.logger.warn('Skipping component - bundle not generated', { componentType: component.type });
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
      this.logger.debug('Component prepared', {
        type: component.type,
        uri: resource.uri,
        bundleSize: bundled.code.length,
      });
    }

    this.logger.info('Components preparation complete', {
      total: components.length,
      registered: this.componentResourcesByType.size,
    });
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
        widgetAccessible: widgetAccessibleOverride ?? entry.metadata.widgetAccessible ?? false,
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

    // Add tool invocation status messages
    if (metadata.invoking) {
      record['openai/toolInvocation/invoking'] = metadata.invoking;
    }

    if (metadata.invoked) {
      record['openai/toolInvocation/invoked'] = metadata.invoked;
    }

    // Indicate that the tool result can produce a widget
    if (typeof metadata.resultCanProduceWidget === 'boolean') {
      record['openai/resultCanProduceWidget'] = metadata.resultCanProduceWidget;
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

  private extractWidgetAccessibleFromReference(component: ComponentReference): boolean | undefined {
    if (!component.metadata) {
      return undefined;
    }

    if (typeof (component.metadata as Record<string, unknown>).widgetAccessible === 'boolean') {
      return (component.metadata as Record<string, unknown>).widgetAccessible as boolean;
    }

    const openaiMetadata = (component.metadata as Record<string, unknown>)[
      'openai/widgetAccessible'
    ];
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
    this.logger.info('📞 Tool call received', {
      toolName: tool.name,
      input: JSON.stringify(input, null, 2)
    });

    // Validate input
    const validation = this.validateInput(tool.inputSchema, input);

    if (!validation.success) {
      this.logger.warn('❌ Tool input validation failed', {
        toolName: tool.name,
        input: JSON.stringify(input, null, 2),
        error: validation.error.message,
        zodErrors: validation.error.issues
      });
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
      this.logger.info('⚙️  Executing tool handler', {
        toolName: tool.name,
        validatedInput: JSON.stringify(validation.data, null, 2)
      });
      const response = await tool.handler(validation.data, context);
      this.logger.info('✅ Tool executed successfully', {
        toolName: tool.name,
        responseContent: JSON.stringify(response.content, null, 2),
        hasComponent: !!response.component,
        componentType: response.component?.type
      });
      const convertedResponse = this.convertResponse(response, tool);
      this.logger.info('📤 Response converted for ChatGPT', {
        toolName: tool.name,
        convertedResponse: JSON.stringify(convertedResponse, null, 2)
      });
      return convertedResponse;
    } catch (error) {
      this.logger.error('❌ Tool execution error', error, {
        toolName: tool.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
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

    this.logger.info('Starting OpenAI MCP server', {
      host: this.host,
      port: this.port,
    });

    // Create a factory function that creates a new MCP server for each connection
    const createMcpServer = () => this.createMcpServerInstance();

    // Create HTTP server with SSE support
    this.httpServer = createHttpServer(createMcpServer, {
      port: this.port,
      host: this.host,
      cors: true,
      logger: this.logger.child('server'),
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
    this.logger.info('Stopping OpenAI MCP server');

    if (this.httpServer) {
      this.logger.debug('Closing HTTP server');
      await this.httpServer.close();
      this.httpServer = undefined;
    }

    if (this.mcpServer) {
      this.logger.debug('Closing MCP server');
      await this.mcpServer.close();
      this.mcpServer = undefined;
    }

    await super.stopServer();
    this.logger.info('Server stopped successfully');
  }

  // =========================================================================
  // Component Watching
  // =========================================================================

  /**
   * Start watching component files for changes
   */
  private async startWatching(components: ComponentDefinition[]): Promise<void> {
    const chokidar = await import('chokidar');
    const paths = components.map((c) => c.sourcePath);

    this.logger.info('Starting file watcher', {
      componentsCount: paths.length,
      paths: paths,
    });

    const watcher = chokidar.watch(paths, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', async (changedPath) => {
      const component = components.find((c) => c.sourcePath === changedPath);
      if (component) {
        this.logger.info('Component file changed', {
          componentType: component.type,
          path: changedPath,
        });
        await this.rebundleComponent(component);
      }
    });

    watcher.on('error', (error) => {
      this.logger.error('File watcher error', error);
    });

    this.watcher = watcher;
    this.logger.debug('File watcher started successfully');
  }

  /**
   * Rebundle a single component and update resources
   */
  private async rebundleComponent(component: ComponentDefinition): Promise<void> {
    try {
      this.logger.info('Rebundling component', { componentType: component.type });

      // Rebundle just this component
      const bundles = await bundleComponents([component]);
      const bundled = bundles.get(component.type);

      if (!bundled) {
        this.logger.error('Failed to rebundle component', undefined, { componentType: component.type });
        return;
      }

      // Update resources
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

      this.logger.info('Component rebundled successfully', {
        componentType: component.type,
        bundleSize: bundled.code.length,
      });
    } catch (error) {
      this.logger.error('Error rebundling component', error, { componentType: component.type });
    }
  }

  // =========================================================================
  // Cleanup
  // =========================================================================

  async cleanup(): Promise<void> {
    await this.stopServer();
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }
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
