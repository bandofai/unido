/**
 * @bandofai/unido-dev
 * Development server and tools for Unido
 */

export { startDevServer } from './server.js';
export type { DevServerOptions } from './server.js';

export { startWidgetServer, watchComponents } from './widget-server.js';
export type { WidgetServerOptions, WidgetServer } from './widget-server.js';

// MCP client for widget loading
export { McpWidgetClient } from './mcp-client.js';
export type {
  WidgetInfo,
  ToolCallResult,
  ConnectionState,
  McpClientOptions,
  LoggerFunction,
} from './types/mcp-types.js';

// window.openai emulator for ChatGPT environment emulation
export { WindowOpenAIEmulator } from './window-openai-emulator.js';
export type { WindowOpenAIEmulatorOptions } from './window-openai-emulator.js';

// Widget iframe renderer component
export { WidgetIframeRenderer } from './components/WidgetIframeRenderer.js';
export type { WidgetIframeRendererProps } from './components/WidgetIframeRenderer.js';

// React hooks for window.openai API
export {
  useOpenAIGlobal,
  useDisplayMode,
  useTheme,
  useMaxHeight,
  useLocale,
  useToolInput,
  useToolOutput,
  useWidgetState,
  useToolCall,
  useSendFollowupTurn,
  useRequestDisplayMode,
  useOpenExternal,
  useOpenAIGlobals,
  useOpenAIAvailable,
} from './hooks/index.js';

// TypeScript types for window.openai API
export type {
  WindowOpenAI,
  DisplayMode,
  Theme,
  DisplayModeRequest,
  DisplayModeResponse,
  FollowupTurnRequest,
  ExternalLinkRequest,
  SetGlobalsEventDetail,
  ToolResponseEventDetail,
} from './types/window-openai.js';

export { hasWindowOpenAI, getWindowOpenAI } from './types/window-openai.js';

// Content Security Policy types and utilities
export type {
  CSPConfig,
  CSPSecurityLevel,
  CSPDirectives,
  CSPDirectiveValue,
} from './types/csp.js';

export {
  generateCSPNonce,
  buildCSPString,
  createCSPConfig,
  validateCSPConfig,
  addNonceToScripts,
  buildCSPHeader,
  CSP_PRESETS,
} from './types/csp.js';

// Toast notification system
export { ToastProvider, useToast } from './utils/toast.js';
