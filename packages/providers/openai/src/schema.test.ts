/**
 * Tests for OpenAI schema conversion
 */

import { validateMcpSchema, zodToJsonSchema } from '@unido/provider-openai/schema.js';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

describe('zodToJsonSchema', () => {
  it('should convert string schema', () => {
    const schema = z.string();
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'string');
  });

  it('should convert number schema', () => {
    const schema = z.number();
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'number');
  });

  it('should convert boolean schema', () => {
    const schema = z.boolean();
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'boolean');
  });

  it('should convert object schema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'object');
    expect(result).toHaveProperty('properties');
  });

  it('should convert array schema', () => {
    const schema = z.array(z.string());
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'array');
  });

  it('should handle optional fields', () => {
    const schema = z.object({
      required: z.string(),
      optional: z.string().optional(),
    });
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'object');
    expect(result).toHaveProperty('properties');
  });

  it('should handle enum values', () => {
    const schema = z.enum(['option1', 'option2', 'option3']);
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('enum');
  });

  it('should handle nested objects', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string(),
      }),
    });
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'object');
    expect(result.properties).toHaveProperty('user');
  });
});

describe('validateMcpSchema', () => {
  it('should validate correct MCP schema', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    };

    expect(() => validateMcpSchema(schema)).not.toThrow();
  });

  it('should accept schema without required field', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    expect(() => validateMcpSchema(schema)).not.toThrow();
  });

  it('should accept nested schemas', () => {
    const schema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    };

    expect(() => validateMcpSchema(schema)).not.toThrow();
  });
});
