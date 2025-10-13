/**
 * Tests for schema system
 */

import {
  createSchema,
  describe as describeSchema,
  getProviderSchema,
  validateInput,
} from '@unido/core/schema.js';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

describe('createSchema', () => {
  it('should create a universal schema from Zod schema', () => {
    const zodSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const schema = createSchema(zodSchema);

    expect(schema.zodSchema).toBe(zodSchema);
    expect(schema._cache).toBeDefined();
    expect(schema._cache).toBeInstanceOf(Map);
  });
});

describe('validateInput', () => {
  it('should validate correct input', () => {
    const schema = createSchema(
      z.object({
        name: z.string(),
        age: z.number(),
      })
    );

    const result = validateInput(schema, {
      name: 'John',
      age: 30,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 30 });
    }
  });

  it('should reject invalid input', () => {
    const schema = createSchema(
      z.object({
        name: z.string(),
        age: z.number(),
      })
    );

    const result = validateInput(schema, {
      name: 'John',
      age: 'thirty', // Invalid: should be number
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.errors).toHaveLength(1);
      expect(result.error.errors[0]?.path).toEqual(['age']);
    }
  });

  it('should handle missing required fields', () => {
    const schema = createSchema(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    );

    const result = validateInput(schema, {
      name: 'John',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.path).toEqual(['email']);
    }
  });

  it('should handle default values', () => {
    const schema = createSchema(
      z.object({
        name: z.string(),
        status: z.string().default('active'),
      })
    );

    const result = validateInput(schema, {
      name: 'John',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });

  it('should handle enums', () => {
    const schema = createSchema(
      z.object({
        role: z.enum(['admin', 'user', 'guest']),
      })
    );

    const validResult = validateInput(schema, { role: 'admin' });
    expect(validResult.success).toBe(true);

    const invalidResult = validateInput(schema, { role: 'superuser' });
    expect(invalidResult.success).toBe(false);
  });

  it('should handle nested objects', () => {
    const schema = createSchema(
      z.object({
        user: z.object({
          name: z.string(),
          address: z.object({
            city: z.string(),
            country: z.string(),
          }),
        }),
      })
    );

    const result = validateInput(schema, {
      user: {
        name: 'John',
        address: {
          city: 'Tokyo',
          country: 'Japan',
        },
      },
    });

    expect(result.success).toBe(true);
  });
});

describe('getProviderSchema', () => {
  it('should convert schema using provided converter', () => {
    const schema = createSchema(
      z.object({
        city: z.string(),
      })
    );

    const converter = (_zodSchema: z.ZodType) => ({
      type: 'object',
      properties: {
        city: { type: 'string' },
      },
    });

    const jsonSchema = getProviderSchema(schema, 'openai', converter);

    expect(jsonSchema).toEqual({
      type: 'object',
      properties: {
        city: { type: 'string' },
      },
    });
  });

  it('should cache converted schema', () => {
    const schema = createSchema(
      z.object({
        value: z.number(),
      })
    );

    let conversionCount = 0;
    const converter = (_zodSchema: z.ZodType) => {
      conversionCount++;
      return { type: 'object' };
    };

    // First call - should convert
    getProviderSchema(schema, 'openai', converter);
    expect(conversionCount).toBe(1);

    // Second call - should use cache
    getProviderSchema(schema, 'openai', converter);
    expect(conversionCount).toBe(1); // Still 1, not incremented

    // Different provider - should convert again
    getProviderSchema(schema, 'claude', converter);
    expect(conversionCount).toBe(2);
  });

  it('should handle multiple providers', () => {
    const schema = createSchema(z.object({ id: z.string() }));

    const openaiConverter = () => ({ provider: 'openai', format: 'json' });
    const claudeConverter = () => ({ provider: 'claude', format: 'json' });

    const openaiSchema = getProviderSchema(schema, 'openai', openaiConverter);
    const claudeSchema = getProviderSchema(schema, 'claude', claudeConverter);

    expect(openaiSchema).toEqual({ provider: 'openai', format: 'json' });
    expect(claudeSchema).toEqual({ provider: 'claude', format: 'json' });

    // Both should be cached
    expect(schema._cache?.has('openai')).toBe(true);
    expect(schema._cache?.has('claude')).toBe(true);
  });
});

describe('describeSchema', () => {
  it('should add description to schema', () => {
    const schema = z.string();
    const described = describeSchema(schema, 'User name');

    expect(described.description).toBe('User name');
  });
});

describe('Complex schema scenarios', () => {
  it('should handle optional fields', () => {
    const schema = createSchema(
      z.object({
        required: z.string(),
        optional: z.string().optional(),
      })
    );

    const withOptional = validateInput(schema, {
      required: 'value',
      optional: 'present',
    });
    expect(withOptional.success).toBe(true);

    const withoutOptional = validateInput(schema, {
      required: 'value',
    });
    expect(withoutOptional.success).toBe(true);
  });

  it('should handle arrays', () => {
    const schema = createSchema(
      z.object({
        tags: z.array(z.string()),
      })
    );

    const result = validateInput(schema, {
      tags: ['javascript', 'typescript', 'node'],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toHaveLength(3);
    }
  });

  it('should handle unions', () => {
    const schema = createSchema(
      z.object({
        value: z.union([z.string(), z.number()]),
      })
    );

    const stringResult = validateInput(schema, { value: 'hello' });
    expect(stringResult.success).toBe(true);

    const numberResult = validateInput(schema, { value: 42 });
    expect(numberResult.success).toBe(true);

    const invalidResult = validateInput(schema, { value: true });
    expect(invalidResult.success).toBe(false);
  });

  it('should handle custom refinements', () => {
    const schema = createSchema(
      z.object({
        age: z.number().min(0).max(120),
      })
    );

    const validResult = validateInput(schema, { age: 25 });
    expect(validResult.success).toBe(true);

    const tooOld = validateInput(schema, { age: 150 });
    expect(tooOld.success).toBe(false);

    const negative = validateInput(schema, { age: -5 });
    expect(negative.success).toBe(false);
  });
});
