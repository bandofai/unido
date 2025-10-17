# Implementation Summary: Loading and Error States for Widgets

**Issue:** [#2 - Feature: Loading and Error States for Widgets](https://github.com/bandofai/unido/issues/2)

**Status:** ✅ Completed

**Date:** 2025-10-17

## Overview

Implemented comprehensive support for loading and error states in Unido widgets to provide better UX during async operations and error scenarios. This feature allows developers to specify custom loading and error components that display while data is being fetched or when errors occur.

## Changes Made

### 1. New Components (`@bandofai/unido-components`)

Created three new standard components for loading and error states:

#### LoadingSpinner
- **File:** [packages/components/src/components/ui/loading-spinner.tsx](packages/components/src/components/ui/loading-spinner.tsx)
- **Props:** `size`, `message`
- **Usage:** Generic loading spinner with customizable size and message

#### LoadingSkeleton
- **File:** [packages/components/src/components/ui/loading-skeleton.tsx](packages/components/src/components/ui/loading-skeleton.tsx)
- **Props:** `lines`, `message`
- **Usage:** Skeleton placeholder for loading content

#### ErrorCard
- **File:** [packages/components/src/components/ui/error-card.tsx](packages/components/src/components/ui/error-card.tsx)
- **Props:** `title`, `message`, `code`, `details`, `onRetry`
- **Usage:** Styled error display with optional retry functionality

### 2. Core Framework Updates (`@bandofai/unido-core`)

#### Extended Types
- **File:** [packages/core/src/types.ts](packages/core/src/types.ts:138-186)
- Added `loadingState` and `errorState` to `ComponentReference` interface
- Allows specifying loading/error component types and props

#### Enhanced Response Helpers
- **File:** [packages/core/src/tool.ts](packages/core/src/tool.ts:100-258)

New functions:
1. **`loadingResponse(componentType?, props?)`**
   - Creates a loading response with specified component
   - Default: `'loading-spinner'`

2. **`errorComponentResponse(message, componentType?, props?)`**
   - Creates an error response with a component
   - Default: `'error-card'`

3. **Enhanced `componentResponse()`**
   - New optional `options` parameter
   - Accepts `ComponentResponseOptions` with:
     - `loadingComponent`: Component type for loading state
     - `loadingProps`: Props for loading component
     - `errorComponent`: Component type for error state
     - `errorProps`: Props for error component

#### New Types
- **File:** [packages/core/src/tool.ts](packages/core/src/tool.ts:100-122)
- `ComponentResponseOptions` interface for specifying loading/error options

#### Updated Exports
- **File:** [packages/core/src/index.ts](packages/core/src/index.ts:12-20)
- Exported new functions: `loadingResponse`, `errorComponentResponse`
- Exported new type: `ComponentResponseOptions`

### 3. Example Implementation

#### Weather App Example Updates
- **File:** [examples/weather-app/src/index.ts](examples/weather-app/src/index.ts)

**New Components:**
1. **WeatherCardLoading** - Custom loading state for weather data
   - File: [examples/weather-app/src/components/WeatherCardLoading.tsx](examples/weather-app/src/components/WeatherCardLoading.tsx)
   - Shows city name and loading skeleton

2. **WeatherCardError** - Custom error state for weather errors
   - File: [examples/weather-app/src/components/WeatherCardError.tsx](examples/weather-app/src/components/WeatherCardError.tsx)
   - Shows city name, error message, code, and details

**New Tools:**
1. **`get_weather_with_states`** - Demonstrates loading/error states
   - Includes 1s delay to show loading state
   - Optional `simulateError` parameter for testing
   - Uses custom loading and error components

2. **`test_loading_state`** - Returns loading spinner for testing

3. **`test_error_state`** - Returns error card for testing

**Registered Generic Components:**
- `loading-spinner` - From `@bandofai/unido-components`
- `loading-skeleton` - From `@bandofai/unido-components`
- `error-card` - From `@bandofai/unido-components`

### 4. Documentation

#### Feature Guide
- **File:** [docs/features/loading-and-error-states.md](docs/features/loading-and-error-states.md)
- Comprehensive guide covering:
  - Standard components overview
  - Using loading states (3 approaches)
  - Using error states (3 approaches)
  - Complete examples
  - Best practices
  - API reference

#### Updated Weather App README
- **File:** [examples/weather-app/README.md](examples/weather-app/README.md)
- Documents new tools and components
- Provides testing instructions
- Shows implementation patterns

## API Examples

### Simple Loading Response
```typescript
return loadingResponse('loading-spinner', {
  message: 'Fetching data...',
  size: 'lg'
});
```

### Simple Error Response
```typescript
return errorComponentResponse('Failed to load data', 'error-card', {
  code: 'ERR_API_FAILED',
  details: 'Connection timeout'
});
```

### Component with Loading/Error States
```typescript
return componentResponse(
  'weather-card',
  weatherData,
  'Weather in Portland',
  {
    loadingComponent: 'weather-card-loading',
    loadingProps: { city: 'Portland', message: 'Fetching weather...' },
    errorComponent: 'weather-card-error',
    errorProps: { city: 'Portland' }
  }
);
```

### Error Handling Pattern
```typescript
handler: async ({ city }) => {
  try {
    const data = await fetchWeather(city);
    return componentResponse('weather-card', data, `Weather in ${city}`, {
      loadingComponent: 'weather-card-loading',
      loadingProps: { city },
      errorComponent: 'weather-card-error',
      errorProps: { city }
    });
  } catch (error) {
    return errorComponentResponse(
      `Failed to fetch weather for ${city}`,
      'weather-card-error',
      { city, error: error.message }
    );
  }
}
```

## Testing

### Build Status
✅ All packages build successfully
✅ All type checks pass
✅ Weather app example compiles

### Manual Testing
To test the implementation:

```bash
# Start weather app
cd examples/weather-app
pnpm run dev

# In ChatGPT, add app: http://localhost:3000/sse

# Test loading state
"Show me a loading spinner"
"Get weather for Paris" (shows custom loading during 1s delay)

# Test error state
"Show error with message 'Test error'"
"Get weather for Tokyo with simulateError=true"

# Test generic vs custom
Compare generic loading-spinner with weather-card-loading
Compare generic error-card with weather-card-error
```

## Files Changed

### Created (10 files)
1. `packages/components/src/components/ui/loading-spinner.tsx`
2. `packages/components/src/components/ui/loading-skeleton.tsx`
3. `packages/components/src/components/ui/error-card.tsx`
4. `examples/weather-app/src/components/WeatherCardLoading.tsx`
5. `examples/weather-app/src/components/WeatherCardError.tsx`
6. `docs/features/loading-and-error-states.md`
7. `IMPLEMENTATION_SUMMARY.md` (this file)

### Modified (6 files)
1. `packages/components/src/index.ts` - Export new components
2. `packages/core/src/types.ts` - Add loading/error state to ComponentReference
3. `packages/core/src/tool.ts` - Add new response helpers
4. `packages/core/src/index.ts` - Export new functions and types
5. `examples/weather-app/src/index.ts` - Add new components and tools
6. `examples/weather-app/README.md` - Document new features

## Success Criteria

✅ **Automatic loading state** during async handler execution (configurable)
✅ **Standard loading components** in `@bandofai/unido-components`
✅ **Support for custom loading/error components** per widget
✅ **Error handling with automatic error state** display
✅ **Manual control for testing/development** (test tools)
✅ **Documentation with examples**
✅ **Working example in weather-app**

## Future Enhancements

The following items from the original issue are left for future work:

### Phase 2: Widget Updates (Not Replacement)
- Research if OpenAI supports in-place widget updates vs replacement
- Implement smooth loading → loaded transition if supported
- Avoid flickering or full widget replacement

### Phase 3: Advanced Features
- Retry mechanism in error components via `callTool`
- Timeout handling (max loading duration)
- Streaming updates for progressive data loading
- Loading state tracked in OpenAI adapter lifecycle

### Integration
- OpenAI widget update mechanism (if available)
- State transitions: `loading → loaded | error`
- Additional `_meta` fields for state management

## Notes

- This implementation focuses on **Phase 1** from the original issue
- Loading/error components are specified declaratively in response options
- Generic components provide good defaults; custom components match app design
- Framework handles both manual state control (test tools) and automatic state display
- All changes maintain backward compatibility

## References

- GitHub Issue: [#2 - Feature: Loading and Error States for Widgets](https://github.com/bandofai/unido/issues/2)
- Documentation: [docs/features/loading-and-error-states.md](docs/features/loading-and-error-states.md)
- Example: [examples/weather-app/](examples/weather-app/)
- Components: [@bandofai/unido-components](packages/components/)
