/**
 * Widget Iframe Renderer
 *
 * React component that renders a widget in an isolated iframe
 * with the window.openai API injected, mimicking ChatGPT's environment.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { McpWidgetClient } from '../mcp-client.js';
import { WindowOpenAIEmulator } from '../window-openai-emulator.js';
import type { DisplayMode, Theme } from '../types/window-openai.js';
import type { CSPConfig, CSPSecurityLevel } from '../types/csp.js';
import {
  createCSPConfig,
  validateCSPConfig,
  addNonceToScripts,
} from '../types/csp.js';

/**
 * Props for WidgetIframeRenderer component
 */
export interface WidgetIframeRendererProps {
  /**
   * MCP client for loading widgets and making tool calls
   */
  mcpClient: McpWidgetClient;

  /**
   * Widget type to render (e.g., 'weather-card')
   */
  widgetType: string;

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
   * Display mode
   * @default 'inline'
   */
  displayMode?: DisplayMode;

  /**
   * Theme
   * @default 'light'
   */
  theme?: Theme;

  /**
   * Max height in pixels
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
   * Callback when widget loading completes
   */
  onLoad?: () => void;

  /**
   * Callback when widget loading fails
   */
  onError?: (error: Error) => void;

  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;

  /**
   * Custom error component
   */
  errorComponent?: (error: Error) => React.ReactNode;

  /**
   * Iframe sandbox permissions
   * @default 'allow-scripts allow-same-origin'
   */
  sandbox?: string;

  /**
   * Custom iframe styles
   */
  iframeStyle?: React.CSSProperties;

  /**
   * Custom container styles
   */
  containerStyle?: React.CSSProperties;

  /**
   * CSS class name for container
   */
  className?: string;

  /**
   * Loading timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  loadingTimeout?: number;

  /**
   * Enable HTML validation before injection
   * @default true
   */
  validateHtml?: boolean;

  /**
   * Callback for performance metrics
   */
  onPerformanceMetric?: (metric: {
    name: string;
    duration: number;
    timestamp: number;
  }) => void;

  /**
   * Content Security Policy configuration
   * Controls the security level and directives for the widget iframe
   *
   * @default { level: 'trusted' }
   *
   * @example
   * ```tsx
   * // Development mode (default)
   * <WidgetIframeRenderer csp={{ level: 'trusted' }} />
   *
   * // Production mode with untrusted widgets
   * <WidgetIframeRenderer csp={{ level: 'untrusted' }} />
   *
   * // Custom CSP directives
   * <WidgetIframeRenderer
   *   csp={{
   *     level: 'trusted',
   *     directives: {
   *       'connect-src': ["'self'", "https://api.example.com"]
   *     }
   *   }}
   * />
   * ```
   */
  csp?: CSPConfig;

  /**
   * Security level shorthand (alternative to csp.level)
   * @default 'trusted'
   */
  securityLevel?: CSPSecurityLevel;
}

/**
 * Widget Iframe Renderer Component
 *
 * Renders a widget in an isolated iframe with the complete
 * window.openai API injected.
 *
 * @example
 * ```tsx
 * <WidgetIframeRenderer
 *   mcpClient={client}
 *   widgetType="weather-card"
 *   toolOutput={{ city: 'Portland', temperature: 72 }}
 *   displayMode="inline"
 *   onStateChange={(state) => console.log('State:', state)}
 * />
 * ```
 */
export const WidgetIframeRenderer: React.FC<WidgetIframeRendererProps> = ({
  mcpClient,
  widgetType,
  toolInput,
  toolOutput,
  initialWidgetState,
  displayMode = 'inline',
  theme = 'light',
  maxHeight = 600,
  locale = 'en-US',
  onStateChange,
  onDisplayModeRequest,
  onOpenExternal,
  onFollowupTurn,
  onLoad,
  onError,
  loadingComponent,
  errorComponent,
  sandbox = 'allow-scripts allow-same-origin',
  iframeStyle,
  containerStyle,
  className,
  loadingTimeout = 30000,
  validateHtml = true,
  onPerformanceMetric,
  csp,
  securityLevel,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const emulatorRef = useRef<WindowOpenAIEmulator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [widgetHtml, setWidgetHtml] = useState<string>('');

  // Build CSP configuration
  const cspConfig: CSPConfig = React.useMemo(() => {
    const config: CSPConfig = {
      level: securityLevel || csp?.level || 'trusted',
      ...csp,
    };

    // Validate CSP configuration
    try {
      validateCSPConfig(config);
    } catch (err) {
      console.error('[WidgetIframeRenderer] Invalid CSP configuration:', err);
      // Fall back to trusted level on validation error
      config.level = 'trusted';
    }

    return config;
  }, [csp, securityLevel]);

  // Load widget HTML from MCP
  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const loadWidget = async () => {
      const startTime = performance.now();
      setLoading(true);
      setError(null);

      try {
        // Ensure MCP client is connected
        if (!mcpClient.isConnected()) {
          await mcpClient.connect();
        }

        // Load widget HTML with configurable timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`Widget loading timeout after ${loadingTimeout}ms`));
          }, loadingTimeout);
        });

        const html = await Promise.race([
          mcpClient.loadWidget(widgetType),
          timeoutPromise,
        ]);

        clearTimeout(timeoutId);

        if (cancelled) return;

        // Track loading performance
        const loadDuration = performance.now() - startTime;
        onPerformanceMetric?.({
          name: 'widget_load',
          duration: loadDuration,
          timestamp: Date.now(),
        });

        // Validate HTML if enabled
        if (validateHtml) {
          if (typeof html !== 'string' || html.trim().length === 0) {
            throw new Error('Invalid widget HTML: empty or non-string content');
          }

          // Basic HTML structure validation
          if (!html.includes('<html') && !html.includes('<HTML')) {
            throw new Error('Invalid widget HTML: missing <html> tag');
          }

          // Check for potentially dangerous content
          if (html.includes('<script src=') && !html.includes('sandbox')) {
            console.warn('[WidgetIframeRenderer] Widget contains external scripts - ensure iframe sandboxing is enabled');
          }
        }

        setWidgetHtml(html);
        setLoading(false);
        onLoad?.();
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (cancelled) return;

        // Enhance error with context
        const errorMessage = err instanceof Error ? err.message : String(err);
        const enhancedError = new Error(
          `Failed to load widget "${widgetType}": ${errorMessage}`
        );

        // Preserve stack trace if available
        if (err instanceof Error && err.stack) {
          enhancedError.stack = err.stack;
        }

        // Add custom properties for debugging
        (enhancedError as Error & { widgetType?: string; serverUrl?: string }).widgetType = widgetType;
        (enhancedError as Error & { widgetType?: string; serverUrl?: string }).serverUrl = mcpClient.isConnected()
          ? 'connected'
          : 'disconnected';

        setError(enhancedError);
        setLoading(false);
        onError?.(enhancedError);
      }
    };

    loadWidget();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mcpClient, widgetType, onLoad, onError]);

  // Inject window.openai API and render widget - only when HTML changes
  // This effect is optimized to only recreate the iframe when absolutely necessary
  // (widgetType changes or initial HTML load). Props are updated via separate effects
  // using emulatorRef to avoid unnecessary iframe recreation.
  useEffect(() => {
    if (!widgetHtml || !iframeRef.current || loading || error) {
      return;
    }

    const iframe = iframeRef.current;
    const renderStartTime = performance.now();

    // Create emulator with current props
    // Note: We use current prop values here for initial setup, but subsequent
    // updates go through separate useEffects below that call emulatorRef methods
    const emulator = new WindowOpenAIEmulator({
      mcpClient,
      toolInput,
      toolOutput,
      initialWidgetState,
      displayMode,
      theme,
      maxHeight,
      locale,
      onStateChange,
      onDisplayModeRequest,
      onOpenExternal,
      onFollowupTurn,
    });

    emulatorRef.current = emulator;

    // Inject API after iframe loads to avoid race condition
    const handleIframeLoad = () => {
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        // Inject API into the loaded document
        emulator.injectIntoWindow(iframeWindow);

        // Track render performance
        const renderDuration = performance.now() - renderStartTime;
        onPerformanceMetric?.({
          name: 'widget_render',
          duration: renderDuration,
          timestamp: Date.now(),
        });
      }
    };

    // Set up load handler BEFORE setting srcdoc
    iframe.addEventListener('load', handleIframeLoad);

    // Build CSP meta tag and inject it into HTML
    const { metaTag, nonce } = createCSPConfig(cspConfig);

    // Add CSP meta tag to HTML head
    let htmlWithCSP = widgetHtml.replace(
      /<head>/i,
      `<head>\n        ${metaTag}`
    );

    // For untrusted security level, add nonce to inline scripts
    if (cspConfig.level === 'untrusted' && nonce) {
      htmlWithCSP = addNonceToScripts(htmlWithCSP, nonce);
    }

    // Write HTML to iframe
    iframe.srcdoc = htmlWithCSP;

    return () => {
      // Cleanup
      iframe.removeEventListener('load', handleIframeLoad);
      emulator.cleanup();
      emulatorRef.current = null;
    };
    // OPTIMIZATION: Only recreate iframe when HTML, loading state, or error state changes
    // All other prop updates (toolOutput, displayMode, theme, etc.) are handled by
    // separate useEffects below that update the emulator via ref without recreating iframe.
    // This prevents the infinite refresh issue in MCP mode.
  }, [
    widgetHtml,
    loading,
    error,
    // NOTE: We intentionally do NOT include toolInput, toolOutput, displayMode, theme,
    // maxHeight in this dependency array. Those are handled by separate effects below.
    // We DO include callbacks and mcpClient since they shouldn't change during widget lifecycle.
    mcpClient,
    initialWidgetState,
    locale,
    onStateChange,
    onDisplayModeRequest,
    onOpenExternal,
    onFollowupTurn,
    cspConfig,
  ]);

  // Update emulator when props change
  useEffect(() => {
    if (!emulatorRef.current) return;

    if (toolOutput !== undefined) {
      emulatorRef.current.setToolOutput(toolOutput);
    }
  }, [toolOutput]);

  useEffect(() => {
    if (!emulatorRef.current) return;

    if (toolInput !== undefined) {
      emulatorRef.current.setToolInput(toolInput);
    }
  }, [toolInput]);

  useEffect(() => {
    if (!emulatorRef.current) return;
    emulatorRef.current.setDisplayMode(displayMode);
  }, [displayMode]);

  useEffect(() => {
    if (!emulatorRef.current) return;
    emulatorRef.current.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!emulatorRef.current) return;
    emulatorRef.current.setMaxHeight(maxHeight);
  }, [maxHeight]);

  // Render states
  if (loading) {
    return (
      <div className={className} style={{ padding: '20px', textAlign: 'center', ...containerStyle }}>
        {loadingComponent ?? <div>Loading widget...</div>}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ padding: '20px', color: 'red', ...containerStyle }}>
        {errorComponent ? errorComponent(error) : (
          <div>
            <strong>Error loading widget:</strong>
            <pre style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
              {error.message}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Render iframe
  return (
    <div className={className} style={{ width: '100%', height: '100%', ...containerStyle }}>
      <iframe
        ref={iframeRef}
        // Security Note: This sandbox configuration uses both allow-scripts and allow-same-origin,
        // which browsers warn "can escape sandboxing". This combination is necessary because:
        // 1. allow-scripts: Required to execute widget JavaScript code
        // 2. allow-same-origin: Required to inject window.openai API from parent window
        //
        // Security mitigation: We use Content Security Policy (CSP) with nonces (see lines 406-417)
        // to provide an additional layer of protection against XSS and code injection.
        //
        // For production deployments, widgets run in ChatGPT's sandboxed environment with
        // stricter security controls. This dev preview trades some isolation for functionality.
        sandbox={sandbox}
        style={{
          width: '100%',
          height: displayMode === 'fullscreen' ? '100vh' : `${maxHeight}px`,
          border: 'none',
          ...iframeStyle,
        }}
        title={`Widget: ${widgetType}`}
      />
    </div>
  );
};
