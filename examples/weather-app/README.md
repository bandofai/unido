# Weather App Example

A complete Unido application demonstrating multi-provider support, component-based UI, and **loading/error states** (NEW!).

## Features

- ✅ OpenAI ChatGPT integration via MCP
- ✅ Type-safe tool definitions with Zod schemas
- ✅ React components for rich UI
- ✅ **Loading states** - Custom loading components (NEW!)
- ✅ **Error states** - Custom error handling with UI (NEW!)
- ✅ Multiple tools with different response types
- ✅ Hot reload development

## Quick Start

```bash
# Install dependencies (from root)
pnpm install

# Run dev server
cd examples/weather-app
pnpm dev
```

Then in ChatGPT:
1. Go to Settings → Apps → Add App
2. Enter: `http://localhost:3000/sse`
3. Try: "What's the weather in Portland?"

## Project Structure

```
weather-app/
├── src/
│   ├── components/
│   │   ├── WeatherCard.tsx           # Main weather display
│   │   ├── WeatherCardLoading.tsx    # Loading state (NEW!)
│   │   └── WeatherCardError.tsx      # Error state (NEW!)
│   └── index.ts                       # App with tools + components
├── package.json
└── tsconfig.json
```

## Tools Available

### `get_weather`

Basic weather tool that returns a weather card component.

**Parameters:**
- `city` (string): City name
- `units` ('celsius' | 'fahrenheit'): Temperature units

**Example:**
```
What's the weather in London?
```

### `get_weather_with_states` (NEW!)

Enhanced weather tool demonstrating loading and error states.

**Parameters:**
- `city` (string): City name
- `units` ('celsius' | 'fahrenheit'): Temperature units
- `simulateError` (boolean, optional): Simulate an error for testing

**Features:**
- Shows loading component during API call (1s delay)
- Shows error component if API fails
- Demonstrates custom loading/error states

**Examples:**
```
Get weather for Paris (watch for loading state!)
Get weather for Tokyo with simulateError=true (test error state)
```

### `test_loading_state` (NEW!)

Returns a loading spinner to test loading UI.

**Parameters:**
- `message` (string, optional): Loading message

**Example:**
```
Show me a loading spinner with message "Fetching data..."
```

### `test_error_state` (NEW!)

Returns an error card to test error UI.

**Parameters:**
- `errorMessage` (string): Error message to display
- `code` (string, optional): Error code

**Example:**
```
Show error state with message "API timeout" and code "ERR_TIMEOUT"
```

### `search_cities`

Simple text-based city search tool.

**Parameters:**
- `query` (string): Search query

**Example:**
```
Search cities matching "New"
```

## Components

### WeatherCard

Main component displaying weather information:
- Temperature with units
- Weather condition
- Humidity percentage
- Last updated timestamp

### WeatherCardLoading (NEW!)

Custom loading state that shows:
- City name being loaded
- Skeleton placeholders for data
- Custom loading message

### WeatherCardError (NEW!)

Custom error state that shows:
- Error title and icon
- Error message
- Error code (if available)
- Technical details (expandable)

## Loading and Error States

This example demonstrates **Issue #2: Loading and Error States for Widgets**.

### Three Approaches Demonstrated:

#### 1. Generic Components

Using built-in components from `@bandofai/unido-components`:

```typescript
import { loadingResponse, errorComponentResponse } from '@bandofai/unido-core';

// Generic loading spinner
return loadingResponse('loading-spinner', {
  message: 'Loading data...',
  size: 'lg'
});

// Generic error card
return errorComponentResponse('Failed to load', 'error-card');
```

#### 2. Custom Components

Using custom components matching your main component's design:

```typescript
return componentResponse(
  'weather-card',
  weatherData,
  'Fallback text',
  {
    loadingComponent: 'weather-card-loading',
    loadingProps: { city: 'Portland', message: 'Fetching weather...' },
    errorComponent: 'weather-card-error',
    errorProps: { city: 'Portland' }
  }
);
```

#### 3. Error Handling Pattern

Recommended pattern for async operations:

```typescript
handler: async ({ city }) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = await fetchWeather(city);

    return componentResponse(
      'weather-card',
      data,
      `Weather in ${city}`,
      {
        loadingComponent: 'weather-card-loading',
        loadingProps: { city },
        errorComponent: 'weather-card-error',
        errorProps: { city }
      }
    );
  } catch (error) {
    return errorComponentResponse(
      `Failed to fetch weather for ${city}`,
      'weather-card-error',
      { city, error: error.message }
    );
  }
}
```

## Testing Loading and Error States

### Test Loading State

1. Call `test_loading_state` tool: "Show me a loading spinner"
2. Or call `get_weather_with_states`: "Get weather for Paris"
   - Includes 1s delay to demonstrate loading state

### Test Error State

1. Call `test_error_state` tool: "Show error with message 'Test error'"
2. Or call `get_weather_with_states` with error simulation:
   - "Get weather for Tokyo with simulateError=true"

### Compare Generic vs Custom States

```
# Generic loading
Show me a loading spinner

# Custom loading
Get weather for Paris with states

# Generic error
Show error state with message "Test error"

# Custom error
Get weather for Tokyo with simulateError=true
```

## Architecture

The app uses:
- `@bandofai/unido-core` - Core framework with loading/error helpers
- `@bandofai/unido-provider-openai` - OpenAI adapter
- `@bandofai/unido-components` - UI components (LoadingSpinner, ErrorCard, etc.)
- `@bandofai/unido-dev` - Dev server with hot reload

## Learn More

- [Unido Documentation](../../README.md)
- [Loading and Error States Guide](../../docs/features/loading-and-error-states.md)
- [OpenAI Integration](../../docs/providers/openai/OPENAI_APPS_SDK.md)
- [GitHub Issue #2](https://github.com/bandofai/unido/issues/2)

## Extensibility

The Unido framework is designed to support multiple AI platforms. Currently, OpenAI is fully supported, and the architecture allows for easy addition of new providers in the future.
