/**
 * @bandofai/unido-core
 * Unido - Provider-agnostic TypeScript framework for AI applications
 */

// Main API
export { createApp, Unido } from '@bandofai/unido-core/app.js';
export type { AppConfig } from '@bandofai/unido-core/app.js';

// Tool system
export { createTool, ToolRegistry } from '@bandofai/unido-core/tool.js';
export {
  textResponse,
  componentResponse,
  mixedResponse,
  errorResponse,
} from '@bandofai/unido-core/tool.js';
export type { ToolDefinition } from '@bandofai/unido-core/tool.js';

// Schema system
export { createSchema, validateInput, getProviderSchema } from '@bandofai/unido-core/schema.js';
export type { UniversalSchema, InferSchema } from '@bandofai/unido-core/schema.js';

// Component system
export { ComponentRegistry, defineComponent } from '@bandofai/unido-core/component.js';
export type {
  ComponentDefinition,
  ComponentBundle,
  ComponentMetadata,
} from '@bandofai/unido-core/types.js';

// Core types
export type {
  ProviderName,
  UniversalContent,
  TextContent,
  ImageContent,
  ResourceContent,
  ErrorContent,
  ComponentReference,
  ToolContext,
  UniversalResponse,
  UniversalTool,
  ToolHandler,
  ProviderMetadata,
  OpenAIMetadata,
  ProviderCapabilities,
  ServerConfig,
  ProviderConfig,
} from '@bandofai/unido-core/types.js';
