# Loading and Error States for Widgets

This guide explains how to use loading and error states in your Unido applications to provide better user experience during async operations and error scenarios.

## Overview

Unido provides built-in support for loading and error states through:

1. **Standard Components**: `LoadingSpinner`, `LoadingSkeleton`, and `ErrorCard` from `@bandofai/unido-components`
2. **Response Helpers**: `loadingResponse()` and `errorComponentResponse()` functions
3. **Component Options**: Specify loading/error components in `componentResponse()`

## Standard Components

### LoadingSpinner

A simple animated spinner for loading states.

```tsx
import { LoadingSpinner } from '@bandofai/unido-components';

<LoadingSpinner size="md" message="Loading weather data..." />
```

**Props:**
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `message`: Optional loading message

### LoadingSkeleton

A skeleton placeholder for content that's loading.

```tsx
import { LoadingSkeleton } from '@bandofai/unido-components';

<LoadingSkeleton lines={3} message="Fetching data..." />
```

**Props:**
- `lines`: Number of skeleton lines to display (default: `3`)
- `message`: Optional loading message

### ErrorCard

A styled error card for displaying error information.

```tsx
import { ErrorCard } from '@bandofai/unido-components';

<ErrorCard
  title="Network Error"
  message="Could not connect to server"
  code="ERR_NETWORK"
  details="Connection timeout after 30 seconds"
  onRetry={() => refetch()}
/>
```

**Props:**
- `title`: Error title (default: `'Error'`)
- `message`: Error message (required)
- `code`: Error code (optional)
- `details`: Additional error details (optional)
- `onRetry`: Retry callback (optional)

## Using Loading States

### 1. Simple Loading Response

Return a loading response directly from your tool handler:

```typescript
import { loadingResponse } from '@bandofai/unido-core';

app.tool('fetch_data', {
  description: 'Fetch data',
  input: z.object({ id: z.string() }),
  handler: async ({ id }) => {
    // Return loading state
    return loadingResponse('loading-spinner', {
      message: 'Fetching data...',
      size: 'lg'
    });
  }
});
```

### 2. Component with Loading State

Specify a loading component for async operations:

```typescript
import { componentResponse } from '@bandofai/unido-core';

app.tool('get_weather', {
  description: 'Get weather for a city',
  input: z.object({ city: z.string() }),
  handler: async ({ city }) => {
    const data = await fetchWeather(city); // Async operation

    return componentResponse(
      'weather-card',
      { city: data.city, temperature: data.temperature },
      `Weather in ${city}`,
      {
        loadingComponent: 'weather-card-loading',
        loadingProps: { city, message: 'Fetching weather...' }
      }
    );
  }
});
```

### 3. Custom Loading Component

Create your own loading component:

```tsx
// components/WeatherCardLoading.tsx
import type { FC } from 'react';
import { Card, CardContent, LoadingSkeleton } from '@bandofai/unido-components';

export interface WeatherCardLoadingProps {
  city?: string;
  message?: string;
}

export const WeatherCardLoading: FC<WeatherCardLoadingProps> = ({ city, message }) => {
  return (
    <Card>
      <CardContent>
        {city && <p>Loading weather for {city}...</p>}
        <LoadingSkeleton lines={3} message={message} />
      </CardContent>
    </Card>
  );
};
```

Register it:

```typescript
app.component({
  type: 'weather-card-loading',
  title: 'Weather Card Loading',
  description: 'Loading state for weather card',
  sourcePath: resolveComponentPath('components/WeatherCardLoading.tsx')
});
```

## Using Error States

### 1. Simple Error Response

Return an error response with a component:

```typescript
import { errorComponentResponse } from '@bandofai/unido-core';

app.tool('fetch_data', {
  description: 'Fetch data',
  input: z.object({ id: z.string() }),
  handler: async ({ id }) => {
    try {
      const data = await fetchData(id);
      return componentResponse('data-card', data);
    } catch (error) {
      return errorComponentResponse(
        'Failed to fetch data',
        'error-card',
        {
          code: 'ERR_FETCH_FAILED',
          details: error.message
        }
      );
    }
  }
});
```

### 2. Component with Error State

Specify an error component for error scenarios:

```typescript
app.tool('get_weather', {
  description: 'Get weather for a city',
  input: z.object({ city: z.string() }),
  handler: async ({ city }) => {
    try {
      const data = await fetchWeather(city);

      return componentResponse(
        'weather-card',
        data,
        `Weather in ${city}`,
        {
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
});
```

### 3. Custom Error Component

Create your own error component:

```tsx
// components/WeatherCardError.tsx
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@bandofai/unido-components';

export interface WeatherCardErrorProps {
  city?: string;
  error: string;
  code?: string;
}

export const WeatherCardError: FC<WeatherCardErrorProps> = ({ city, error, code }) => {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Weather Error</CardTitle>
        {city && <p>Could not fetch weather for {city}</p>}
      </CardHeader>
      <CardContent>
        <p>{error}</p>
        {code && <p className="text-xs text-muted-foreground">{code}</p>}
      </CardContent>
    </Card>
  );
};
```

Register it:

```typescript
app.component({
  type: 'weather-card-error',
  title: 'Weather Card Error',
  description: 'Error state for weather card',
  sourcePath: resolveComponentPath('components/WeatherCardError.tsx')
});
```

## Complete Example

Here's a complete example demonstrating both loading and error states:

```typescript
import { createApp, componentResponse, errorComponentResponse } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';

const app = createApp({
  name: 'my-app',
  providers: { openai: openAI({ port: 3000 }) }
});

// Register components
app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Displays weather information',
  sourcePath: './components/WeatherCard.tsx'
});

app.component({
  type: 'weather-card-loading',
  title: 'Weather Card Loading',
  description: 'Loading state',
  sourcePath: './components/WeatherCardLoading.tsx'
});

app.component({
  type: 'weather-card-error',
  title: 'Weather Card Error',
  description: 'Error state',
  sourcePath: './components/WeatherCardError.tsx'
});

// Register tool with loading and error states
app.tool('get_weather', {
  description: 'Get weather for a city',
  input: z.object({
    city: z.string(),
    simulateError: z.boolean().optional()
  }),
  handler: async ({ city, simulateError }) => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate error
    if (simulateError) {
      return errorComponentResponse(
        `Failed to fetch weather for ${city}`,
        'weather-card-error',
        {
          city,
          error: 'Weather service unavailable',
          code: 'ERR_SERVICE_DOWN'
        }
      );
    }

    // Fetch data
    const data = await fetchWeather(city);

    return componentResponse(
      'weather-card',
      data,
      `Weather in ${city}`,
      {
        loadingComponent: 'weather-card-loading',
        loadingProps: { city, message: 'Fetching weather...' },
        errorComponent: 'weather-card-error',
        errorProps: { city }
      }
    );
  }
});

await app.listen();
```

## Best Practices

### 1. Use Specific Loading Messages

Provide context about what's loading:

```typescript
// ❌ Generic
loadingResponse('loading-spinner', { message: 'Loading...' });

// ✅ Specific
loadingResponse('loading-spinner', { message: 'Fetching weather data for Portland...' });
```

### 2. Provide Error Details

Include helpful error information:

```typescript
// ❌ Vague
errorComponentResponse('Error occurred');

// ✅ Detailed
errorComponentResponse(
  'Failed to fetch weather data',
  'error-card',
  {
    code: 'ERR_API_TIMEOUT',
    details: 'Weather API took longer than 30 seconds to respond'
  }
);
```

### 3. Match Loading/Error Components to Main Component

Keep UI consistent by creating matching loading/error states:

```
weather-card
├── weather-card-loading  (matches layout)
└── weather-card-error     (matches layout)
```

### 4. Handle Errors Gracefully

Always catch errors and return user-friendly messages:

```typescript
handler: async ({ city }) => {
  try {
    const data = await fetchWeather(city);
    return componentResponse('weather-card', data);
  } catch (error) {
    // Don't let errors crash - return error component
    return errorComponentResponse(
      'Could not load weather data',
      'weather-card-error',
      { city, error: error.message }
    );
  }
}
```

## API Reference

### `componentResponse(type, props, textFallback?, options?)`

Create a response with a component, optionally specifying loading and error states.

**Parameters:**
- `type`: Component type name
- `props`: Component props
- `textFallback`: Optional text fallback for non-UI contexts
- `options`: Optional configuration
  - `loadingComponent`: Component to show during loading
  - `loadingProps`: Props for loading component
  - `errorComponent`: Component to show on error
  - `errorProps`: Props for error component

**Returns:** `UniversalResponse`

### `loadingResponse(componentType?, props?)`

Create a loading response.

**Parameters:**
- `componentType`: Component type (default: `'loading-spinner'`)
- `props`: Component props

**Returns:** `UniversalResponse`

### `errorComponentResponse(message, componentType?, props?)`

Create an error response with a component.

**Parameters:**
- `message`: Error message
- `componentType`: Component type (default: `'error-card'`)
- `props`: Component props (merged with `{ message }`)

**Returns:** `UniversalResponse`

## See Also

- [Component System](./components.md)
- [Response Helpers](./responses.md)
- [Weather App Example](../../examples/weather-app/)
