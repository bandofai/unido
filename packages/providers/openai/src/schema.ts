/**
 * Zod to JSON Schema conversion for OpenAI MCP
 */

import type { z } from 'zod';
import { zodToJsonSchema as zodToJsonSchemaLib } from 'zod-to-json-schema';

/**
 * Convert Zod schema to MCP-compatible JSON Schema
 *
 * OpenAI MCP expects JSON Schema format for tool inputs.
 * This function converts Zod schemas to the proper format.
 */
export function zodToJsonSchema(zodSchema: z.ZodType): Record<string, unknown> {
  const jsonSchema = zodToJsonSchemaLib(zodSchema, {
    // MCP-specific options
    target: 'jsonSchema7',
    $refStrategy: 'none', // Inline all schemas
  });

  // Remove $schema property as MCP doesn't need it
  const { $schema, ...rest } = jsonSchema as Record<string, unknown> & {
    $schema?: string;
  };

  return rest;
}

/**
 * Validate that JSON Schema is MCP-compatible
 */
export function validateMcpSchema(
  schema: Record<string, unknown>
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  // MCP schemas must have a type
  if (!schema.type) {
    errors.push('Schema must have a "type" property');
  }

  // For object types, properties should be defined
  if (schema.type === 'object' && !schema.properties) {
    errors.push('Object schemas should have "properties" defined');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
