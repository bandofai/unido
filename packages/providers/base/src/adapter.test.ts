/**
 * Tests for provider base adapter
 */

import type {
  ProviderCapabilities,
  ServerConfig,
  ToolContext,
  UniversalResponse,
  UniversalTool,
} from '@unido/core';
import {
  BaseProviderAdapter,
  type ProviderAdapter,
  type ProviderResponse,
  type ProviderSchema,
  type ProviderServer,
  type ProviderServerInfo,
  type ProviderToolDefinition,
} from '@unido/provider-base/adapter.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

// ============================================================================
// Mock Adapter Implementation
// ============================================================================

class MockAdapter extends BaseProviderAdapter {
  readonly name = 'mock' as const;
  readonly capabilities: ProviderCapabilities = {
    supportsComponents: false,
    transports: ['http'],
  };

  convertSchema = vi.fn((_zodSchema: z.ZodType): ProviderSchema => {
    return { type: 'mock-schema' };
  });

  convertTool = vi.fn((tool: UniversalTool): ProviderToolDefinition => {
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: this.convertSchema(tool.input),
    };
  });

  convertResponse = vi.fn(
    (response: UniversalResponse, _tool?: UniversalTool): ProviderResponse => {
      return { mockResponse: response };
    }
  );

  handleToolCall = vi.fn(
    async (
      tool: UniversalTool,
      input: unknown,
      _context: ToolContext
    ): Promise<ProviderResponse> => {
      const validation = this.validateInput(tool.input, input);
      if (!validation.success) {
        return { error: validation.error.message };
      }
      const result = await tool.handler(validation.data, _context);
      return this.convertResponse(result, tool);
    }
  );

  startServer = vi.fn(async (): Promise<ProviderServer> => {
    const serverInfo: ProviderServerInfo = {
      provider: this.name,
      transport: 'http',
      port: 3000,
      status: 'running',
    };

    this.server = {
      provider: this.name,
      start: vi.fn(async () => {
        // No-op mock
      }),
      stop: vi.fn(async () => {
        // No-op mock
      }),
      getInfo: vi.fn(() => serverInfo),
    };

    return this.server;
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('BaseProviderAdapter', () => {
  let adapter: MockAdapter;
  let mockConfig: ServerConfig;

  beforeEach(() => {
    adapter = new MockAdapter();
    mockConfig = {
      name: 'test-app',
      version: '1.0.0',
      providers: {
        mock: {
          enabled: true,
        },
      },
    };
  });

  describe('initialize', () => {
    it('should store config', async () => {
      await adapter.initialize(mockConfig);
      expect(adapter.config).toBe(mockConfig);
    });

    it('should be called before other operations', async () => {
      expect(adapter.config).toBeUndefined();
      await adapter.initialize(mockConfig);
      expect(adapter.config).toBeDefined();
    });
  });

  describe('convertSchema', () => {
    it('should convert Zod schema to provider format', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = adapter.convertSchema(schema);
      expect(result).toEqual({ type: 'mock-schema' });
      expect(adapter.convertSchema).toHaveBeenCalledWith(schema);
    });
  });

  describe('convertTool', () => {
    it('should convert universal tool to provider format', () => {
      const tool: UniversalTool = {
        name: 'test_tool',
        title: 'Test Tool',
        description: 'A test tool',
        input: z.object({ input: z.string() }),
        handler: vi.fn(),
        metadata: {},
      };

      const result = adapter.convertTool(tool);
      expect(result).toEqual({
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: { type: 'mock-schema' },
      });
      expect(adapter.convertTool).toHaveBeenCalledWith(tool);
    });
  });

  describe('convertResponse', () => {
    it('should convert universal response to provider format', () => {
      const response: UniversalResponse = {
        content: [{ type: 'text', text: 'Hello' }],
      };

      const result = adapter.convertResponse(response);
      expect(result).toEqual({ mockResponse: response });
      expect(adapter.convertResponse).toHaveBeenCalledWith(response);
    });

    it('should include tool metadata if provided', () => {
      const response: UniversalResponse = {
        content: [{ type: 'text', text: 'Hello' }],
      };
      const tool: UniversalTool = {
        name: 'test_tool',
        description: 'Test',
        input: z.object({}),
        handler: vi.fn(),
        metadata: { openai: { test: true } },
      };

      adapter.convertResponse(response, tool);
      expect(adapter.convertResponse).toHaveBeenCalledWith(response, tool);
    });
  });

  describe('handleToolCall', () => {
    it('should validate input and call handler', async () => {
      const handler = vi.fn(async (input: { name: string }) => ({
        content: [{ type: 'text' as const, text: `Hello ${input.name}` }],
      }));

      const tool: UniversalTool = {
        name: 'greet',
        description: 'Greet user',
        input: z.object({ name: z.string() }),
        handler,
        metadata: {},
      };

      const context: ToolContext = { requestId: 'test-123' };
      const result = await adapter.handleToolCall(tool, { name: 'Alice' }, context);

      expect(handler).toHaveBeenCalledWith({ name: 'Alice' }, context);
      expect(result).toEqual({
        mockResponse: {
          content: [{ type: 'text', text: 'Hello Alice' }],
        },
      });
    });

    it('should return error for invalid input', async () => {
      const tool: UniversalTool = {
        name: 'test',
        description: 'Test',
        input: z.object({ value: z.number() }),
        handler: vi.fn(),
        metadata: {},
      };

      const context: ToolContext = { requestId: 'test-123' };
      const result = await adapter.handleToolCall(tool, { value: 'not-a-number' }, context);

      expect(result).toHaveProperty('error');
    });
  });

  describe('startServer', () => {
    it('should create and store server instance', async () => {
      const server = await adapter.startServer();

      expect(server).toBeDefined();
      expect(server.provider).toBe('mock');
      expect(adapter.server).toBe(server);
    });

    it('should return provider server with correct info', async () => {
      const server = await adapter.startServer();
      const info = server.getInfo();

      expect(info).toEqual({
        provider: 'mock',
        transport: 'http',
        port: 3000,
        status: 'running',
      });
    });
  });

  describe('stopServer', () => {
    it('should stop server if running', async () => {
      const server = await adapter.startServer();
      const stopSpy = server.stop as ReturnType<typeof vi.fn>;

      await adapter.stopServer();

      expect(stopSpy).toHaveBeenCalled();
      expect(adapter.server).toBeUndefined();
    });

    it('should do nothing if no server is running', async () => {
      await expect(adapter.stopServer()).resolves.not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should stop server during cleanup', async () => {
      await adapter.startServer();
      const stopServerSpy = vi.spyOn(adapter, 'stopServer');

      await adapter.cleanup();

      expect(stopServerSpy).toHaveBeenCalled();
    });

    it('should handle cleanup when no server exists', async () => {
      await expect(adapter.cleanup()).resolves.not.toThrow();
    });
  });

  describe('validateInput', () => {
    it('should return success for valid input', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = adapter.validateInput(schema, { name: 'Alice', age: 30 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'Alice', age: 30 });
      }
    });

    it('should return error for invalid input', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = adapter.validateInput(schema, { name: 'Alice', age: 'invalid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should validate complex nested schemas', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        settings: z.object({
          theme: z.enum(['light', 'dark']),
        }),
      });

      const validInput = {
        user: { name: 'Alice', email: 'alice@example.com' },
        settings: { theme: 'dark' },
      };

      const result = adapter.validateInput(schema, validInput);
      expect(result.success).toBe(true);
    });
  });
});
