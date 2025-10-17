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

export interface ComponentResponseOptions {
  /**
   * Loading component type
   * @default 'loading-spinner'
   */
  loadingComponent?: string;

  /**
   * Props for the loading component
   */
  loadingProps?: Record<string, unknown>;

  /**
   * Error component type
   * @default 'error-card'
   */
  errorComponent?: string;

  /**
   * Props for the error component
   */
  errorProps?: Record<string, unknown>;
}

/**
 * Create a response with a component
 */
export function componentResponse(
  componentType: string,
  props: Record<string, unknown>,
  textFallback?: string,
  options?: ComponentResponseOptions
): UniversalResponse {
  const content = textFallback ? [{ type: 'text' as const, text: textFallback }] : [];

  return {
    content,
    component: {
      type: componentType,
      props,
      loadingState: options?.loadingComponent
        ? {
            component: options.loadingComponent,
            props: options.loadingProps,
          }
        : undefined,
      errorState: options?.errorComponent
        ? {
            component: options.errorComponent,
            props: options.errorProps,
          }
        : undefined,
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

/**
 * Create a loading response
 *
 * @example
 * ```typescript
 * // Simple loading spinner
 * return loadingResponse();
 *
 * // Loading with message
 * return loadingResponse('loading-spinner', { message: 'Fetching weather data...' });
 *
 * // Custom loading component
 * return loadingResponse('weather-card-loading', { city: 'Portland' });
 * ```
 */
export function loadingResponse(
  componentType = 'loading-spinner',
  props?: Record<string, unknown>
): UniversalResponse {
  return {
    content: [{ type: 'text', text: 'Loading...' }],
    component: {
      type: componentType,
      props,
    },
  };
}

/**
 * Create an error response with component
 *
 * @example
 * ```typescript
 * // Basic error
 * return errorComponentResponse('Failed to fetch weather data');
 *
 * // Error with details
 * return errorComponentResponse(
 *   'Network Error',
 *   'Could not connect to weather service',
 *   'ERR_NETWORK'
 * );
 *
 * // Custom error component
 * return errorComponentResponse(
 *   'Failed to load',
 *   'weather-card-error',
 *   { city: 'Portland', error: 'API timeout' }
 * );
 * ```
 */
export function errorComponentResponse(
  message: string,
  componentType = 'error-card',
  props?: Record<string, unknown>
): UniversalResponse {
  return {
    content: [
      {
        type: 'error',
        error: { code: 'ERROR', message },
      },
    ],
    component: {
      type: componentType,
      props: {
        message,
        ...props,
      },
    },
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
