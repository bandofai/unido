/**
 * Example Weather App using Unido
 * Demonstrates multi-provider support with the new declarative API
 */

import { fileURLToPath } from 'node:url';
import { componentResponse, createApp, textResponse } from '@bandofai/unido-core';
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

app.component({
  type: 'weather-card',
  title: 'Weather Card',
  description: 'Displays temperature, condition, and humidity for a city.',
  sourcePath: weatherCardPath,
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,
      },
    },
  },
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
