/**
 * Tests for tool system
 */

import {
  ToolRegistry,
  componentResponse,
  createTool,
  errorResponse,
  mixedResponse,
  textResponse,
} from '@unido/core/tool.js';
import type { ToolContext } from '@unido/core/types.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

describe('createTool', () => {
  it('should create a tool with all properties', () => {
    const tool = createTool({
      name: 'test_tool',
      title: 'Test Tool',
      description: 'A test tool',
      input: z.object({ value: z.string() }),
      handler: async () => textResponse('test'),
    });

    expect(tool.name).toBe('test_tool');
    expect(tool.title).toBe('Test Tool');
    expect(tool.description).toBe('A test tool');
    expect(tool.inputSchema).toBeDefined();
    expect(tool.handler).toBeTypeOf('function');
  });

  it('should default title to name if not provided', () => {
    const tool = createTool({
      name: 'test_tool',
      description: 'A test tool',
      input: z.object({ value: z.string() }),
      handler: async () => textResponse('test'),
    });

    expect(tool.title).toBe('test_tool');
  });

  it('should preserve metadata', () => {
    const metadata = {
      openai: { outputTemplate: 'ui://test.html' },
    };

    const tool = createTool({
      name: 'test_tool',
      description: 'A test tool',
      input: z.object({ value: z.string() }),
      handler: async () => textResponse('test'),
      metadata,
    });

    expect(tool.metadata).toEqual(metadata);
  });

  it('should create handler that can be called', async () => {
    const tool = createTool({
      name: 'echo',
      description: 'Echo input',
      input: z.object({ message: z.string() }),
      handler: async ({ message }) => textResponse(message),
    });

    const context: ToolContext = {
      provider: 'openai',
      requestId: 'test-123',
    };

    const response = await tool.handler({ message: 'hello' }, context);
    expect(response.content).toHaveLength(1);
    expect(response.content[0]).toEqual({ type: 'text', text: 'hello' });
  });
});

describe('textResponse', () => {
  it('should create text-only response', () => {
    const response = textResponse('Hello, world!');

    expect(response.content).toHaveLength(1);
    expect(response.content[0]).toEqual({
      type: 'text',
      text: 'Hello, world!',
    });
    expect(response.component).toBeUndefined();
  });
});

describe('componentResponse', () => {
  it('should create component response without text', () => {
    const response = componentResponse('weather-card', { city: 'Tokyo' });

    expect(response.content).toHaveLength(0);
    expect(response.component).toEqual({
      type: 'weather-card',
      props: { city: 'Tokyo' },
    });
  });

  it('should create component response with text fallback', () => {
    const response = componentResponse('weather-card', { city: 'Tokyo' }, 'Weather in Tokyo');

    expect(response.content).toHaveLength(1);
    expect(response.content[0]).toEqual({
      type: 'text',
      text: 'Weather in Tokyo',
    });
    expect(response.component).toEqual({
      type: 'weather-card',
      props: { city: 'Tokyo' },
    });
  });
});

describe('mixedResponse', () => {
  it('should create response with both text and component', () => {
    const response = mixedResponse('Weather data retrieved', 'weather-card', { city: 'London' });

    expect(response.content).toHaveLength(1);
    expect(response.content[0]).toEqual({
      type: 'text',
      text: 'Weather data retrieved',
    });
    expect(response.component).toEqual({
      type: 'weather-card',
      props: { city: 'London' },
    });
  });
});

describe('errorResponse', () => {
  it('should create error response with code and message', () => {
    const response = errorResponse('INVALID_INPUT', 'Invalid city name');

    expect(response.content).toHaveLength(1);
    expect(response.content[0]).toEqual({
      type: 'error',
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid city name',
      },
    });
  });

  it('should include additional data if provided', () => {
    const response = errorResponse('VALIDATION_ERROR', 'Schema validation failed', {
      field: 'city',
      reason: 'required',
    });

    expect(response.content[0]).toEqual({
      type: 'error',
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Schema validation failed',
        data: {
          field: 'city',
          reason: 'required',
        },
      },
    });
  });
});

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('should register a tool', () => {
    const tool = createTool({
      name: 'test_tool',
      description: 'Test',
      input: z.object({}),
      handler: async () => textResponse('test'),
    });

    registry.register(tool);

    expect(registry.has('test_tool')).toBe(true);
    expect(registry.get('test_tool')).toBe(tool);
  });

  it('should throw error when registering duplicate tool', () => {
    const tool = createTool({
      name: 'duplicate',
      description: 'Test',
      input: z.object({}),
      handler: async () => textResponse('test'),
    });

    registry.register(tool);

    expect(() => registry.register(tool)).toThrow('Tool "duplicate" is already registered');
  });

  it('should get all registered tools', () => {
    const tool1 = createTool({
      name: 'tool1',
      description: 'Test 1',
      input: z.object({}),
      handler: async () => textResponse('test'),
    });

    const tool2 = createTool({
      name: 'tool2',
      description: 'Test 2',
      input: z.object({}),
      handler: async () => textResponse('test'),
    });

    registry.register(tool1);
    registry.register(tool2);

    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(tool1);
    expect(all).toContain(tool2);
  });

  it('should remove a tool', () => {
    const tool = createTool({
      name: 'removable',
      description: 'Test',
      input: z.object({}),
      handler: async () => textResponse('test'),
    });

    registry.register(tool);
    expect(registry.has('removable')).toBe(true);

    const removed = registry.remove('removable');
    expect(removed).toBe(true);
    expect(registry.has('removable')).toBe(false);
  });

  it('should return false when removing non-existent tool', () => {
    const removed = registry.remove('non_existent');
    expect(removed).toBe(false);
  });

  it('should clear all tools', () => {
    const tool1 = createTool({
      name: 'tool1',
      description: 'Test 1',
      input: z.object({}),
      handler: async () => textResponse('test'),
    });

    const tool2 = createTool({
      name: 'tool2',
      description: 'Test 2',
      input: z.object({}),
      handler: async () => textResponse('test'),
    });

    registry.register(tool1);
    registry.register(tool2);

    expect(registry.getAll()).toHaveLength(2);

    registry.clear();

    expect(registry.getAll()).toHaveLength(0);
  });

  it('should return undefined for non-existent tool', () => {
    const tool = registry.get('non_existent');
    expect(tool).toBeUndefined();
  });
});
