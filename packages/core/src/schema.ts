/**
 * Universal schema system for Unido
 * Converts Zod schemas to provider-specific formats (JSON Schema for MCP)
 */

import type { z } from 'zod';

// ============================================================================
// Universal Schema
// ============================================================================

export interface UniversalSchema<T = unknown> {
  /**
   * Original Zod schema
   */
  zodSchema: z.ZodType<T>;

  /**
   * Cache for provider-specific schema conversions
   * Always initialized to avoid null checks
   */
  _cache: Map<string, unknown>;
}

/**
 * Create a universal schema from a Zod schema
 */
export function createSchema<T>(zodSchema: z.ZodType<T>): UniversalSchema<T> {
  return {
    zodSchema,
    _cache: new Map(),
  };
}

/**
 * Validate input against a universal schema
 */
export function validateInput<T>(
  schema: UniversalSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.zodSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Get or compute provider-specific schema
 *
 * This function caches the conversion to avoid redundant work.
 */
export function getProviderSchema<TSchema = unknown>(
  schema: UniversalSchema,
  provider: string,
  converter: (zodSchema: z.ZodType) => TSchema
): TSchema {
  // Check cache first (cache is always initialized)
  if (schema._cache.has(provider)) {
    return schema._cache.get(provider) as TSchema;
  }

  // Convert and cache
  const providerSchema = converter(schema.zodSchema);
  schema._cache.set(provider, providerSchema);

  return providerSchema;
}

// ============================================================================
// Zod to JSON Schema Conversion (for MCP)
// ============================================================================

/**
 * Convert a Zod schema to JSON Schema format
 *
 * This is a simplified conversion. For production, we'll use zod-to-json-schema.
 * This version handles common cases needed for MCP.
 */
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // For now, we'll rely on the provider packages to do the actual conversion
  // using zod-to-json-schema library. This is just the interface.

  // This function will be implemented more fully in the provider packages
  // where we have access to zod-to-json-schema

  return {
    type: 'object',
    description: schema.description ?? '',
  };
}

// ============================================================================
// Schema Helpers
// ============================================================================

/**
 * Helper to create a schema with description
 */
export function describe<T>(schema: z.ZodType<T>, description: string): z.ZodType<T> {
  return schema.describe(description);
}

/**
 * Type helper to infer Zod schema type
 */
export type InferSchema<T extends UniversalSchema> = T extends UniversalSchema<infer U> ? U : never;
