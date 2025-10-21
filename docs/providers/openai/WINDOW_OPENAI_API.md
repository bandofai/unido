# window.openai API Reference

**Complete specification for the OpenAI Apps SDK component bridge API**

---

## Table of Contents

1. [Overview](#overview)
2. [API Reference](#api-reference)
   - [Data Properties](#data-properties)
   - [Methods](#methods)
   - [Layout & Context Properties](#layout--context-properties)
3. [Window Events](#window-events)
4. [Type Definitions](#type-definitions)
5. [Usage Patterns](#usage-patterns)
6. [Edge Cases & Behaviors](#edge-cases--behaviors)
7. [Legacy Compatibility](#legacy-compatibility)

---

## Overview

### What is window.openai?

The `window.openai` global object provides methods for your application bundle to exchange data with the ChatGPT conversation. Components run in a sandboxed iframe, and the host injects this global.

### Key Characteristics

- **Injected by Host**: ChatGPT automatically injects this object into your component's iframe
- **Bidirectional Communication**: Enables data flow between your widget and the conversation
- **Sandboxed Environment**: Your component runs in isolation with controlled access
- **Promise-Based API**: Most methods return promises for async operations
- **Type-Safe**: Full TypeScript definitions available in `packages/dev/src/types/window-openai.ts`

### When to Use

- ✅ Accessing tool input/output data
- ✅ Persisting widget state across re-renders
- ✅ Calling server-side tools from UI interactions
- ✅ Responding to theme/layout changes
- ✅ Sending follow-up messages to the conversation
- ✅ Requesting display mode changes (fullscreen, PiP)

---

## API Reference

### Data Properties

#### `toolInput`

**Type**: `unknown` (read-only)

**Purpose**: Arguments ChatGPT provided to the tool call.

**Usage**: Access the input parameters passed to your tool when it was invoked.

```typescript
const toolInput = window.openai?.toolInput as { city?: string } | undefined;
const city = toolInput?.city ?? 'San Francisco';
```

**Best Practices**:
- Always type-cast with proper interfaces
- Provide fallback defaults
- Validate input data structure

---

#### `toolOutput`

**Type**: `unknown` (read-only)

**Purpose**: The JSON your tool returned in the MCP response (`structuredContent` field).

**Usage**: Use as initial render data for your component.

```typescript
interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
}

const toolOutput = window.openai?.toolOutput as WeatherData | undefined;

if (toolOutput) {
  return (
    <div>
      <h2>{toolOutput.city}</h2>
      <p>{toolOutput.temperature}°F - {toolOutput.condition}</p>
    </div>
  );
}
```

**Important Notes**:
- This is the `structuredContent` from your tool's MCP response
- Data is frozen and read-only
- Always check for existence before accessing

---

#### `widgetState`

**Type**: `Record<string, unknown>` (read-only)

**Purpose**: Persisted component state from prior renders.

**Usage**: Check this first and fall back to `toolOutput`. State persists across widget re-renders in the same conversation.

```typescript
interface WidgetState {
  favorites: string[];
  lastUpdated: number;
}

// Priority: widgetState > toolOutput > defaults
const initialState: WidgetState =
  (window.openai?.widgetState as WidgetState) ??
  (window.openai?.toolOutput as WidgetState) ??
  { favorites: [], lastUpdated: 0 };
```

**Best Practices**:
- Always read from `widgetState` before `toolOutput`
- Use version keys for state migration (`__v: 1`)
- Keep state size reasonable (< 100KB recommended)

---

### Methods

#### `setWidgetState(state)`

**Signature**: `setWidgetState(state: Record<string, unknown>): Promise<void>`

**Purpose**: Persist state back to the host.

**Returns**: Promise that resolves when the state is stored.

**Usage**: Save user interactions, preferences, or drafts.

```typescript
async function persistFavorites(favorites: string[]) {
  const places = window.openai?.toolOutput?.places ?? [];

  await window.openai?.setWidgetState?.({
    __v: 1,  // Version for state migration
    places,
    favorites,
    lastUpdated: Date.now()
  });
}

// In React component
const [favorites, setFavorites] = useState<string[]>([]);

const addFavorite = async (placeId: string) => {
  const updated = [...favorites, placeId];
  setFavorites(updated);
  await persistFavorites(updated);
};
```

**Important Notes**:
- State persists across re-renders in the same conversation
- State does NOT persist across different conversations
- Limit state size to avoid performance issues
- Consider adding version keys for state schema evolution

---

#### `callTool(name, args)`

**Signature**: `callTool(name: string, args: unknown): Promise<{ result: unknown }>`

**Purpose**: Invoke another tool exposed by your MCP server.

**Returns**: Promise with the tool's response.

**Requirements**: Tool must have `openai/widgetAccessible: true` in metadata.

**Usage**: Useful for in-component actions such as refreshing data, moving tasks, etc.

```typescript
// Example: Interactive todo list
const completeTodo = async (todoId: string) => {
  try {
    const response = await window.openai?.callTool?.('complete_todo', {
      id: todoId
    });

    console.log('Tool result:', response?.result);
    // Component will re-render with updated data automatically
  } catch (error) {
    console.error('Failed to complete todo:', error);
  }
};

// In your component
<button onClick={() => completeTodo(todo.id)}>
  Complete
</button>
```

**Server-Side Setup**:

```typescript
// Enable widgetAccessible in your tool
app.tool('complete_todo', {
  title: 'Complete Todo',
  input: z.object({ id: z.string() }),
  metadata: {
    openai: {
      widgetAccessible: true  // Critical!
    }
  },
  handler: async ({ id }) => {
    await db.completeTodo(id);
    const todos = await db.getTodos();
    return componentResponse('todo-list', { todos }, 'Todo completed');
  }
});
```

**Event Handling**: Listen for `openai:tool_response` event for tool call completion details.

---

#### `sendFollowupTurn(request)`

**Signature**: `sendFollowupTurn(request: { prompt: string }): Promise<void>`

**Purpose**: Insert a message into the conversation.

**Usage**: Often used after a user clicks a button inside the component.

```typescript
const askForMorePlaces = async () => {
  await window.openai?.sendFollowupTurn?.({
    prompt: 'Show me more pizza places nearby'
  });
};

// In your component
<button onClick={askForMorePlaces}>
  Show More Places
</button>
```

**User Experience Notes**:
- This adds a new user message to the chat
- ChatGPT will respond as if the user typed the message
- Use for natural conversation continuations
- Keep prompts clear and specific

---

#### `requestDisplayMode(request)`

**Signature**: `requestDisplayMode(request: { mode: DisplayMode }): Promise<{ mode: DisplayMode }>`

**Purpose**: Request a layout change (inline, pip, fullscreen).

**Returns**: Promise with the granted display mode (may differ from request).

**Display Modes**:
- `inline` - Embedded in conversation
- `pip` - Picture-in-picture floating window
- `fullscreen` - Full screen view

```typescript
const goFullscreen = async () => {
  try {
    const result = await window.openai?.requestDisplayMode?.({
      mode: 'fullscreen'
    });

    console.log('Granted mode:', result?.mode);
    // Note: Granted mode may differ from requested mode
  } catch (error) {
    console.error('Display mode request denied:', error);
  }
};

// Common pattern: Request PiP when user clicks play
const handlePlayClick = async () => {
  if (window.openai?.displayMode === 'inline') {
    await window.openai?.requestDisplayMode?.({ mode: 'pip' });
  }
  // Start video playback...
};
```

**Important Notes**:
- Host decides whether to honor the request
- On mobile, PiP may be automatically coerced to fullscreen
- Check `displayMode` property to verify current state
- Listen to `openai:set_globals` event for mode changes

---

#### `openExternal(request)`

**Signature**: `openExternal(request: { href: string }): void`

**Purpose**: Open an external link in a new tab/window.

**Usage**: Opens the URL outside the ChatGPT environment.

```typescript
const openMenu = () => {
  window.openai?.openExternal?.({
    href: 'https://example.com/menu'
  });
};

// In your component
<button onClick={openMenu}>
  View Full Menu
</button>
```

**Security Notes**:
- Links open in new tab/window
- Standard browser security applies
- Consider using `rel="noopener noreferrer"` patterns
- Validate URLs before calling

---

### Layout & Context Properties

#### `displayMode`

**Type**: `'inline' | 'pip' | 'fullscreen'` (read-only)

**Purpose**: Current display mode in ChatGPT.

**Usage**: Adapt your component's layout based on available space.

```typescript
const displayMode = window.openai?.displayMode;

const isFullscreen = displayMode === 'fullscreen';
const isPip = displayMode === 'pip';

return (
  <div className={`
    ${isFullscreen ? 'h-screen' : 'h-[500px]'}
    ${isPip ? 'compact-layout' : 'expanded-layout'}
  `}>
    {isFullscreen ? <FullUI /> : <CompactUI />}
  </div>
);
```

**React Hook Pattern**:

```typescript
function useDisplayMode(): DisplayMode | undefined {
  const [mode, setMode] = useState(window.openai?.displayMode);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      setMode(event.detail.displayMode);
    };

    window.addEventListener('openai:set_globals', handler);
    return () => window.removeEventListener('openai:set_globals', handler);
  }, []);

  return mode;
}
```

---

#### `maxHeight`

**Type**: `number | undefined` (read-only, pixels)

**Purpose**: Maximum height constraint for the widget.

**Usage**: Use this to constrain your component's layout.

```typescript
const maxHeight = window.openai?.maxHeight;

return (
  <div style={{
    maxHeight: maxHeight ? `${maxHeight}px` : undefined,
    overflow: 'auto'
  }}>
    <Content />
  </div>
);
```

**React Hook Pattern**:

```typescript
function useMaxHeight(): number | undefined {
  const [height, setHeight] = useState(window.openai?.maxHeight);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      if (event.detail.maxHeight !== undefined) {
        setHeight(event.detail.maxHeight);
      }
    };

    window.addEventListener('openai:set_globals', handler);
    return () => window.removeEventListener('openai:set_globals', handler);
  }, []);

  return height;
}
```

---

#### `locale`

**Type**: `string | undefined` (read-only, BCP 47 format)

**Purpose**: Locale string for the active user.

**Usage**: Load translations, format numbers, and surface localized copy.

```typescript
const locale = window.openai?.locale ?? 'en-US';

// Format numbers
const formatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'USD'
});

const price = formatter.format(29.99);  // "$29.99" or "29,99 $" based on locale

// Format dates
const dateFormatter = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const date = dateFormatter.format(new Date());
```

**Internationalization Pattern**:

```typescript
const translations = {
  'en-US': { welcome: 'Welcome', close: 'Close' },
  'es-ES': { welcome: 'Bienvenido', close: 'Cerrar' },
  'fr-FR': { welcome: 'Bienvenue', close: 'Fermer' }
};

function useTranslation() {
  const locale = window.openai?.locale ?? 'en-US';
  const lang = locale.split('-')[0];  // 'en', 'es', 'fr'

  return translations[locale] ?? translations['en-US'];
}
```

---

#### `theme`

**Type**: `'light' | 'dark'` (read-only)

**Purpose**: Current theme in ChatGPT.

**Usage**: Adapt your component's styling to match the user's preference.

```typescript
const theme = window.openai?.theme ?? 'light';

return (
  <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
    <Content />
  </div>
);
```

**CSS Variables Pattern**:

```typescript
useEffect(() => {
  const theme = window.openai?.theme ?? 'light';

  if (theme === 'dark') {
    document.documentElement.style.setProperty('--bg-color', '#1a1a1a');
    document.documentElement.style.setProperty('--text-color', '#ffffff');
  } else {
    document.documentElement.style.setProperty('--bg-color', '#ffffff');
    document.documentElement.style.setProperty('--text-color', '#000000');
  }
}, []);

// Listen for theme changes
useEffect(() => {
  const handler = (event: CustomEvent) => {
    if (event.detail.theme) {
      // Update theme...
    }
  };

  window.addEventListener('openai:set_globals', handler);
  return () => window.removeEventListener('openai:set_globals', handler);
}, []);
```

---

## Window Events

### `openai:set_globals`

**Type**: `CustomEvent<SetGlobalsEventDetail>`

**Purpose**: Dispatched when globals change (e.g., displayMode, maxHeight, toolOutput, widgetState).

**Event Detail**:

```typescript
interface SetGlobalsEventDetail {
  displayMode?: 'inline' | 'pip' | 'fullscreen';
  maxHeight?: number;
  toolInput?: unknown;
  toolOutput?: unknown;
  widgetState?: Record<string, unknown>;
  locale?: string;
  theme?: 'light' | 'dark';
}
```

**Usage**:

```typescript
window.addEventListener('openai:set_globals', (event: CustomEvent) => {
  console.log('Globals updated:', event.detail);

  if (event.detail.displayMode) {
    console.log('Display mode changed to:', event.detail.displayMode);
  }

  if (event.detail.toolOutput) {
    console.log('New tool output:', event.detail.toolOutput);
  }

  if (event.detail.theme) {
    console.log('Theme changed to:', event.detail.theme);
  }
});
```

**React Pattern**:

```typescript
function useOpenAIGlobals() {
  const [globals, setGlobals] = useState({
    displayMode: window.openai?.displayMode,
    maxHeight: window.openai?.maxHeight,
    theme: window.openai?.theme,
    locale: window.openai?.locale
  });

  useEffect(() => {
    const handler = (event: CustomEvent<SetGlobalsEventDetail>) => {
      setGlobals(prev => ({
        ...prev,
        ...event.detail
      }));
    };

    window.addEventListener('openai:set_globals', handler);
    return () => window.removeEventListener('openai:set_globals', handler);
  }, []);

  return globals;
}
```

---

### `openai:tool_response`

**Type**: `CustomEvent<ToolResponseEventDetail>`

**Purpose**: Dispatched after `callTool` completes with details of the tool invocation.

**Event Detail**:

```typescript
interface ToolResponseEventDetail {
  name: string;      // Tool name that was called
  args: unknown;     // Arguments passed to the tool
  result: unknown;   // Tool's response
}
```

**Usage**:

```typescript
window.addEventListener('openai:tool_response', (event: CustomEvent) => {
  console.log('Tool response received:', event.detail);
  console.log('Tool name:', event.detail.name);
  console.log('Tool args:', event.detail.args);
  console.log('Tool result:', event.detail.result);
});
```

**React Pattern for Loading States**:

```typescript
function useToolCall(toolName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const callTool = async (args: unknown) => {
    setIsLoading(true);
    await window.openai?.callTool?.(toolName, args);
  };

  useEffect(() => {
    const handler = (event: CustomEvent<ToolResponseEventDetail>) => {
      if (event.detail.name === toolName) {
        setIsLoading(false);
        setResult(event.detail.result);
      }
    };

    window.addEventListener('openai:tool_response', handler);
    return () => window.removeEventListener('openai:tool_response', handler);
  }, [toolName]);

  return { callTool, isLoading, result };
}
```

---

## Type Definitions

Complete TypeScript definitions are available in [`packages/dev/src/types/window-openai.ts`](../../../packages/dev/src/types/window-openai.ts).

### Key Types

```typescript
// Display mode options
type DisplayMode = 'inline' | 'pip' | 'fullscreen';

// Theme options
type Theme = 'light' | 'dark';

// Main interface
interface WindowOpenAI {
  // Data properties (read-only)
  readonly toolInput?: unknown;
  readonly toolOutput?: unknown;
  readonly widgetState?: Record<string, unknown>;

  // Methods
  setWidgetState?(state: Record<string, unknown>): Promise<void>;
  callTool?(name: string, args: unknown): Promise<{ result: unknown }>;
  sendFollowupTurn?(request: { prompt: string }): Promise<void>;
  requestDisplayMode?(request: { mode: DisplayMode }): Promise<{ mode: DisplayMode }>;
  openExternal?(request: { href: string }): void;

  // Layout & context (read-only)
  readonly displayMode?: DisplayMode;
  readonly maxHeight?: number;
  readonly locale?: string;
  readonly theme?: Theme;
}

// Global augmentation
declare global {
  interface Window {
    openai?: WindowOpenAI;
  }
}
```

### Helper Functions

```typescript
// Type guard
function hasWindowOpenAI(): boolean {
  return typeof window !== 'undefined' && window.openai !== undefined;
}

// Safe accessor
function getWindowOpenAI(): WindowOpenAI | undefined {
  return typeof window !== 'undefined' ? window.openai : undefined;
}
```

---

## Usage Patterns

### Pattern 1: Basic Data Access

Simple read-only widget that displays tool output.

```typescript
interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
}

function WeatherCard() {
  const data = window.openai?.toolOutput as WeatherData | undefined;

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="weather-card">
      <h2>{data.city}</h2>
      <div className="temp">{data.temperature}°F</div>
      <div className="condition">{data.condition}</div>
    </div>
  );
}
```

---

### Pattern 2: Persistent State

Widget that remembers user interactions across re-renders.

```typescript
interface TodoListState {
  __v: number;  // Version for migrations
  todos: Array<{ id: string; text: string; completed: boolean }>;
  filter: 'all' | 'active' | 'completed';
}

function TodoList() {
  // Priority: widgetState > toolOutput > defaults
  const initialState: TodoListState =
    (window.openai?.widgetState as TodoListState) ??
    (window.openai?.toolOutput as TodoListState) ??
    { __v: 1, todos: [], filter: 'all' };

  const [state, setState] = useState(initialState);

  const updateState = async (newState: TodoListState) => {
    setState(newState);
    await window.openai?.setWidgetState?.(newState);
  };

  const setFilter = (filter: TodoListState['filter']) => {
    updateState({ ...state, filter });
  };

  return (
    <div>
      <FilterButtons current={state.filter} onChange={setFilter} />
      <TodoItems todos={state.todos} filter={state.filter} />
    </div>
  );
}
```

---

### Pattern 3: Interactive Widget with Tool Calls

Widget that triggers server-side actions.

```typescript
function InteractiveTodoList() {
  const [todos, setTodos] = useState(window.openai?.toolOutput?.todos ?? []);
  const [isLoading, setIsLoading] = useState(false);

  const addTodo = async (text: string) => {
    setIsLoading(true);
    try {
      await window.openai?.callTool?.('add_todo', { text });
      // Component will re-render with updated data via openai:tool_response
    } catch (error) {
      console.error('Failed to add todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTodo = async (id: string) => {
    await window.openai?.callTool?.('complete_todo', { id });
  };

  // Listen for tool responses
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      if (event.detail.result?.todos) {
        setTodos(event.detail.result.todos);
      }
    };

    window.addEventListener('openai:tool_response', handler);
    return () => window.removeEventListener('openai:tool_response', handler);
  }, []);

  return (
    <div>
      <AddTodoForm onSubmit={addTodo} disabled={isLoading} />
      <TodoList todos={todos} onComplete={completeTodo} />
    </div>
  );
}
```

---

### Pattern 4: Responsive Layout

Adapt to display mode and height constraints.

```typescript
function ResponsiveMap() {
  const displayMode = window.openai?.displayMode;
  const maxHeight = window.openai?.maxHeight;
  const theme = window.openai?.theme;

  const isFullscreen = displayMode === 'fullscreen';
  const isPip = displayMode === 'pip';

  return (
    <div
      className={`map-container ${theme}`}
      style={{
        height: isFullscreen ? '100vh' : '500px',
        maxHeight: maxHeight ? `${maxHeight}px` : undefined
      }}
    >
      {isFullscreen ? (
        <>
          <Sidebar places={places} />
          <Map bounds={bounds} />
          <Inspector place={selected} />
        </>
      ) : (
        <CompactView places={places} />
      )}
    </div>
  );
}
```

---

### Pattern 5: Localization & Formatting

Support multiple locales and formats.

```typescript
function LocalizedPriceCard() {
  const locale = window.openai?.locale ?? 'en-US';
  const theme = window.openai?.theme ?? 'light';

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD'
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={theme}>
      <h2>{currencyFormatter.format(29.99)}</h2>
      <p>{dateFormatter.format(new Date())}</p>
    </div>
  );
}
```

---

## Edge Cases & Behaviors

### SSR/SSG Compatibility

Always check for `window` existence:

```typescript
// ✅ Safe
const openai = typeof window !== 'undefined' ? window.openai : undefined;

// ✅ Safe with optional chaining
const theme = window.openai?.theme ?? 'light';

// ❌ Unsafe - crashes in SSR
const theme = window.openai.theme;
```

---

### State Persistence Limits

- State persists **within a conversation**
- State does **NOT** persist across different conversations
- State does **NOT** sync across multiple users
- Recommended state size: < 100KB
- Consider state versioning for schema evolution

```typescript
interface VersionedState {
  __v: number;  // State version
  // ... your data
}

function migrateState(state: any): VersionedState {
  if (!state.__v) {
    // Migrate from v0 to v1
    return { __v: 1, ...state };
  }
  return state;
}
```

---

### Display Mode Coercion

- Requested mode may not be granted
- On mobile, PiP automatically becomes fullscreen
- Always check `displayMode` property after request
- Listen to `openai:set_globals` for actual mode changes

```typescript
const requestPiP = async () => {
  const result = await window.openai?.requestDisplayMode?.({ mode: 'pip' });

  // result.mode might be 'fullscreen' on mobile!
  if (result?.mode !== 'pip') {
    console.log('PiP not available, got:', result?.mode);
  }
};
```

---

### Tool Call Requirements

For `callTool()` to work:

1. Tool must have `openai/widgetAccessible: true` in metadata
2. Parent tool (that rendered the widget) must also have `widgetAccessible: true`
3. Component must be rendered in a supported display mode

```typescript
// Server setup required:
app.tool('show_dashboard', {
  // ...
  metadata: {
    openai: {
      widgetAccessible: true  // Required!
    }
  }
});

app.tool('refresh_data', {
  // ...
  metadata: {
    openai: {
      widgetAccessible: true  // Also required!
    }
  }
});
```

---

### Event Timing

- `openai:set_globals` fires when any global changes
- `openai:tool_response` fires after `callTool()` completes
- Events fire asynchronously
- Multiple rapid changes may batch into single event
- Always handle events defensively

```typescript
useEffect(() => {
  const handler = (event: CustomEvent) => {
    // Check which properties actually changed
    if (event.detail.displayMode !== undefined) {
      // Handle display mode change
    }
    if (event.detail.theme !== undefined) {
      // Handle theme change
    }
  };

  window.addEventListener('openai:set_globals', handler);
  return () => window.removeEventListener('openai:set_globals', handler);
}, []);
```

---

### Undefined vs Null

- Most properties may be `undefined` if not set
- Always use optional chaining: `window.openai?.property`
- Provide sensible defaults: `window.openai?.theme ?? 'light'`

```typescript
// ✅ Correct
const locale = window.openai?.locale ?? 'en-US';

// ❌ May fail
const locale = window.openai.locale || 'en-US';  // Crashes if window.openai undefined
```

---

## Legacy Compatibility

### `window.oai` (Deprecated)

Older widgets may use `window.oai`. New components should use `window.openai`.

```typescript
// Legacy pattern
if (window.oai?.widget?.setState) {
  window.oai.widget.setState({ data });
}

// Modern pattern
if (window.openai?.setWidgetState) {
  await window.openai.setWidgetState({ data });
}
```

---

### `window.webplus` (Deprecated)

Even older interface. Avoid in new code.

---

### Migration Strategy

```typescript
// Support both for gradual migration
const setWidgetState = async (state: Record<string, unknown>) => {
  if (window.openai?.setWidgetState) {
    // Modern API
    await window.openai.setWidgetState(state);
  } else if (window.oai?.widget?.setState) {
    // Legacy API
    window.oai.widget.setState(state);
  }
};
```

---

## Additional Resources

### Documentation Links

- **OpenAI Apps SDK Reference**: https://developers.openai.com/apps-sdk/reference
- **OpenAI Apps SDK Home**: https://developers.openai.com/apps-sdk/
- **Unido Integration Guide**: [OPENAI_APPS_SDK.md](./OPENAI_APPS_SDK.md)
- **TypeScript Definitions**: [`packages/dev/src/types/window-openai.ts`](../../../packages/dev/src/types/window-openai.ts)

### Example Repositories

- **OpenAI Apps SDK Examples**: https://github.com/openai/openai-apps-sdk-examples
- **Unido Weather Example**: [`examples/weather-app/`](../../../examples/weather-app/)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-01-17
**OpenAI Apps SDK Version**: Preview (October 2024)
**Unido Version**: 0.6.x

> 📚 For the most up-to-date OpenAI Apps SDK specifications, always query Context7 with library ID `/websites/developers_openai_apps-sdk`.
