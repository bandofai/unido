/**
 * Universal tool system for Unido
 */

import type {
  ProviderMetadata,
  ToolHandler,
  UniversalResponse,
  UniversalTool,
} from '@bandofai/unido-core/types.js';
import type { z } from 'zod';

// ============================================================================
// Tool Builder
// ============================================================================

export interface ToolDefinition<TInput = unknown> {
  /**
   * Tool name (machine-readable identifier)
   */
  name: string;

  /**
   * Human-readable title (optional, defaults to name)
   */
  title?: string;

  /**
   * Description for the AI
   */
  description: string;

  /**
   * Input schema (Zod schema)
   */
  input: z.ZodType<TInput>;

  /**
   * Tool handler
   */
  handler: ToolHandler<TInput>;

  /**
   * Provider-specific metadata
   */
  metadata?: ProviderMetadata;
}

/**
 * Create a universal tool
 *
 * @example
 * ```typescript
 * const weatherTool = createTool({
 *   name: 'get_weather',
 *   description: 'Get weather for a city',
 *   input: z.object({
 *     city: z.string(),
 *     units: z.enum(['celsius', 'fahrenheit']).default('celsius')
 *   }),
 *   handler: async ({ city, units }) => {
 *     const data = await getWeather(city, units);
 *     return {
 *       content: [{ type: 'text', text: `Weather in ${city}: ${data.temp}°` }],
 *       component: {
 *         type: 'weather-card',
 *         props: data
 *       }
 *     };
 *   }
 * });
 * ```
 */
export function createTool<TInput = unknown>(
  definition: ToolDefinition<TInput>
): UniversalTool<TInput> {
  return {
    name: definition.name,
    title: definition.title ?? definition.name,
    description: definition.description,
    inputSchema: definition.input,
    handler: definition.handler,
    metadata: definition.metadata,
  };
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Create a text-only response
 */
export function textResponse(text: string): UniversalResponse {
  return {
    content: [{ type: 'text', text }],
  };
}

/**
 * Create a response with a component
 */
export function componentResponse(
  componentType: string,
  props: Record<string, unknown>,
  textFallback?: string
): UniversalResponse {
  const content = textFallback ? [{ type: 'text' as const, text: textFallback }] : [];

  return {
    content,
    component: {
      type: componentType,
      props,
    },
  };
}

/**
 * Create a mixed response (text + component)
 */
export function mixedResponse(
  text: string,
  componentType: string,
  props: Record<string, unknown>
): UniversalResponse {
  return {
    content: [{ type: 'text', text }],
    component: {
      type: componentType,
      props,
    },
  };
}

/**
 * Create an error response
 */
export function errorResponse(code: string, message: string, data?: unknown): UniversalResponse {
  return {
    content: [
      {
        type: 'error',
        error: { code, message, data },
      },
    ],
  };
}

// ============================================================================
// Tool Registry
// ============================================================================

export class ToolRegistry {
  private tools = new Map<string, UniversalTool>();

  /**
   * Register a tool
   */
  register(tool: UniversalTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered`);
    }

    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name
   */
  get(name: string): UniversalTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): UniversalTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Remove a tool
   */
  remove(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
  }
}
