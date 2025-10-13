/**
 * @unido/core
 * Unido - Provider-agnostic TypeScript framework for AI applications
 */

// Main API
export { createApp, Unido } from '@unido/core/app.js';
export type { AppConfig } from '@unido/core/app.js';

// Tool system
export { createTool, ToolRegistry } from '@unido/core/tool.js';
export {
  textResponse,
  componentResponse,
  mixedResponse,
  errorResponse,
} from '@unido/core/tool.js';
export type { ToolDefinition } from '@unido/core/tool.js';

// Schema system
export { createSchema, validateInput, getProviderSchema } from '@unido/core/schema.js';
export type { UniversalSchema, InferSchema } from '@unido/core/schema.js';

// Component system
export { ComponentRegistry, defineComponent } from '@unido/core/component.js';
export type {
  ComponentDefinition,
  ComponentBundle,
  ComponentMetadata,
} from '@unido/core/component.js';

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
  ClaudeMetadata,
  ProviderCapabilities,
  ServerConfig,
  ProviderConfig,
} from '@unido/core/types.js';
