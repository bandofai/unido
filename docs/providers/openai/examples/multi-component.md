# Example: Multi-Component Application

This example demonstrates an application with multiple components that can be used by different tools.

## Use Case

A weather application with three different visualization components:
- **CurrentWeather**: Simple card for current conditions
- **ForecastChart**: 7-day forecast with chart
- **WeatherMap**: Interactive map with weather overlays

## Complete Implementation

### 1. Create Multiple React Components

**File**: `src/components/CurrentWeather.tsx`

```typescript
import { FC, useEffect, useState } from 'react';
import './CurrentWeather.css';

interface CurrentWeatherProps {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export const CurrentWeather: FC = () => {
  const [data, setData] = useState<CurrentWeatherProps | null>(null);

  useEffect(() => {
    if (window.openai?.toolOutput) {
      setData(window.openai.toolOutput as CurrentWeatherProps);
    }
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="current-weather">
      <div className="location">{data.city}</div>
      <div className="icon">{data.icon}</div>
      <div className="temperature">{Math.round(data.temperature)}°</div>
      <div className="condition">{data.condition}</div>

      <div className="details">
        <div className="detail">
          <span className="label">Humidity</span>
          <span className="value">{data.humidity}%</span>
        </div>
        <div className="detail">
          <span className="label">Wind</span>
          <span className="value">{data.windSpeed} mph</span>
        </div>
      </div>
    </div>
  );
};
```

**File**: `src/components/ForecastChart.tsx`

```typescript
import { FC, useEffect, useState } from 'react';
import './ForecastChart.css';

interface DayForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

interface ForecastChartProps {
  city: string;
  days: DayForecast[];
}

export const ForecastChart: FC = () => {
  const [data, setData] = useState<ForecastChartProps | null>(null);

  useEffect(() => {
    if (window.openai?.toolOutput) {
      setData(window.openai.toolOutput as ForecastChartProps);
    }
  }, []);

  if (!data) return <div>Loading...</div>;

  const maxTemp = Math.max(...data.days.map(d => d.high));
  const minTemp = Math.min(...data.days.map(d => d.low));

  return (
    <div className="forecast-chart">
      <h2>7-Day Forecast for {data.city}</h2>

      <div className="chart">
        {data.days.map((day, index) => {
          const highPercent = ((day.high - minTemp) / (maxTemp - minTemp)) * 100;
          const lowPercent = ((day.low - minTemp) / (maxTemp - minTemp)) * 100;

          return (
            <div key={index} className="day">
              <div className="date">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
              <div className="icon">{day.icon}</div>
              <div className="bar-container">
                <div className="bar" style={{
                  height: `${highPercent - lowPercent}%`,
                  bottom: `${lowPercent}%`
                }} />
              </div>
              <div className="temps">
                <span className="high">{Math.round(day.high)}°</span>
                <span className="low">{Math.round(day.low)}°</span>
              </div>
              <div className="condition">{day.condition}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

**File**: `src/components/WeatherMap.tsx`

```typescript
import { FC, useEffect, useState } from 'react';
import './WeatherMap.css';

interface WeatherMapProps {
  city: string;
  latitude: number;
  longitude: number;
  zoom: number;
  layer: 'temperature' | 'precipitation' | 'wind';
}

export const WeatherMap: FC = () => {
  const [data, setData] = useState<WeatherMapProps | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>('temperature');

  useEffect(() => {
    if (window.openai?.toolOutput) {
      const output = window.openai.toolOutput as WeatherMapProps;
      setData(output);
      setSelectedLayer(output.layer);
    }
  }, []);

  const refreshMap = async (layer: string) => {
    if (window.openai && data) {
      await window.openai.callTool('get_weather_map', {
        city: data.city,
        layer
      });
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="weather-map">
      <div className="map-header">
        <h2>Weather Map - {data.city}</h2>
        <div className="layer-selector">
          {['temperature', 'precipitation', 'wind'].map(layer => (
            <button
              key={layer}
              className={selectedLayer === layer ? 'active' : ''}
              onClick={() => refreshMap(layer)}
            >
              {layer.charAt(0).toUpperCase() + layer.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="map-container">
        {/* In production, use a real map library like Mapbox or Leaflet */}
        <div className="map-placeholder">
          <div className="coordinates">
            {data.latitude.toFixed(2)}°N, {data.longitude.toFixed(2)}°W
          </div>
          <div className="layer-info">
            Showing: {selectedLayer} data
          </div>
        </div>
      </div>

      <div className="map-legend">
        {selectedLayer === 'temperature' && (
          <div className="legend-scale">
            <span style={{ background: '#0066ff' }}>Cold</span>
            <span style={{ background: '#00ff00' }}>Mild</span>
            <span style={{ background: '#ff0000' }}>Hot</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 2. Register All Components

**File**: `src/index.ts`

```typescript
import { createApp } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { z } from 'zod';

function resolveComponentPath(relativePath: string): string {
  const normalized = relativePath.startsWith('./')
    ? relativePath.slice(2)
    : relativePath;

  const distUrl = new URL(
    normalized.startsWith('components/')
      ? './' + normalized
      : './components/' + normalized,
    import.meta.url
  );
  const distPath = fileURLToPath(distUrl);

  if (existsSync(distPath)) return distPath;
  return fileURLToPath(new URL('../src/' + normalized, import.meta.url));
}

const app = createApp({
  name: 'weather-dashboard',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});

// Register Component 1: Current Weather
app.component({
  type: 'current-weather',
  title: 'Current Weather Card',
  description: 'Displays current weather conditions for a city',
  sourcePath: resolveComponentPath('components/CurrentWeather.tsx'),
  metadata: {
    openai: {
      renderHints: {
        preferredSize: 'small'
      }
    }
  }
});

// Register Component 2: Forecast Chart
app.component({
  type: 'forecast-chart',
  title: 'Forecast Chart',
  description: 'Shows 7-day temperature forecast with visualization',
  sourcePath: resolveComponentPath('components/ForecastChart.tsx'),
  metadata: {
    openai: {
      renderHints: {
        preferredSize: 'medium'
      }
    }
  }
});

// Register Component 3: Weather Map
app.component({
  type: 'weather-map',
  title: 'Weather Map',
  description: 'Interactive map with weather layer overlays',
  sourcePath: resolveComponentPath('components/WeatherMap.tsx'),
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true, // Interactive!
        preferredSize: 'large'
      }
    }
  }
});

// Tool 1: Get current weather (uses CurrentWeather component)
app.tool('current_weather', {
  title: 'Current Weather',
  description: 'Get current weather conditions for a city',
  input: z.object({
    city: z.string().describe('City name')
  }),
  handler: async ({ city }) => {
    const weather = await fetchCurrentWeather(city);

    return app.componentResponse(
      'current-weather',
      {
        city: weather.name,
        temperature: weather.main.temp,
        condition: weather.weather[0].description,
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed,
        icon: getWeatherIcon(weather.weather[0].id)
      },
      `Current weather in ${city}: ${weather.weather[0].description}, ${Math.round(weather.main.temp)}°F`
    );
  }
});

// Tool 2: Get forecast (uses ForecastChart component)
app.tool('forecast', {
  title: 'Weather Forecast',
  description: 'Get 7-day weather forecast for a city',
  input: z.object({
    city: z.string().describe('City name')
  }),
  handler: async ({ city }) => {
    const forecast = await fetchForecast(city);

    return app.componentResponse(
      'forecast-chart',
      {
        city: forecast.city.name,
        days: forecast.list.slice(0, 7).map(day => ({
          date: day.dt_txt,
          high: day.main.temp_max,
          low: day.main.temp_min,
          condition: day.weather[0].main,
          icon: getWeatherIcon(day.weather[0].id)
        }))
      },
      `7-day forecast for ${city}`
    );
  }
});

// Tool 3: Get weather map (uses WeatherMap component)
app.tool('get_weather_map', {
  title: 'Weather Map',
  description: 'Show interactive weather map for a city',
  input: z.object({
    city: z.string().describe('City name'),
    layer: z.enum(['temperature', 'precipitation', 'wind'])
      .default('temperature')
      .describe('Weather layer to display')
  }),
  metadata: {
    openai: {
      widgetAccessible: true // Needed for layer switching
    }
  },
  handler: async ({ city, layer }) => {
    const location = await geocodeCity(city);

    return app.componentResponse(
      'weather-map',
      {
        city,
        latitude: location.lat,
        longitude: location.lon,
        zoom: 10,
        layer
      },
      `Weather map for ${city} showing ${layer} data`
    );
  }
});

// Mock API functions (replace with real API calls)
async function fetchCurrentWeather(city: string) {
  // Call OpenWeatherMap or similar API
  return {
    name: city,
    main: { temp: 72, humidity: 65 },
    weather: [{ id: 800, description: 'Clear sky' }],
    wind: { speed: 5 }
  };
}

async function fetchForecast(city: string) {
  // Call forecast API
  return {
    city: { name: city },
    list: Array.from({ length: 7 }, (_, i) => ({
      dt_txt: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      main: { temp_max: 75 + i, temp_min: 60 + i },
      weather: [{ id: 800, main: 'Clear' }]
    }))
  };
}

async function geocodeCity(city: string) {
  // Geocode city to coordinates
  return { lat: 45.5, lon: -122.6 }; // Portland, OR
}

function getWeatherIcon(weatherId: number): string {
  // Map weather condition IDs to emoji icons
  if (weatherId >= 200 && weatherId < 300) return '⛈️';
  if (weatherId >= 300 && weatherId < 500) return '🌧️';
  if (weatherId >= 500 && weatherId < 600) return '🌧️';
  if (weatherId >= 600 && weatherId < 700) return '❄️';
  if (weatherId === 800) return '☀️';
  if (weatherId > 800) return '☁️';
  return '🌤️';
}

await app.listen();
console.log('Weather dashboard running on http://localhost:3000');
```

## Architecture Patterns

### Pattern 1: Different Tools, Different Components

Each tool uses the most appropriate component:

```typescript
// Quick answer → Small component
app.tool('current_weather', { ... })
  → app.componentResponse('current-weather', ...)

// Detailed view → Medium component
app.tool('forecast', { ... })
  → app.componentResponse('forecast-chart', ...)

// Interactive exploration → Large component
app.tool('get_weather_map', { ... })
  → app.componentResponse('weather-map', ...)
```

### Pattern 2: Tool Routing Based on Intent

Use the same data source but different visualizations:

```typescript
app.tool('weather', {
  input: z.object({
    city: z.string(),
    view: z.enum(['current', 'forecast', 'map']).default('current')
  }),
  handler: async ({ city, view }) => {
    switch (view) {
      case 'current':
        return app.componentResponse('current-weather', await getCurrentData(city));
      case 'forecast':
        return app.componentResponse('forecast-chart', await getForecastData(city));
      case 'map':
        return app.componentResponse('weather-map', await getMapData(city));
    }
  }
});
```

### Pattern 3: Component Composition

Create a dashboard that uses multiple components:

```typescript
// Register dashboard component
app.component({
  type: 'weather-dashboard',
  sourcePath: resolveComponentPath('components/WeatherDashboard.tsx')
});

// Dashboard component file
export const WeatherDashboard: FC = () => {
  const data = window.openai?.toolOutput as {
    current: CurrentWeatherProps;
    forecast: ForecastChartProps;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <CurrentWeather {...data.current} />
        <ForecastChart {...data.forecast} />
      </div>
    </div>
  );
};

// Tool returns combined data
app.tool('weather_dashboard', {
  handler: async ({ city }) => {
    return app.componentResponse('weather-dashboard', {
      current: await getCurrentData(city),
      forecast: await getForecastData(city)
    });
  }
});
```

### Pattern 4: Shared Component Library

Create reusable sub-components:

```typescript
// packages/components/src/shared/WeatherIcon.tsx
export const WeatherIcon: FC<{ icon: string }> = ({ icon }) => (
  <span className="weather-icon">{icon}</span>
);

// packages/components/src/shared/TemperatureDisplay.tsx
export const TemperatureDisplay: FC<{ temp: number }> = ({ temp }) => (
  <div className="temperature">{Math.round(temp)}°</div>
);

// Use in multiple components
import { WeatherIcon, TemperatureDisplay } from '../shared';

export const CurrentWeather: FC = () => {
  // ...
  return (
    <div>
      <WeatherIcon icon={data.icon} />
      <TemperatureDisplay temp={data.temperature} />
    </div>
  );
};
```

## Component Communication

### Scenario: One Component Triggers Another

**Goal**: User clicks "View Forecast" in current weather widget → Shows forecast

```typescript
// In CurrentWeather component
const viewForecast = async () => {
  if (window.openai && data?.city) {
    await window.openai.callTool('forecast', {
      city: data.city
    });
  }
};

return (
  <div className="current-weather">
    {/* ... weather display ... */}
    <button onClick={viewForecast}>View 7-Day Forecast</button>
  </div>
);

// The forecast tool returns a different component
app.tool('forecast', {
  handler: async ({ city }) => {
    return app.componentResponse('forecast-chart', forecastData);
  }
});
```

## Testing Multi-Component Apps

### 1. Test Each Component Independently

```bash
# Test current weather
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"current_weather","arguments":{"city":"Portland"}},"id":1}'

# Test forecast
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"forecast","arguments":{"city":"Portland"}},"id":2}'

# Test map
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_weather_map","arguments":{"city":"Portland","layer":"temperature"}},"id":3}'
```

### 2. Verify All Resources Registered

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method resources/list

# Should show:
# - ui://widget/current-weather.html
# - ui://widget/forecast-chart.html
# - ui://widget/weather-map.html
```

### 3. Test in ChatGPT

Try various prompts:
- "What's the weather in Portland?" → Should use current-weather
- "Show me the forecast for Seattle" → Should use forecast-chart
- "Weather map for San Francisco" → Should use weather-map

## Organization Best Practices

### File Structure

```
src/
├── components/
│   ├── shared/              # Reusable sub-components
│   │   ├── WeatherIcon.tsx
│   │   ├── Temperature.tsx
│   │   └── index.ts
│   ├── CurrentWeather.tsx   # Standalone components
│   ├── CurrentWeather.css
│   ├── ForecastChart.tsx
│   ├── ForecastChart.css
│   ├── WeatherMap.tsx
│   ├── WeatherMap.css
│   └── index.ts             # Export all
├── services/
│   ├── weatherApi.ts        # API clients
│   └── geocoding.ts
├── types/
│   └── weather.ts           # Shared type definitions
└── index.ts                 # Main server file
```

### Shared Types

```typescript
// src/types/weather.ts
export interface CurrentWeatherProps {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface DayForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

export interface ForecastChartProps {
  city: string;
  days: DayForecast[];
}

export interface WeatherMapProps {
  city: string;
  latitude: number;
  longitude: number;
  zoom: number;
  layer: 'temperature' | 'precipitation' | 'wind';
}
```

### Component Index

```typescript
// src/components/index.ts
export { CurrentWeather } from './CurrentWeather';
export { ForecastChart } from './ForecastChart';
export { WeatherMap } from './WeatherMap';
export * from '../types/weather';
```

## Key Takeaways

1. **Multiple components per app** is encouraged
2. **Each component serves a specific purpose**
3. **Components can trigger tools that return different components**
4. **Shared sub-components reduce duplication**
5. **Keep component registration centralized**
6. **Use TypeScript interfaces for type safety**
7. **Test each component independently**
8. **Organize files by feature/component**

## Common Pitfalls

### 1. Component Name Conflicts

```typescript
// ❌ Bad - generic names
app.component({ type: 'card', ... });
app.component({ type: 'chart', ... });

// ✅ Good - specific names
app.component({ type: 'weather-card', ... });
app.component({ type: 'forecast-chart', ... });
```

### 2. Forgetting widgetAccessible

```typescript
// ❌ Interactive component but missing flag
app.component({
  type: 'weather-map',
  // Missing: widgetAccessible: true
});

// ✅ Correctly configured
app.component({
  type: 'weather-map',
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true
      }
    }
  }
});
```

### 3. Tight Coupling

```typescript
// ❌ Bad - component depends on specific tool
app.tool('get_data', {
  handler: async () => {
    return app.componentResponse('my-widget', { ... });
  }
});

// ✅ Good - reusable component
app.component({ type: 'data-display', ... });

app.tool('get_user_data', {
  handler: async () => app.componentResponse('data-display', userData)
});

app.tool('get_product_data', {
  handler: async () => app.componentResponse('data-display', productData)
});
```

## Next Steps

- **Troubleshooting**: See [../troubleshooting.md](../troubleshooting.md)
- **Advanced patterns**: Query Context7 for "component composition" and "state management"

---

> 📚 **For multi-component architecture patterns**: Query Context7 with `/websites/developers_openai_apps-sdk` and topic "multiple components app architecture"
