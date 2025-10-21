/**
 * TypeScript definitions for the OpenAI Apps SDK `window.openai` API
 *
 * This global object is injected by ChatGPT into sandboxed component iframes,
 * enabling bidirectional communication between your widget and the conversation.
 *
 * @see https://developers.openai.com/apps-sdk/reference
 * @version OpenAI Apps SDK Preview (October 2024)
 */

/**
 * Display mode for the widget within ChatGPT
 */
export type DisplayMode = 'inline' | 'pip' | 'fullscreen';

/**
 * Theme mode in ChatGPT
 */
export type Theme = 'light' | 'dark';

/**
 * Request to change display mode
 */
export interface DisplayModeRequest {
  mode: DisplayMode;
}

/**
 * Response from display mode change request
 * Note: The granted mode may differ from the requested mode
 */
export interface DisplayModeResponse {
  mode: DisplayMode;
}

/**
 * Follow-up message to insert into the conversation
 */
export interface FollowupTurnRequest {
  prompt: string;
}

/**
 * External link to open
 */
export interface ExternalLinkRequest {
  href: string;
}

/**
 * Event detail for openai:set_globals window event
 */
export interface SetGlobalsEventDetail {
  displayMode?: DisplayMode;
  maxHeight?: number;
  toolInput?: unknown;
  toolOutput?: unknown;
  widgetState?: Record<string, unknown>;
  locale?: string;
  theme?: Theme;
}

/**
 * Event detail for openai:tool_response window event
 */
export interface ToolResponseEventDetail {
  name: string;
  args: unknown;
  result: unknown;
}

/**
 * Main window.openai API interface
 *
 * This object provides methods for components to exchange data with ChatGPT.
 * Components run in a sandboxed iframe, and the host injects this global.
 */
export interface WindowOpenAI {
  /**
   * Arguments ChatGPT provided to the tool call.
   * Read-only. Use this to access the input parameters passed to your tool.
   *
   * @example
   * ```typescript
   * const toolInput = window.openai?.toolInput as { city?: string } | undefined;
   * const city = toolInput?.city ?? 'San Francisco';
   * ```
   */
  readonly toolInput?: unknown;

  /**
   * The JSON your tool returned in the MCP response.
   * Read-only. Use as initial render data for your component.
   * This corresponds to the `structuredContent` field in your tool's response.
   *
   * @example
   * ```typescript
   * interface WeatherData {
   *   temperature: number;
   *   condition: string;
   * }
   * const toolOutput = window.openai?.toolOutput as WeatherData | undefined;
   * ```
   */
  readonly toolOutput?: unknown;

  /**
   * Persisted component state from prior renders.
   * Read-only. Check this first and fall back to `toolOutput`.
   * State persists across widget re-renders in the same conversation.
   *
   * @example
   * ```typescript
   * const initialState = window.openai?.widgetState ?? window.openai?.toolOutput ?? {};
   * ```
   */
  readonly widgetState?: Record<string, unknown>;

  /**
   * Persist state back to the host.
   * Returns a promise that resolves when the state is stored.
   * Use this to save user interactions, preferences, or drafts.
   *
   * @param state - State object to persist
   * @returns Promise that resolves when state is saved
   *
   * @example
   * ```typescript
   * await window.openai?.setWidgetState?.({
   *   favorites: ['item1', 'item2'],
   *   lastUpdated: Date.now()
   * });
   * ```
   */
  setWidgetState?(state: Record<string, unknown>): Promise<void>;

  /**
   * Invoke another tool exposed by your MCP server.
   * Useful for in-component actions such as refreshing data, moving a task, etc.
   * Requires `openai/widgetAccessible: true` in tool metadata.
   *
   * @param name - Name of the tool to call
   * @param args - Arguments to pass to the tool
   * @returns Promise with the tool's response
   *
   * @example
   * ```typescript
   * const response = await window.openai?.callTool?.('refresh_weather', {
   *   city: 'Portland'
   * });
   * console.log('Tool result:', response?.result);
   * ```
   */
  callTool?(name: string, args: unknown): Promise<{ result: unknown }>;

  /**
   * Insert a message into the conversation.
   * Often used after a user clicks a button inside the component.
   * This adds a new user message to the chat.
   *
   * @param request - Follow-up message request
   * @returns Promise that resolves when message is sent
   *
   * @example
   * ```typescript
   * await window.openai?.sendFollowupTurn?.({
   *   prompt: 'Show me more pizza places nearby'
   * });
   * ```
   */
  sendFollowupTurn?(request: FollowupTurnRequest): Promise<void>;

  /**
   * Request a layout change (inline, pip, fullscreen).
   * The host decides whether to honor the request.
   * Returns the granted mode, which may differ from the request.
   * Note: On mobile, PiP may be coerced to fullscreen.
   *
   * @param request - Display mode request
   * @returns Promise with the granted display mode
   *
   * @example
   * ```typescript
   * const result = await window.openai?.requestDisplayMode?.({
   *   mode: 'fullscreen'
   * });
   * console.log('Granted mode:', result?.mode);
   * ```
   */
  requestDisplayMode?(request: DisplayModeRequest): Promise<DisplayModeResponse>;

  /**
   * Open an external link.
   * Opens the URL in a new tab/window.
   *
   * @param request - External link request
   *
   * @example
   * ```typescript
   * window.openai?.openExternal?.({
   *   href: 'https://example.com/menu'
   * });
   * ```
   */
  openExternal?(request: ExternalLinkRequest): void;

  /**
   * Current display mode (inline, pip, or fullscreen).
   * Read-only. Listen to `openai:set_globals` event for changes.
   *
   * @example
   * ```typescript
   * const mode = window.openai?.displayMode;
   * const isFullscreen = mode === 'fullscreen';
   * ```
   */
  readonly displayMode?: DisplayMode;

  /**
   * Maximum height constraint for the widget in pixels.
   * Read-only. Use this to constrain your component's layout.
   * Listen to `openai:set_globals` event for changes.
   *
   * @example
   * ```typescript
   * const maxHeight = window.openai?.maxHeight;
   * return <div style={{ maxHeight: `${maxHeight}px`, overflow: 'auto' }}>...</div>;
   * ```
   */
  readonly maxHeight?: number;

  /**
   * Locale string for the active user (BCP 47 format).
   * Read-only. Use it to load translations, format numbers, and surface localized copy.
   *
   * @example
   * ```typescript
   * const locale = window.openai?.locale ?? 'en-US';
   * const formatter = new Intl.NumberFormat(locale);
   * ```
   */
  readonly locale?: string;

  /**
   * Current theme (light or dark).
   * Read-only. Use this to adapt your component's styling.
   * Listen to `openai:set_globals` event for changes.
   *
   * @example
   * ```typescript
   * const theme = window.openai?.theme ?? 'light';
   * return <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>...</div>;
   * ```
   */
  readonly theme?: Theme;
}

/**
 * Legacy compatibility interfaces
 * Note: New components should use `window.openai` instead
 */
export interface WindowOAI {
  widget?: {
    setState?: (state: Record<string, unknown>) => void;
  };
}

export interface WindowWebPlus {
  // Legacy interface, details not documented
  [key: string]: unknown;
}

/**
 * Window extensions for OpenAI Apps SDK
 */
declare global {
  interface Window {
    /**
     * Primary OpenAI Apps SDK API
     * Available in components rendered by ChatGPT
     */
    openai?: WindowOpenAI;

    /**
     * Legacy compatibility (deprecated)
     * Use window.openai instead
     */
    oai?: WindowOAI;

    /**
     * Legacy compatibility (deprecated)
     * Use window.openai instead
     */
    webplus?: WindowWebPlus;
  }

  /**
   * Custom event for globals updates
   * Dispatched when displayMode, maxHeight, toolOutput, widgetState, etc. change
   */
  interface WindowEventMap {
    'openai:set_globals': CustomEvent<SetGlobalsEventDetail>;
    'openai:tool_response': CustomEvent<ToolResponseEventDetail>;
  }
}

/**
 * Type guard to check if window.openai is available
 *
 * @example
 * ```typescript
 * if (hasWindowOpenAI()) {
 *   const data = window.openai.toolOutput;
 * }
 * ```
 */
export function hasWindowOpenAI(): boolean {
  return typeof window !== 'undefined' && window.openai !== undefined;
}

/**
 * Safely get window.openai or return undefined
 * Useful for SSR/SSG environments
 *
 * @example
 * ```typescript
 * const openai = getWindowOpenAI();
 * const theme = openai?.theme ?? 'light';
 * ```
 */
export function getWindowOpenAI(): WindowOpenAI | undefined {
  return typeof window !== 'undefined' ? window.openai : undefined;
}
