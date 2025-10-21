# Responsive Widget Example

**Complete example demonstrating layout-aware widgets using window.openai API**

This example shows how to create a widget that adapts to different display modes (inline, pip, fullscreen) and respects height constraints.

---

## Overview

**Features Demonstrated**:
- ✅ Display mode detection (inline/pip/fullscreen)
- ✅ Maximum height constraint handling
- ✅ Theme awareness (light/dark)
- ✅ Responsive layout adaptation
- ✅ React hooks usage

---

## Component Code

### ResponsiveMap.tsx

```typescript
import React from 'react';
import { useDisplayMode, useMaxHeight, useTheme } from '@bandofai/unido-dev';

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

interface MapProps {
  places: Place[];
  title: string;
}

export function ResponsiveMap({ places, title }: MapProps) {
  // Use hooks to get layout context
  const displayMode = useDisplayMode();
  const maxHeight = useMaxHeight();
  const theme = useTheme();

  // Determine layout based on display mode
  const isFullscreen = displayMode === 'fullscreen';
  const isPip = displayMode === 'pip';
  const isInline = displayMode === 'inline' || !displayMode;

  // Calculate appropriate height
  const height = isFullscreen
    ? '100vh'
    : isPip
    ? '400px'
    : '500px';

  // Apply theme-aware styling
  const backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const borderColor = theme === 'dark' ? '#333333' : '#e5e5e5';

  return (
    <div
      style={{
        height,
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        backgroundColor,
        color: textColor,
        borderRadius: isPip ? '12px' : '0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isFullscreen ? 'row' : 'column',
      }}
    >
      {/* Header - only show in fullscreen and inline */}
      {!isPip && (
        <div
          style={{
            padding: '16px',
            borderBottom: `1px solid ${borderColor}`,
            fontWeight: 600,
          }}
        >
          {title}
        </div>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isFullscreen ? (
          <FullscreenLayout places={places} theme={theme} />
        ) : isPip ? (
          <CompactLayout places={places} theme={theme} />
        ) : (
          <InlineLayout places={places} theme={theme} />
        )}
      </div>

      {/* Footer - only in fullscreen */}
      {isFullscreen && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${borderColor}`,
            fontSize: '14px',
            opacity: 0.7,
          }}
        >
          {places.length} places found
        </div>
      )}
    </div>
  );
}

// Fullscreen layout - show sidebar + map + details
function FullscreenLayout({ places, theme }: { places: Place[]; theme?: string }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = places.find(p => p.id === selectedId);

  const bgColor = theme === 'dark' ? '#2a2a2a' : '#f9f9f9';

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '300px',
          borderRight: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
          overflow: 'auto',
          backgroundColor: bgColor,
        }}
      >
        {places.map(place => (
          <div
            key={place.id}
            onClick={() => setSelectedId(place.id)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              backgroundColor: selected?.id === place.id
                ? (theme === 'dark' ? '#3a3a3a' : '#e9e9e9')
                : 'transparent',
              borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
            }}
          >
            <div style={{ fontWeight: 500 }}>{place.name}</div>
            <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>
              {place.description}
            </div>
          </div>
        ))}
      </div>

      {/* Map area */}
      <div style={{ flex: 1, backgroundColor: bgColor, padding: '24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Map View
        </div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          {selected ? `Viewing: ${selected.name}` : 'Select a place to view details'}
        </div>
      </div>

      {/* Inspector panel */}
      {selected && (
        <div
          style={{
            width: '320px',
            borderLeft: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`,
            padding: '24px',
            overflow: 'auto',
            backgroundColor: bgColor,
          }}
        >
          <h3 style={{ marginTop: 0 }}>{selected.name}</h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>{selected.description}</p>
          <div style={{ marginTop: '16px', fontSize: '14px' }}>
            <div>Lat: {selected.lat}</div>
            <div>Lng: {selected.lng}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact layout for PiP - minimal info
function CompactLayout({ places, theme }: { places: Place[]; theme?: string }) {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
        {places.length} Places
      </div>
      <div style={{ fontSize: '14px', opacity: 0.8 }}>
        {places.slice(0, 3).map(p => p.name).join(', ')}
        {places.length > 3 && ` +${places.length - 3} more`}
      </div>
    </div>
  );
}

// Inline layout - list view
function InlineLayout({ places, theme }: { places: Place[]; theme?: string }) {
  const borderColor = theme === 'dark' ? '#333' : '#e5e5e5';

  return (
    <div style={{ padding: '16px' }}>
      {places.map(place => (
        <div
          key={place.id}
          style={{
            padding: '12px 0',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{place.name}</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>{place.description}</div>
        </div>
      ))}
    </div>
  );
}
```

---

## Server Setup

### Server Code

```typescript
import { createApp, textResponse, componentResponse } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = createApp({
  name: 'responsive-map-demo',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});

// Register the responsive map component
app.component({
  type: 'responsive-map',
  title: 'Responsive Map',
  description: 'A map that adapts to display mode and theme',
  sourcePath: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'components',
    'ResponsiveMap.tsx'
  ),
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true,
        preferredSize: 'large'
      }
    }
  }
});

// Tool to search for places
app.tool('search_places', {
  title: 'Search Places',
  description: 'Search for places by query',
  input: z.object({
    query: z.string().describe('Search query for places')
  }),
  metadata: {
    openai: {
      widgetAccessible: true,
      'toolInvocation/invoking': 'Searching for places...',
      'toolInvocation/invoked': 'Found places!'
    }
  },
  handler: async ({ query }) => {
    // Mock data - in real app, fetch from API
    const places = [
      {
        id: '1',
        name: 'Golden Gate Bridge',
        lat: 37.8199,
        lng: -122.4783,
        description: 'Iconic suspension bridge'
      },
      {
        id: '2',
        name: 'Alcatraz Island',
        lat: 37.8267,
        lng: -122.4233,
        description: 'Historic island prison'
      },
      {
        id: '3',
        name: 'Fishermans Wharf',
        lat: 37.8080,
        lng: -122.4177,
        description: 'Waterfront neighborhood'
      },
    ].filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );

    return componentResponse(
      'responsive-map',
      {
        places,
        title: `Search results for "${query}"`
      },
      `Found ${places.length} places matching "${query}"`
    );
  }
});

await app.start();

console.log('✅ Responsive map server running on http://localhost:3000');
console.log('📡 SSE endpoint: http://localhost:3000/sse');
```

---

## Usage in ChatGPT

### Example Conversation

**User**: "Search for places in San Francisco"

**Assistant**: "I'll search for places in San Francisco..."

*Calls `search_places` tool with `{ query: 'San Francisco' }`*

**Result**: Responsive map widget appears with:
- **Inline mode**: List view showing all places
- **PiP mode**: Compact view showing place count + first 3 names
- **Fullscreen mode**: Full layout with sidebar, map, and inspector

### Display Mode Behavior

#### Inline Mode (Default)
```
┌─────────────────────────────────┐
│ Search results for "..."        │
├─────────────────────────────────┤
│ Golden Gate Bridge              │
│ Iconic suspension bridge        │
├─────────────────────────────────┤
│ Alcatraz Island                 │
│ Historic island prison          │
└─────────────────────────────────┘
```

#### PiP Mode (Floating Window)
```
┌──────────────────┐
│ 3 Places         │
│ Golden Gate...   │
└──────────────────┘
```

#### Fullscreen Mode
```
┌───────────┬─────────────┬───────────┐
│ Sidebar   │  Map View   │ Inspector │
│ - Place 1 │             │ Details   │
│ - Place 2 │   [Map]     │ for       │
│ - Place 3 │             │ Selected  │
└───────────┴─────────────┴───────────┘
```

---

## Key Patterns

### 1. Display Mode Detection

```typescript
const displayMode = useDisplayMode();
const isFullscreen = displayMode === 'fullscreen';
const isPip = displayMode === 'pip';

// Adapt layout
return isFullscreen ? <DetailedView /> : <CompactView />;
```

### 2. Height Constraint Handling

```typescript
const maxHeight = useMaxHeight();

<div style={{
  maxHeight: maxHeight ? `${maxHeight}px` : undefined,
  overflow: 'auto'
}}>
```

### 3. Theme Awareness

```typescript
const theme = useTheme();

const styles = {
  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
  color: theme === 'dark' ? '#ffffff' : '#000000'
};
```

### 4. Responsive Flexbox

```typescript
<div style={{
  display: 'flex',
  flexDirection: isFullscreen ? 'row' : 'column',
  height: isFullscreen ? '100vh' : '500px'
}}>
```

---

## Best Practices

### ✅ Do

- **Always respect `maxHeight`** - Prevents content clipping
- **Provide fallbacks** - Handle undefined values gracefully
- **Test all modes** - Inline, PiP, and fullscreen
- **Match theme** - Use theme for colors and styling
- **Optimize for space** - Show less in compact modes

### ❌ Don't

- **Don't assume fullscreen** - Widget may be inline
- **Don't ignore maxHeight** - Content will clip
- **Don't hardcode colors** - Use theme property
- **Don't show everything in PiP** - Too crowded
- **Don't use fixed heights** - Use flexible layouts

---

## Testing

### Test Cases

1. **Inline Mode**
   - Widget renders in conversation
   - Content fits within maxHeight
   - Shows reasonable amount of info

2. **PiP Mode**
   - Compact view shows essentials
   - No scrolling needed
   - Quick glanceable info

3. **Fullscreen Mode**
   - Full layout with all features
   - Proper use of screen space
   - Detailed views accessible

4. **Theme Switching**
   - Light mode looks good
   - Dark mode looks good
   - Transitions smoothly

5. **Height Constraints**
   - Respects maxHeight limit
   - Scrollable when needed
   - No content clipping

---

## Related Examples

- [Theme-Aware Widget](./theme-aware-widget.md) - Focus on theme handling
- [Interactive Widget](./interactive-widget.md) - With tool calls
- [Multi-Component](./multi-component.md) - Multiple widgets

---

## References

- [window.openai API Reference](../WINDOW_OPENAI_API.md)
- [React Hooks Documentation](../../../packages/dev/src/hooks/use-openai.ts)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/)

---

**Last Updated**: 2025-01-17
**Unido Version**: 0.7.x+
**Status**: Complete Example
