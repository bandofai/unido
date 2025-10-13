/**
 * Schema conversion for Claude provider
 * Converts Zod schemas to JSON Schema format for MCP
 */

import type { z } from 'zod';
import { zodToJsonSchema as zodToJson } from 'zod-to-json-schema';

/**
 * Convert Zod schema to JSON Schema for Claude/MCP
 *
 * Claude uses standard JSON Schema via MCP, so this is a straightforward conversion
 */
export function zodToJsonSchema(zodSchema: z.ZodType): Record<string, unknown> {
  const jsonSchema = zodToJson(zodSchema, {
    name: undefined,
    $refStrategy: 'none',
  });

  // Remove $schema property as MCP doesn't need it
  const { $schema, ...rest } = jsonSchema as Record<string, unknown> & {
    $schema?: string;
  };

  return rest;
}
