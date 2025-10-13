/**
 * Tests for Claude schema conversion
 */

import { zodToJsonSchema } from '@unido/provider-claude/schema.js';
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
    expect(result.properties).toHaveProperty('name');
    expect(result.properties).toHaveProperty('age');
  });

  it('should convert array schema', () => {
    const schema = z.array(z.string());
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'array');
    expect(result).toHaveProperty('items');
  });

  it('should handle optional fields', () => {
    const schema = z.object({
      required: z.string(),
      optional: z.string().optional(),
    });
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'object');
    expect(result.required).toContain('required');
    expect(result.required).not.toContain('optional');
  });

  it('should handle enum values', () => {
    const schema = z.enum(['light', 'dark', 'auto']);
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('enum');
    expect(result.enum).toContain('light');
    expect(result.enum).toContain('dark');
    expect(result.enum).toContain('auto');
  });

  it('should handle nested objects', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      settings: z.object({
        theme: z.enum(['light', 'dark']),
      }),
    });
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'object');
    expect(result.properties).toHaveProperty('user');
    expect(result.properties).toHaveProperty('settings');
  });

  it('should handle arrays of objects', () => {
    const schema = z.array(
      z.object({
        id: z.string(),
        value: z.number(),
      })
    );
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('type', 'array');
    expect(result.items).toHaveProperty('type', 'object');
  });

  it('should preserve descriptions', () => {
    const schema = z
      .object({
        name: z.string().describe('The user name'),
      })
      .describe('User object');
    const result = zodToJsonSchema(schema, 'TestSchema');

    expect(result).toHaveProperty('description', 'User object');
    expect(result.properties?.name).toHaveProperty('description', 'The user name');
  });
});
