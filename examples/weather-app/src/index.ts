/**
 * Example Weather App using Unido
 * Demonstrates multi-provider support with the new declarative API
 */

import { fileURLToPath } from 'node:url';
import {
  componentResponse,
  createApp,
  errorComponentResponse,
  loadingResponse,
  textResponse,
} from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';
import type { WeatherCardProps } from './components/WeatherCard.js';

// ============================================================================
// Mock Weather API
// ============================================================================

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  units: 'celsius' | 'fahrenheit';
  updatedAt: string;
}

async function fetchWeather(city: string, units: 'celsius' | 'fahrenheit'): Promise<WeatherData> {
  // Mock data - in real app, this would call a weather API
  const baseTemp = units === 'celsius' ? 22 : 72;

  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'];
  const conditionIndex = Math.floor(Math.random() * 4);

  return {
    city,
    temperature: baseTemp + Math.random() * 10,
    condition: conditions[conditionIndex] || 'Sunny',
    humidity: 60 + Math.random() * 30,
    units,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Create Unido App
// ============================================================================

export const app = createApp({
  name: 'weather-app',
  version: '1.0.0',
  providers: {
    // ✅ NEW: Declarative provider configuration with factory function
    openai: openAI({ port: 3000 }),
  },
});

// ============================================================================
// Register Components
// ============================================================================

const weatherCardPath = fileURLToPath(new URL('./components/WeatherCard.tsx', import.meta.url));
const weatherCardLoadingPath = fileURLToPath(
  new URL('./components/WeatherCardLoading.tsx', import.meta.url)
);
const weatherCardErrorPath = fileURLToPath(
  new URL('./components/WeatherCardError.tsx', import.meta.url)
);

app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Displays temperature, condition, and humidity for a city.',
  sourcePath: weatherCardPath,
  propsSchema: {
    city: {
      type: 'string',
      required: true,
      description: 'City name',
    },
    temperature: {
      type: 'number',
      required: true,
      description: 'Temperature value',
    },
    condition: {
      type: 'string',
      required: true,
      description: 'Weather condition (e.g., Sunny, Cloudy)',
    },
    humidity: {
      type: 'number',
      required: true,
      description: 'Humidity percentage',
    },
    units: {
      type: 'enum',
      required: true,
      enumValues: ['celsius', 'fahrenheit'],
      defaultValue: 'celsius',
      description: 'Temperature units',
    },
    updatedAt: {
      type: 'string',
      required: false,
      description: 'ISO timestamp of last update',
    },
  },
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,
      },
    },
  },
});

app.component({
  type: 'weather-card-loading',
  title: 'Weather Card Loading',
  description: 'Loading state for weather card.',
  sourcePath: weatherCardLoadingPath,
});

app.component({
  type: 'weather-card-error',
  title: 'Weather Card Error',
  description: 'Error state for weather card.',
  sourcePath: weatherCardErrorPath,
});

// Generic loading and error components from @bandofai/unido-components
// These are automatically available as fallbacks
app.component({
  type: 'loading-spinner',
  title: 'Loading Spinner',
  description: 'Generic loading spinner component.',
  sourcePath: fileURLToPath(
    new URL(
      '../../node_modules/@bandofai/unido-components/dist/components/ui/loading-spinner.js',
      import.meta.url
    )
  ),
});

app.component({
  type: 'loading-skeleton',
  title: 'Loading Skeleton',
  description: 'Generic loading skeleton component.',
  sourcePath: fileURLToPath(
    new URL(
      '../../node_modules/@bandofai/unido-components/dist/components/ui/loading-skeleton.js',
      import.meta.url
    )
  ),
});

app.component({
  type: 'error-card',
  title: 'Error Card',
  description: 'Generic error card component.',
  sourcePath: fileURLToPath(
    new URL(
      '../../node_modules/@bandofai/unido-components/dist/components/ui/error-card.js',
      import.meta.url
    )
  ),
});

// ============================================================================
// Register Tools
// ============================================================================

app.tool('get_weather', {
  title: 'Get Weather',
  description: 'Get current weather for a city',
  input: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius').describe('Temperature units'),
  }),
  handler: async ({ city, units }) => {
    const resolvedUnits = units ?? 'celsius';
    const data = await fetchWeather(city, resolvedUnits);

    const cardProps: WeatherCardProps = {
      city: data.city,
      temperature: data.temperature,
      condition: data.condition,
      humidity: data.humidity,
      units: resolvedUnits,
      updatedAt: data.updatedAt,
    };

    return componentResponse(
      'weather-card',
      cardProps as unknown as Record<string, unknown>,
      `Weather in ${city}: ${Math.round(data.temperature)}°${resolvedUnits === 'celsius' ? 'C' : 'F'}, ${data.condition}`
    );
  },
});

app.tool('search_cities', {
  title: 'Search Cities',
  description: 'Search for cities by name',
  input: z.object({
    query: z.string().describe('Search query'),
  }),
  handler: async ({ query }) => {
    // Mock city search
    const cities = [
      'New York',
      'London',
      'Tokyo',
      'Paris',
      'Sydney',
      'Berlin',
      'Toronto',
      'Mumbai',
    ].filter((city) => city.toLowerCase().includes(query.toLowerCase()));

    return textResponse(`Found ${cities.length} cities matching "${query}":\n${cities.join(', ')}`);
  },
});

// ============================================================================
// Loading and Error State Examples
// ============================================================================

app.tool('get_weather_with_states', {
  title: 'Get Weather (with Loading/Error States)',
  description:
    'Demonstrates custom loading and error components. Simulates async data fetching.',
  input: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius').describe('Temperature units'),
    simulateError: z
      .boolean()
      .optional()
      .describe('Simulate an error to test error state'),
  }),
  handler: async ({ city, units, simulateError }) => {
    const resolvedUnits = units ?? 'celsius';

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate error if requested
    if (simulateError) {
      return errorComponentResponse(
        `Failed to fetch weather data for ${city}`,
        'weather-card-error',
        {
          city,
          error: 'The weather service is currently unavailable',
          code: 'ERR_SERVICE_UNAVAILABLE',
          details: 'Connection timeout after 30 seconds',
        }
      );
    }

    const data = await fetchWeather(city, resolvedUnits);

    const cardProps: WeatherCardProps = {
      city: data.city,
      temperature: data.temperature,
      condition: data.condition,
      humidity: data.humidity,
      units: resolvedUnits,
      updatedAt: data.updatedAt,
    };

    return componentResponse(
      'weather-card',
      cardProps as unknown as Record<string, unknown>,
      `Weather in ${city}: ${Math.round(data.temperature)}°${resolvedUnits === 'celsius' ? 'C' : 'F'}, ${data.condition}`,
      {
        // Specify custom loading component
        loadingComponent: 'weather-card-loading',
        loadingProps: { city, message: 'Fetching latest weather data...' },
        // Specify custom error component
        errorComponent: 'weather-card-error',
        errorProps: { city },
      }
    );
  },
});

app.tool('test_loading_state', {
  title: 'Test Loading State',
  description: 'Returns a loading spinner to test loading UI',
  input: z.object({
    message: z
      .string()
      .optional()
      .describe('Optional loading message'),
  }),
  handler: async ({ message }) => {
    return loadingResponse('loading-spinner', {
      message: message || 'Loading...',
      size: 'lg',
    });
  },
});

app.tool('test_error_state', {
  title: 'Test Error State',
  description: 'Returns an error card to test error UI',
  input: z.object({
    errorMessage: z.string().describe('Error message to display'),
    code: z
      .string()
      .optional()
      .describe('Error code'),
  }),
  handler: async ({ errorMessage, code }) => {
    return errorComponentResponse(errorMessage, 'error-card', {
      code,
      title: 'Test Error',
    });
  },
});

// ============================================================================
// Start Server
// ============================================================================

console.log('🌐 Weather App - Powered by Unido\n');

// ✅ NEW: Single entry point - app.listen() now works!
await app.listen();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down...');
  await app.close();
  process.exit(0);
});
