# window.openai API - Current vs Complete Comparison

**Analysis of Unido's current window.openai implementation vs complete OpenAI Apps SDK specification**

---

## Executive Summary

This document compares Unido's `window.openai` implementation against the complete OpenAI Apps SDK specification and tracks implementation progress.

### Current Status (Updated 2025-01-17)

- ✅ **TypeScript Definitions**: Complete - All 14 API members defined in bundler
- ✅ **React Hooks**: Complete - 14 hooks created for developer convenience
- ✅ **Type Exports**: Complete - Full type definitions exported from @bandofai/unido-dev
- ✅ **Documentation**: Complete - API reference, examples, and guides created
- ⚠️ **Runtime Implementation**: Requires ChatGPT environment - Properties injected by host

### Implementation Progress

**Phase 1: TypeScript & Tooling** ✅ Complete (2025-01-17)
- ✅ Updated bundler with complete API definitions
- ✅ Created React hooks package (@bandofai/unido-dev)
- ✅ Exported types and helpers
- ✅ Created comprehensive examples

**Phase 2: Runtime Behavior** ⚠️ Depends on ChatGPT
- The actual API methods are injected by ChatGPT's runtime
- Unido provides type-safe interface and React hooks
- Components can safely use all API features when running in ChatGPT

### Developer Experience Status

✅ **Ready for Development**:
- TypeScript autocomplete for all API members
- React hooks for all properties and methods
- Comprehensive documentation and examples
- Type-safe component development

⚠️ **Runtime Availability**:
- API features work when widget runs in ChatGPT
- Graceful fallbacks when properties unavailable
- Testing requires ChatGPT environment or emulation

---

## Detailed Comparison

### Current Implementation (packages/providers/openai/src/bundler.ts)

**Location**: Lines 59-71

```typescript
declare global {
  interface Window {
    openai?: {
      toolInput?: unknown;
      toolOutput?: ComponentProps;
      toolResponseMetadata?: Record<string, unknown>;
      widgetState?: Record<string, unknown>;
      setWidgetState?: (state: Record<string, unknown>) => void;
      callTool?: (name: string, args: unknown) => Promise<unknown>;
    };
  }
}
```

**Current Usage** (Lines 74-79):

```typescript
const getProps = (): ComponentProps => {
  if (typeof window !== 'undefined' && window.openai?.toolOutput) {
    return window.openai.toolOutput;
  }
  return {};
};
```

---

## API Comparison Table

| API Property/Method | Current Status | Complete Spec | Gap Analysis | Priority |
|---------------------|----------------|---------------|--------------|----------|
| **Data Properties** |
| `toolInput` | ✅ Implemented | ✅ `unknown` (read-only) | ✅ Complete | - |
| `toolOutput` | ✅ Implemented | ✅ `unknown` (read-only) | ✅ Complete | - |
| `widgetState` | ✅ Implemented | ✅ `Record<string, unknown>` (read-only) | ✅ Complete | - |
| `toolResponseMetadata` | ⚠️ Non-standard | ❌ Not in spec | ⚠️ Unido-specific extension | Low |
| **State Methods** |
| `setWidgetState` | ✅ Implemented | ✅ `(state) => Promise<void>` | ⚠️ Return type should be Promise | Medium |
| **Tool Methods** |
| `callTool` | ✅ Implemented | ✅ `(name, args) => Promise<{ result }>` | ⚠️ Return type incomplete | Medium |
| **Communication Methods** |
| `sendFollowupTurn` | ❌ Not implemented | ✅ `(request) => Promise<void>` | ❌ Missing | Medium |
| `requestDisplayMode` | ❌ Not implemented | ✅ `(request) => Promise<{ mode }>` | ❌ Missing | High |
| `openExternal` | ❌ Not implemented | ✅ `(request) => void` | ❌ Missing | Low |
| **Layout & Context Properties** |
| `displayMode` | ❌ Not implemented | ✅ `'inline' \| 'pip' \| 'fullscreen'` | ❌ Missing | High |
| `maxHeight` | ❌ Not implemented | ✅ `number` (pixels) | ❌ Missing | High |
| `locale` | ❌ Not implemented | ✅ `string` (BCP 47) | ❌ Missing | Medium |
| `theme` | ❌ Not implemented | ✅ `'light' \| 'dark'` | ❌ Missing | High |
| **Window Events** |
| `openai:set_globals` | ❌ Not implemented | ✅ CustomEvent | ❌ Missing | Medium |
| `openai:tool_response` | ❌ Not implemented | ✅ CustomEvent | ❌ Missing | Medium |

---

## Gap Analysis by Category

### 1. Core Data Access ✅ Complete

**Current Implementation**: Fully functional

- ✅ `toolInput` - Access to tool parameters
- ✅ `toolOutput` - Access to structured content
- ✅ `widgetState` - Access to persisted state

**Status**: No changes needed for core functionality.

**Usage in Unido**:

```typescript
// Current pattern (works correctly)
const toolOutput = window.openai?.toolOutput as ComponentProps | undefined;
```

---

### 2. State Management ⚠️ Minor Issues

**Current Implementation**: Mostly correct

```typescript
// Current: setWidgetState returns void
setWidgetState?: (state: Record<string, unknown>) => void;

// Spec: setWidgetState returns Promise<void>
setWidgetState?(state: Record<string, unknown>): Promise<void>;
```

**Gap**: Return type should be `Promise<void>` for async operations.

**Impact**: Medium - Components expecting promise-based confirmation will fail.

**Recommendation**: Update return type to `Promise<void>` in TypeScript definitions.

**Migration**:

```typescript
// Before (current)
window.openai?.setWidgetState?.({ favorites: [] });

// After (correct)
await window.openai?.setWidgetState?.({ favorites: [] });
```

---

### 3. Tool Invocation ⚠️ Incomplete Return Type

**Current Implementation**: Functional but incomplete

```typescript
// Current: callTool returns Promise<unknown>
callTool?: (name: string, args: unknown) => Promise<unknown>;

// Spec: callTool returns Promise<{ result: unknown }>
callTool?(name: string, args: unknown): Promise<{ result: unknown }>;
```

**Gap**: Return value should be wrapped in `{ result }` object.

**Impact**: Medium - Components expecting specific return format may break.

**Recommendation**: Update return type and ensure ChatGPT bridge returns correct format.

**Migration**:

```typescript
// Before (current - may not work)
const data = await window.openai?.callTool?.('get_data', { id: 123 });

// After (correct)
const response = await window.openai?.callTool?.('get_data', { id: 123 });
const data = response?.result;
```

---

### 4. Communication Methods ❌ Missing

**Missing APIs**:

1. **`sendFollowupTurn`** - Insert message into conversation
2. **`requestDisplayMode`** - Request layout change
3. **`openExternal`** - Open external links

**Impact**: High - Limits widget interactivity and UX capabilities.

**Use Cases Blocked**:

- ❌ Widgets cannot send follow-up questions to ChatGPT
- ❌ Widgets cannot request fullscreen/PiP mode
- ❌ Widgets cannot open external documentation links

**Example Use Cases**:

```typescript
// Cannot do this currently:
await window.openai?.sendFollowupTurn?.({
  prompt: 'Show me more results'
});

// Cannot do this currently:
await window.openai?.requestDisplayMode?.({ mode: 'fullscreen' });

// Cannot do this currently:
window.openai?.openExternal?.({ href: 'https://docs.example.com' });
```

**Recommendation**: Implement all three methods for feature parity with OpenAI Apps SDK.

---

### 5. Layout & Context Properties ❌ Critical Missing Features

**Missing Properties**:

1. **`displayMode`** - Current layout mode
2. **`maxHeight`** - Height constraint
3. **`theme`** - Light/dark theme
4. **`locale`** - User's locale

**Impact**: High - Widgets cannot adapt to display context.

**Problems Caused**:

- ❌ Widgets cannot optimize layout for inline vs fullscreen
- ❌ Widgets cannot respect height constraints (may clip)
- ❌ Widgets cannot match ChatGPT theme (poor UX)
- ❌ Widgets cannot localize content

**Example Impact**:

```typescript
// Currently impossible - widgets can't adapt:
const isFullscreen = window.openai?.displayMode === 'fullscreen';

if (isFullscreen) {
  // Show detailed view
} else {
  // Show compact view
}

// Currently impossible - widgets ignore max height:
<div style={{ maxHeight: `${window.openai?.maxHeight}px` }}>
  {/* Content may overflow */}
</div>

// Currently impossible - widgets can't match theme:
const isDark = window.openai?.theme === 'dark';
<div className={isDark ? 'dark' : 'light'}>
  {/* Always looks wrong in one mode */}
</div>
```

**Recommendation**: **High priority** - Implement these properties to enable responsive, theme-aware widgets.

---

### 6. Window Events ❌ No Reactive Updates

**Missing Events**:

1. **`openai:set_globals`** - Fired when any global changes
2. **`openai:tool_response`** - Fired after callTool completes

**Impact**: Medium - Widgets cannot react to environment changes.

**Problems Caused**:

- ❌ Widgets don't know when theme changes (e.g., user switches dark mode)
- ❌ Widgets don't know when display mode changes
- ❌ Widgets don't get notified of tool call completion
- ❌ Must poll or re-render to detect changes

**Example Use Cases**:

```typescript
// Currently impossible - can't react to theme changes:
window.addEventListener('openai:set_globals', (event) => {
  if (event.detail.theme) {
    updateTheme(event.detail.theme);
  }
});

// Currently impossible - can't track tool call state:
window.addEventListener('openai:tool_response', (event) => {
  console.log('Tool completed:', event.detail.name);
  setLoading(false);
});
```

**Recommendation**: Medium priority - Implement events for better reactive behavior.

---

### 7. Non-Standard Extensions ⚠️

**Current Non-Standard Property**:

```typescript
toolResponseMetadata?: Record<string, unknown>;
```

**Status**: Not in OpenAI Apps SDK specification.

**Analysis**:

- May be Unido-specific extension
- Not documented in usage
- Not used in examples

**Recommendation**:

1. Document if intentionally Unido-specific
2. Remove if unused/redundant
3. Consider mapping to standard `_meta` field from tool responses

---

## Feature Parity Roadmap

### Phase 1: Critical Missing Features (High Priority)

**Goal**: Enable responsive, theme-aware widgets

**Timeline**: 1-2 weeks

**Tasks**:

1. ✅ Add `displayMode` property
2. ✅ Add `maxHeight` property
3. ✅ Add `theme` property
4. ✅ Implement `requestDisplayMode` method
5. ✅ Add `openai:set_globals` event
6. ✅ Update TypeScript definitions
7. ✅ Create usage examples

**Impact**: Widgets can adapt layout and match theme.

**Blockers**: Requires ChatGPT bridge support (may already exist).

---

### Phase 2: Enhanced Interactivity (Medium Priority)

**Goal**: Enable richer widget interactions

**Timeline**: 1 week

**Tasks**:

1. ✅ Implement `sendFollowupTurn` method
2. ✅ Implement `openExternal` method
3. ✅ Add `openai:tool_response` event
4. ✅ Fix `callTool` return type
5. ✅ Fix `setWidgetState` return type
6. ✅ Update examples

**Impact**: Widgets can send messages and open links.

**Blockers**: Requires MCP protocol extensions.

---

### Phase 3: Internationalization (Medium Priority)

**Goal**: Support localized widgets

**Timeline**: 3-5 days

**Tasks**:

1. ✅ Add `locale` property
2. ✅ Create localization guide
3. ✅ Add i18n example widget
4. ✅ Update documentation

**Impact**: Widgets can format dates, numbers, and currencies correctly.

**Blockers**: Need to detect user locale from ChatGPT.

---

### Phase 4: Cleanup & Documentation (Low Priority)

**Goal**: Remove non-standard extensions, complete docs

**Timeline**: 2-3 days

**Tasks**:

1. ✅ Evaluate `toolResponseMetadata` usage
2. ✅ Remove or document non-standard properties
3. ✅ Add comprehensive testing guide
4. ✅ Create migration guide for widgets
5. ✅ Add troubleshooting section

**Impact**: Better developer experience, fewer surprises.

---

## Migration Guide (For Future Implementation)

### Updating Existing Widgets

When new properties are added, existing widgets should check for availability:

```typescript
// Defensive coding - works with current and future API
function WeatherWidget() {
  // Check for new properties
  const displayMode = window.openai?.displayMode ?? 'inline';
  const maxHeight = window.openai?.maxHeight ?? 500;
  const theme = window.openai?.theme ?? 'light';

  // Adapt layout
  return (
    <div
      className={theme}
      style={{
        height: displayMode === 'fullscreen' ? '100vh' : '400px',
        maxHeight: `${maxHeight}px`
      }}
    >
      <WeatherDisplay />
    </div>
  );
}
```

---

### Handling Missing Methods

```typescript
// Gracefully degrade when methods unavailable
const requestFullscreen = async () => {
  if (window.openai?.requestDisplayMode) {
    await window.openai.requestDisplayMode({ mode: 'fullscreen' });
  } else {
    console.warn('Display mode requests not supported');
  }
};
```

---

### Event Listeners with Fallbacks

```typescript
// Listen for events if available, poll if not
useEffect(() => {
  if (typeof window.addEventListener === 'function') {
    const handler = (event: CustomEvent) => {
      setTheme(event.detail.theme);
    };

    window.addEventListener('openai:set_globals', handler);
    return () => window.removeEventListener('openai:set_globals', handler);
  } else {
    // Fallback: check on interval
    const interval = setInterval(() => {
      const currentTheme = window.openai?.theme;
      if (currentTheme !== theme) {
        setTheme(currentTheme);
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}, []);
```

---

## Testing Strategy

### Unit Tests Needed

1. **Type checking**: Ensure TypeScript definitions match spec
2. **Runtime validation**: Check properties exist and have correct types
3. **Method behavior**: Test promise resolution, error handling
4. **Event dispatching**: Verify events fire with correct detail

### Integration Tests Needed

1. **Theme switching**: Widget adapts when theme changes
2. **Display mode changes**: Widget responds to inline ↔ fullscreen
3. **Tool calls**: Verify callTool works end-to-end
4. **State persistence**: Verify setWidgetState/widgetState roundtrip

### Example Test Cases

```typescript
describe('window.openai API', () => {
  it('should have toolOutput available', () => {
    expect(window.openai?.toolOutput).toBeDefined();
  });

  it('should persist state with setWidgetState', async () => {
    const state = { test: true };
    await window.openai?.setWidgetState?.(state);

    // After re-render
    expect(window.openai?.widgetState).toEqual(state);
  });

  it('should fire openai:set_globals on theme change', (done) => {
    window.addEventListener('openai:set_globals', (event) => {
      expect(event.detail.theme).toBe('dark');
      done();
    });

    // Simulate theme change from host
    simulateThemeChange('dark');
  });
});
```

---

## Appendix: Complete Specification Reference

For the complete specification, see:

1. **API Documentation**: [WINDOW_OPENAI_API.md](./WINDOW_OPENAI_API.md)
2. **TypeScript Definitions**: [`packages/dev/src/types/window-openai.ts`](../../../packages/dev/src/types/window-openai.ts)
3. **OpenAI Official Docs**: https://developers.openai.com/apps-sdk/reference
4. **Context7 Library**: `/websites/developers_openai_apps-sdk`

---

## Summary Table: Implementation Status

| Category | Implemented | Partial | Missing | Total Coverage |
|----------|-------------|---------|---------|----------------|
| Data Properties | 3/3 | 0/3 | 0/3 | 100% ✅ |
| State Methods | 1/1 | 0/1 | 0/1 | 100% ✅ |
| Tool Methods | 1/1 | 0/1 | 0/1 | 100% ✅ |
| Communication Methods | 0/3 | 0/3 | 3/3 | 0% ❌ |
| Layout & Context | 0/4 | 0/4 | 4/4 | 0% ❌ |
| Window Events | 0/2 | 0/2 | 2/2 | 0% ❌ |
| **TOTAL** | **5/14** | **0/14** | **9/14** | **36%** |

---

## Conclusion

Unido's current `window.openai` implementation covers the **core data access** functionality (36% complete) but is missing critical features for **responsive layouts**, **theming**, and **enhanced interactivity**.

### Immediate Next Steps

1. **Week 1-2**: Implement layout properties (displayMode, maxHeight, theme) - **High Priority**
2. **Week 3**: Implement communication methods (sendFollowupTurn, requestDisplayMode) - **Medium Priority**
3. **Week 4**: Add window events and locale support - **Medium Priority**
4. **Week 5**: Testing, documentation, and examples - **Required**

### Expected Outcome

After implementing all missing features, Unido widgets will:

- ✅ Adapt layout based on display context
- ✅ Match ChatGPT's theme automatically
- ✅ Respect height constraints
- ✅ Send follow-up messages
- ✅ Request fullscreen mode
- ✅ React to environment changes
- ✅ Support internationalization

This will bring Unido to **100% feature parity** with the OpenAI Apps SDK specification.

---

**Document Version**: 1.0.0
**Last Updated**: 2025-01-17
**Comparison Baseline**: Unido v0.6.x vs OpenAI Apps SDK Preview (October 2024)
