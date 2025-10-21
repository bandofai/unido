/**
 * window.openai API Emulator
 *
 * Emulates the ChatGPT window.openai API for local widget development.
 * Provides the same interface that widgets receive when running in ChatGPT.
 */

import type { McpWidgetClient } from './mcp-client.js';
import type {
  DisplayMode,
  DisplayModeRequest,
  DisplayModeResponse,
  ExternalLinkRequest,
  FollowupTurnRequest,
  SetGlobalsEventDetail,
  Theme,
  ToolResponseEventDetail,
  WindowOpenAI,
} from './types/window-openai.js';

/**
 * Options for creating the window.openai emulator
 */
export interface WindowOpenAIEmulatorOptions {
  /**
   * MCP client for tool calls
   */
  mcpClient: McpWidgetClient;

  /**
   * Tool input (arguments passed to the tool)
   */
  toolInput?: unknown;

  /**
   * Tool output (structuredContent from tool response)
   */
  toolOutput?: unknown;

  /**
   * Initial widget state
   */
  initialWidgetState?: Record<string, unknown>;

  /**
   * Initial display mode
   * @default 'inline'
   */
  displayMode?: DisplayMode;

  /**
   * Initial theme
   * @default 'light'
   */
  theme?: Theme;

  /**
   * Initial max height in pixels
   * @default 600
   */
  maxHeight?: number;

  /**
   * Locale string (BCP 47 format)
   * @default 'en-US'
   */
  locale?: string;

  /**
   * Callback when widget state changes
   */
  onStateChange?: (state: Record<string, unknown>) => void;

  /**
   * Callback when display mode change is requested
   */
  onDisplayModeRequest?: (mode: DisplayMode) => DisplayMode;

  /**
   * Callback when external link is opened
   */
  onOpenExternal?: (href: string) => void;

  /**
   * Callback when follow-up turn is requested
   */
  onFollowupTurn?: (prompt: string) => void;

  /**
   * Target window to inject API into
   * If not provided, creates a mock API object
   */
  targetWindow?: Window;
}

/**
 * window.openai API Emulator
 *
 * Creates a complete implementation of the window.openai API
 * that bridges to an MCP client for tool calls and provides
 * all the expected properties and methods.
 *
 * @example
 * ```typescript
 * const emulator = new WindowOpenAIEmulator({
 *   mcpClient,
 *   toolOutput: { city: 'Portland', temperature: 72 },
 *   displayMode: 'inline'
 * });
 *
 * // Inject into iframe
 * emulator.injectIntoWindow(iframe.contentWindow);
 *
 * // Or get API object
 * const api = emulator.getAPI();
 * ```
 */
export class WindowOpenAIEmulator {
  private mcpClient: McpWidgetClient;
  private toolInput?: unknown;
  private toolOutput?: unknown;
  private widgetState: Record<string, unknown>;
  private currentDisplayMode: DisplayMode;
  private currentTheme: Theme;
  private currentMaxHeight: number;
  private currentLocale: string;
  private targetWindow?: Window;
  private onStateChange?: (state: Record<string, unknown>) => void;
  private onDisplayModeRequest?: (mode: DisplayMode) => DisplayMode;
  private onOpenExternal?: (href: string) => void;
  private onFollowupTurn?: (prompt: string) => void;

  constructor(options: WindowOpenAIEmulatorOptions) {
    this.mcpClient = options.mcpClient;
    this.toolInput = options.toolInput;
    this.toolOutput = options.toolOutput;
    this.widgetState = options.initialWidgetState ?? {};
    this.currentDisplayMode = options.displayMode ?? 'inline';
    this.currentTheme = options.theme ?? 'light';
    this.currentMaxHeight = options.maxHeight ?? 600;
    this.currentLocale = options.locale ?? 'en-US';
    this.targetWindow = options.targetWindow;
    this.onStateChange = options.onStateChange;
    this.onDisplayModeRequest = options.onDisplayModeRequest;
    this.onOpenExternal = options.onOpenExternal;
    this.onFollowupTurn = options.onFollowupTurn;
  }

  /**
   * Deep clone an object to prevent mutations
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as T;
    if (obj instanceof Object) {
      const cloned = {} as T;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }

  /**
   * Get the window.openai API object
   *
   * Returns a complete implementation of the WindowOpenAI interface
   * that can be assigned to window.openai or inspected.
   */
  getAPI(): WindowOpenAI {
    const api: WindowOpenAI = {
      // Read-only properties - deep cloned to prevent mutations
      toolInput: this.deepClone(this.toolInput),
      toolOutput: this.deepClone(this.toolOutput),
      widgetState: this.deepClone(this.widgetState),
      displayMode: this.currentDisplayMode,
      maxHeight: this.currentMaxHeight,
      locale: this.currentLocale,
      theme: this.currentTheme,

      // Methods
      setWidgetState: async (state: Record<string, unknown>): Promise<void> => {
        // Deep clone to prevent external mutations
        this.widgetState = this.deepClone(state);
        this.onStateChange?.(this.deepClone(this.widgetState));
        this.dispatchSetGlobalsEvent({ widgetState: this.deepClone(this.widgetState) });
      },

      callTool: async (name: string, args: unknown): Promise<{ result: unknown }> => {
        try {
          const result = await this.mcpClient.callTool(name, args);

          // Dispatch tool response event
          this.dispatchToolResponseEvent(name, args, result.result);

          if (result.isError) {
            throw new Error(`Tool call failed: ${JSON.stringify(result.result)}`);
          }

          return { result: result.result };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Tool call "${name}" failed: ${errorMessage}`);
        }
      },

      sendFollowupTurn: async (request: FollowupTurnRequest): Promise<void> => {
        this.onFollowupTurn?.(request.prompt);
      },

      requestDisplayMode: async (request: DisplayModeRequest): Promise<DisplayModeResponse> => {
        const grantedMode = this.onDisplayModeRequest?.(request.mode) ?? request.mode;
        this.currentDisplayMode = grantedMode;
        this.dispatchSetGlobalsEvent({ displayMode: grantedMode });
        return { mode: grantedMode };
      },

      openExternal: (request: ExternalLinkRequest): void => {
        this.onOpenExternal?.(request.href);
      },
    };

    return api;
  }

  /**
   * Inject the window.openai API into a target window
   *
   * This should be called BEFORE the widget HTML is loaded
   * to ensure the API is available when widget scripts execute.
   *
   * @param targetWindow - The window object to inject into (e.g., iframe.contentWindow)
   */
  injectIntoWindow(targetWindow: Window): void {
    this.targetWindow = targetWindow;

    // Inject the API
    (targetWindow as Window & { openai?: WindowOpenAI }).openai = this.getAPI();

    // Also set up event dispatching on the target window
    this.targetWindow = targetWindow;
  }

  /**
   * Update tool output and notify widget
   *
   * @param toolOutput - New tool output data
   */
  setToolOutput(toolOutput: unknown): void {
    this.toolOutput = toolOutput;
    this.dispatchSetGlobalsEvent({ toolOutput });
  }

  /**
   * Update tool input
   *
   * @param toolInput - New tool input data
   */
  setToolInput(toolInput: unknown): void {
    this.toolInput = toolInput;
    this.dispatchSetGlobalsEvent({ toolInput });
  }

  /**
   * Update display mode
   *
   * @param mode - New display mode
   */
  setDisplayMode(mode: DisplayMode): void {
    this.currentDisplayMode = mode;
    this.dispatchSetGlobalsEvent({ displayMode: mode });
  }

  /**
   * Update theme
   *
   * @param theme - New theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.dispatchSetGlobalsEvent({ theme });
  }

  /**
   * Update max height
   *
   * @param maxHeight - New max height in pixels
   */
  setMaxHeight(maxHeight: number): void {
    this.currentMaxHeight = maxHeight;
    this.dispatchSetGlobalsEvent({ maxHeight });
  }

  /**
   * Get current widget state
   */
  getWidgetState(): Record<string, unknown> {
    return { ...this.widgetState };
  }

  /**
   * Get current display mode
   */
  getDisplayMode(): DisplayMode {
    return this.currentDisplayMode;
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Dispatch openai:set_globals event
   *
   * @param detail - Event detail with updated properties
   */
  private dispatchSetGlobalsEvent(detail: SetGlobalsEventDetail): void {
    if (!this.targetWindow) return;

    const event = new CustomEvent('openai:set_globals', {
      detail,
      bubbles: true,
      cancelable: false,
    });

    this.targetWindow.dispatchEvent(event);
  }

  /**
   * Dispatch openai:tool_response event
   *
   * @param name - Tool name
   * @param args - Tool arguments
   * @param result - Tool result
   */
  private dispatchToolResponseEvent(name: string, args: unknown, result: unknown): void {
    if (!this.targetWindow) return;

    const event = new CustomEvent<ToolResponseEventDetail>('openai:tool_response', {
      detail: { name, args, result },
      bubbles: true,
      cancelable: false,
    });

    this.targetWindow.dispatchEvent(event);
  }

  /**
   * Clean up and remove API from target window
   */
  cleanup(): void {
    if (this.targetWindow) {
      delete (this.targetWindow as Window & { openai?: WindowOpenAI }).openai;
      this.targetWindow = undefined;
    }
  }
}
