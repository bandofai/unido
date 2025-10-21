/**
 * React hooks for accessing window.openai API in Unido components
 *
 * These hooks provide a React-friendly interface to the OpenAI Apps SDK
 * window.openai API, with automatic re-rendering when values change.
 *
 * @see https://developers.openai.com/apps-sdk/reference
 */

import { useEffect, useState, useCallback } from 'react';
import type {
  WindowOpenAI,
  DisplayMode,
  Theme,
  SetGlobalsEventDetail,
  ToolResponseEventDetail,
} from '../types/window-openai.js';

/**
 * Type guard to check if window.openai is available
 */
function hasWindowOpenAI(): boolean {
  return typeof window !== 'undefined' && window.openai !== undefined;
}

/**
 * Safely get window.openai or return undefined
 */
function getWindowOpenAI(): WindowOpenAI | undefined {
  return typeof window !== 'undefined' ? window.openai : undefined;
}

/**
 * Hook to access a specific property from window.openai with automatic re-rendering
 *
 * @example
 * ```typescript
 * const theme = useOpenAIGlobal('theme');
 * const displayMode = useOpenAIGlobal('displayMode');
 * const maxHeight = useOpenAIGlobal('maxHeight');
 * ```
 */
export function useOpenAIGlobal<K extends keyof WindowOpenAI>(
  key: K
): WindowOpenAI[K] | undefined {
  const [value, setValue] = useState<WindowOpenAI[K] | undefined>(() => {
    const openai = getWindowOpenAI();
    return openai?.[key];
  });

  useEffect(() => {
    const handler = (event: CustomEvent<SetGlobalsEventDetail>) => {
      if (key in event.detail) {
        setValue(event.detail[key as keyof SetGlobalsEventDetail] as WindowOpenAI[K]);
      }
    };

    window.addEventListener('openai:set_globals', handler as EventListener);

    // Update initial value in case it changed before mount
    const openai = getWindowOpenAI();
    if (openai) {
      setValue(openai[key]);
    }

    return () => {
      window.removeEventListener('openai:set_globals', handler as EventListener);
    };
  }, [key]);

  return value;
}

/**
 * Hook to get the current display mode (inline, pip, or fullscreen)
 *
 * @example
 * ```typescript
 * const displayMode = useDisplayMode();
 * const isFullscreen = displayMode === 'fullscreen';
 * ```
 */
export function useDisplayMode(): DisplayMode | undefined {
  return useOpenAIGlobal('displayMode');
}

/**
 * Hook to get the current theme (light or dark)
 *
 * @example
 * ```typescript
 * const theme = useTheme();
 * return <div className={theme === 'dark' ? 'dark' : 'light'}>...</div>;
 * ```
 */
export function useTheme(): Theme | undefined {
  return useOpenAIGlobal('theme');
}

/**
 * Hook to get the maximum height constraint in pixels
 *
 * @example
 * ```typescript
 * const maxHeight = useMaxHeight();
 * return <div style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}>...</div>;
 * ```
 */
export function useMaxHeight(): number | undefined {
  return useOpenAIGlobal('maxHeight');
}

/**
 * Hook to get the user's locale (BCP 47 format)
 *
 * @example
 * ```typescript
 * const locale = useLocale();
 * const formatter = new Intl.NumberFormat(locale ?? 'en-US');
 * ```
 */
export function useLocale(): string | undefined {
  return useOpenAIGlobal('locale');
}

/**
 * Hook to get tool input parameters
 *
 * @example
 * ```typescript
 * interface Input { city: string }
 * const toolInput = useToolInput<Input>();
 * ```
 */
export function useToolInput<T = unknown>(): T | undefined {
  return useOpenAIGlobal('toolInput') as T | undefined;
}

/**
 * Hook to get tool output (structured content from MCP response)
 *
 * @example
 * ```typescript
 * interface WeatherData { temperature: number; condition: string }
 * const toolOutput = useToolOutput<WeatherData>();
 * ```
 */
export function useToolOutput<T = unknown>(): T | undefined {
  return useOpenAIGlobal('toolOutput') as T | undefined;
}

/**
 * Hook to access and manage widget state with persistence
 *
 * Returns [state, setState] similar to useState, but state persists across re-renders
 *
 * @example
 * ```typescript
 * interface State { favorites: string[] }
 * const [state, setState] = useWidgetState<State>({ favorites: [] });
 *
 * const addFavorite = async (id: string) => {
 *   await setState({ ...state, favorites: [...state.favorites, id] });
 * };
 * ```
 */
export function useWidgetState<T extends Record<string, unknown>>(
  defaultValue: T
): [T, (newState: T) => Promise<void>] {
  const [state, setStateInternal] = useState<T>(() => {
    const openai = getWindowOpenAI();
    // Priority: widgetState > toolOutput > defaultValue
    return (openai?.widgetState as T) ?? (openai?.toolOutput as T) ?? defaultValue;
  });

  useEffect(() => {
    const handler = (event: CustomEvent<SetGlobalsEventDetail>) => {
      if (event.detail.widgetState) {
        setStateInternal(event.detail.widgetState as T);
      } else if (event.detail.toolOutput) {
        setStateInternal(event.detail.toolOutput as T);
      }
    };

    window.addEventListener('openai:set_globals', handler as EventListener);
    return () => window.removeEventListener('openai:set_globals', handler as EventListener);
  }, []);

  const setState = useCallback(async (newState: T) => {
    setStateInternal(newState);
    const openai = getWindowOpenAI();
    await openai?.setWidgetState?.(newState);
  }, []);

  return [state, setState];
}

/**
 * Hook to call a tool from within a component
 *
 * Returns a function to call the tool and state for loading/result
 *
 * @example
 * ```typescript
 * const { callTool, isLoading, result, error } = useToolCall('refresh_weather');
 *
 * const refresh = async () => {
 *   await callTool({ city: 'Portland' });
 * };
 * ```
 */
export function useToolCall<TArgs = unknown, TResult = unknown>(toolName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handler = (event: CustomEvent<ToolResponseEventDetail>) => {
      if (event.detail.name === toolName) {
        setIsLoading(false);
        setResult(event.detail.result as TResult);
      }
    };

    window.addEventListener('openai:tool_response', handler as EventListener);
    return () => window.removeEventListener('openai:tool_response', handler as EventListener);
  }, [toolName]);

  const callTool = useCallback(
    async (args: TArgs) => {
      setIsLoading(true);
      setError(null);

      try {
        const openai = getWindowOpenAI();
        if (!openai?.callTool) {
          throw new Error('window.openai.callTool is not available');
        }

        const response = await openai.callTool(toolName, args);
        setResult(response.result as TResult);
        setIsLoading(false);
        return response.result as TResult;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsLoading(false);
        throw errorObj;
      }
    },
    [toolName]
  );

  return { callTool, isLoading, result, error };
}

/**
 * Hook to send a follow-up message to the conversation
 *
 * @example
 * ```typescript
 * const sendMessage = useSendFollowupTurn();
 *
 * <button onClick={() => sendMessage('Show me more results')}>
 *   Show More
 * </button>
 * ```
 */
export function useSendFollowupTurn() {
  return useCallback(async (prompt: string) => {
    const openai = getWindowOpenAI();
    if (!openai?.sendFollowupTurn) {
      console.warn('window.openai.sendFollowupTurn is not available');
      return;
    }

    await openai.sendFollowupTurn({ prompt });
  }, []);
}

/**
 * Hook to request a display mode change
 *
 * @example
 * ```typescript
 * const requestDisplayMode = useRequestDisplayMode();
 *
 * const goFullscreen = async () => {
 *   const result = await requestDisplayMode('fullscreen');
 *   console.log('Granted mode:', result?.mode);
 * };
 * ```
 */
export function useRequestDisplayMode() {
  return useCallback(async (mode: DisplayMode) => {
    const openai = getWindowOpenAI();
    if (!openai?.requestDisplayMode) {
      console.warn('window.openai.requestDisplayMode is not available');
      return { mode };
    }

    return await openai.requestDisplayMode({ mode });
  }, []);
}

/**
 * Hook to open an external link
 *
 * @example
 * ```typescript
 * const openExternal = useOpenExternal();
 *
 * <button onClick={() => openExternal('https://example.com/docs')}>
 *   View Documentation
 * </button>
 * ```
 */
export function useOpenExternal() {
  return useCallback((href: string) => {
    const openai = getWindowOpenAI();
    if (!openai?.openExternal) {
      console.warn('window.openai.openExternal is not available, using window.open');
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    openai.openExternal({ href });
  }, []);
}

/**
 * Hook to listen for all window.openai globals changes
 *
 * @example
 * ```typescript
 * const globals = useOpenAIGlobals();
 *
 * console.log('Display mode:', globals.displayMode);
 * console.log('Theme:', globals.theme);
 * ```
 */
export function useOpenAIGlobals() {
  const displayMode = useDisplayMode();
  const theme = useTheme();
  const maxHeight = useMaxHeight();
  const locale = useLocale();
  const toolInput = useToolInput();
  const toolOutput = useToolOutput();

  return {
    displayMode,
    theme,
    maxHeight,
    locale,
    toolInput,
    toolOutput,
  };
}

/**
 * Hook to check if window.openai API is available
 *
 * @example
 * ```typescript
 * const isAvailable = useOpenAIAvailable();
 *
 * if (!isAvailable) {
 *   return <div>This component requires ChatGPT environment</div>;
 * }
 * ```
 */
export function useOpenAIAvailable(): boolean {
  const [available, setAvailable] = useState(hasWindowOpenAI);

  useEffect(() => {
    // Check periodically in case it becomes available
    const interval = setInterval(() => {
      setAvailable(hasWindowOpenAI());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return available;
}
