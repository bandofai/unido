# Troubleshooting OpenAI Provider

Common issues and solutions when building with Unido and OpenAI Apps SDK.

---

## Widget Not Rendering

### Symptom
Component registered but ChatGPT shows only text, no widget.

### Possible Causes & Solutions

#### 1. Missing `openai/outputTemplate` Metadata

**Check:**
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method tools/list
```

Look for `_meta` field in tool definition. Should include:
```json
{
  "_meta": {
    "openai/outputTemplate": "ui://widget/your-component.html"
  }
}
```

**Solution:**
```typescript
// Unido sets this automatically when using componentResponse()
return app.componentResponse('your-component', props, fallbackText);

// Or set manually in tool metadata
app.tool('my_tool', {
  metadata: {
    openai: {
      outputTemplate: 'ui://widget/your-component.html'
    }
  }
});
```

#### 2. Component Not Registered

**Check:**
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method resources/list
```

Should list `ui://widget/your-component.html`.

**Solution:**
```typescript
// Make sure component is registered before app.listen()
app.component({
  type: 'your-component',
  sourcePath: resolveComponentPath('components/YourComponent.tsx')
});

await app.listen();
```

#### 3. Component Bundle Failed

**Check console output when starting server:**
```
[unido:adapter] Components bundled { successCount: 1 }
```

If count is 0 or error appears, bundling failed.

**Common causes:**
- Syntax error in component
- Missing import
- Invalid TypeScript
- CSS import issues

**Solution:**
```bash
# Check component compiles standalone
cd packages/components
pnpm run build

# Check for errors in server logs
pnpm run dev
```

#### 4. Wrong Resource URI

**Check** that resource URI matches metadata:
```typescript
// Component type
app.component({ type: 'weather-card', ... })

// Tool metadata must match
metadata: {
  openai: {
    outputTemplate: 'ui://widget/weather-card.html' // ✅ Matches
    // NOT: 'ui://widget/weatherCard.html'  // ❌ Wrong
  }
}
```

**Solution:** URI format is always `ui://widget/{component-type}.html`

---

## Interactive Widgets Not Working

### Symptom
Widget renders but `window.openai.callTool()` does nothing or errors.

### Possible Causes & Solutions

#### 1. Missing `widgetAccessible` Flag

**Both component AND tool must have `widgetAccessible: true`.**

**Check:**
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method tools/list
```

Look for:
```json
{
  "_meta": {
    "openai/widgetAccessible": true
  }
}
```

**Solution:**
```typescript
// Component registration
app.component({
  type: 'my-widget',
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true  // ← Required
      }
    }
  }
});

// Display tool
app.tool('show_widget', {
  metadata: {
    openai: {
      widgetAccessible: true  // ← Also required
    }
  }
});
```

#### 2. Action Tool Not Registered

**Check:**
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method tools/list
```

Verify the tool you're calling exists in the list.

**Solution:**
```typescript
// Register action tool
app.tool('refresh_data', {
  title: 'Refresh Data',
  input: z.object({ id: z.string() }),
  handler: async ({ id }) => {
    // ...
  }
});

// Then call from component
await window.openai.callTool('refresh_data', { id: '123' });
```

#### 3. window.openai Not Available

**Check in component:**
```typescript
useEffect(() => {
  console.log('window.openai:', window.openai);
}, []);
```

**Solution:** window.openai is injected by ChatGPT/Skybridge. Only available when running in ChatGPT, not in local testing.

**Workaround for local testing:**
```typescript
const callTool = async (name: string, args: any) => {
  if (window.openai) {
    await window.openai.callTool(name, args);
  } else {
    // Local development fallback
    console.log('Would call tool:', name, args);
  }
};
```

---

## Component Data Issues

### Symptom
Component renders but shows "Loading..." or wrong data.

### Possible Causes & Solutions

#### 1. Props Not in structuredContent

**Check tool response:**
```typescript
// ❌ Wrong - props not in structuredContent
return {
  content: [{ type: 'text', text: 'Weather data' }]
  // Missing: structuredContent
};

// ✅ Correct
return {
  content: [{ type: 'text', text: 'Weather data' }],
  structuredContent: {  // ← Props go here
    city: 'Portland',
    temperature: 72
  },
  _meta: {
    'openai/outputTemplate': 'ui://widget/weather-card.html'
  }
};
```

**Solution:** Use `componentResponse()` helper:
```typescript
return app.componentResponse(
  'weather-card',
  { city: 'Portland', temperature: 72 },
  'Weather in Portland: 72°F'
);
```

#### 2. Type Mismatch

**Check prop types:**
```typescript
// Component expects
interface Props {
  temperature: number;
}

// But tool returns
return app.componentResponse('weather', {
  temperature: "72"  // ❌ String instead of number
});
```

**Solution:** Ensure types match exactly:
```typescript
return app.componentResponse('weather', {
  temperature: 72  // ✅ Number
});
```

#### 3. Component Not Reading window.openai

**Check component implementation:**
```typescript
// ❌ Wrong - props passed directly (doesn't work in OpenAI)
export const WeatherCard: FC<WeatherCardProps> = ({ city, temperature }) => {
  // This won't work!
};

// ✅ Correct - read from window.openai
export const WeatherCard: FC = () => {
  const [data, setData] = useState<WeatherCardProps | null>(null);

  useEffect(() => {
    if (window.openai?.toolOutput) {
      setData(window.openai.toolOutput as WeatherCardProps);
    }
  }, []);

  if (!data) return <div>Loading...</div>;

  return <div>{data.city}: {data.temperature}°</div>;
};
```

---

## Build & Compilation Errors

### Symptom
Server won't start or component errors during bundling.

### Possible Causes & Solutions

#### 1. TypeScript Errors

**Check:**
```bash
pnpm run type-check
```

**Common issues:**
- Missing type imports
- Incorrect prop types
- Module not found

**Solution:**
```typescript
// Add type imports
import type { FC } from 'react';

// Define prop interface
interface MyComponentProps {
  data: string;
}

// Use path aliases
import { z } from 'zod';  // ✅
// NOT: import { z } from '../../../node_modules/zod';  // ❌
```

#### 2. CSS Import Issues

**Check component file:**
```typescript
// ✅ Correct
import './MyComponent.css';

// ❌ Wrong
import styles from './MyComponent.css';  // CSS modules not supported
```

**Solution:** Use plain CSS imports. Unido bundles CSS automatically.

#### 3. External Dependencies

**Component uses external package:**
```typescript
import { Chart } from 'chart.js';  // May fail in bundle
```

**Solution:** Use CDN links in HTML or inline the library:
```typescript
// Option 1: CDN (for small libraries)
// Add <script> tag in component HTML wrapper

// Option 2: Bundle with component (for critical libraries)
// Ensure dependency is in package.json

// Option 3: Use vanilla JS (recommended for widgets)
// Avoid heavy dependencies in widgets
```

---

## Server Connection Issues

### Symptom
ChatGPT can't connect to server or connection drops.

### Possible Causes & Solutions

#### 1. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port
lsof -ti:3000

# Kill it
kill $(lsof -ti:3000)

# Or use different port
openAI({ port: 3001 })
```

#### 2. CORS Issues

**Error in browser console:**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solution:** Unido enables CORS by default. If issue persists:
```typescript
openAI({
  port: 3000,
  cors: {
    origin: '*', // Allow all origins
    credentials: true
  }
})
```

#### 3. SSE Connection Drops

**Symptom:** Connection works initially but drops after some time.

**Check:**
- Reverse proxies (Nginx, Cloudflare) may buffer SSE
- Firewall/NAT timeout

**Solution:**
```typescript
// Add keep-alive pings (Unido does this automatically)
// If using reverse proxy, configure SSE support:

// Nginx example
location /sse {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_buffering off;
    proxy_cache off;
}
```

---

## ChatGPT-Specific Issues

### Symptom
Works locally but not in ChatGPT.

### Possible Causes & Solutions

#### 1. Developer Mode Not Enabled

**Check:**
- ChatGPT Settings → Actions → Developer Mode
- Must add server URL: `http://localhost:3000/sse`

**Solution:** Enable Developer Mode and add server.

#### 2. Localhost Not Accessible

**ChatGPT Desktop/Web runs in different context.**

**Solutions:**
- **Desktop App:** Use `localhost` or `127.0.0.1` (should work)
- **Web Version:** May require public URL or use desktop app
- **Production:** Deploy server and use public HTTPS URL

#### 3. Widget Rendering in ChatGPT

**Symptom:** Widget shows in inspector but not ChatGPT.

**Check:**
1. Metadata is correct (`openai/outputTemplate`)
2. Resource is accessible (test with `resources/read`)
3. HTML is valid
4. No console errors in browser DevTools

**Solution:**
```bash
# Test resource fetch
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse \
  --method resources/read \
  --params '{"uri":"ui://widget/your-component.html"}'

# Should return HTML content
```

---

## Performance Issues

### Symptom
Slow server startup or component rendering.

### Possible Causes & Solutions

#### 1. Large Component Bundles

**Check bundle sizes:**
```typescript
// Unido logs bundle sizes on startup
[unido:adapter] Component prepared {
  type: 'my-widget',
  bundleSize: 150000  // ← Check this (in bytes)
}
```

**Solution:**
- Remove unused imports
- Avoid large dependencies
- Use CDN for heavy libraries
- Code-split if possible

#### 2. Many Components

**10+ components can slow startup.**

**Solution:**
```typescript
// Only register components you need
// Use lazy loading if possible
// Consider separate apps for different feature sets
```

#### 3. File Watching

**File watching can be resource-intensive.**

**Solution:**
```typescript
// Disable in production
openAI({
  watch: false  // ← Set false in production
})
```

---

## Testing Issues

### MCP Inspector Not Working

**Error:**
```
Connection refused
```

**Solution:**
```bash
# Ensure server is running first
pnpm run dev

# Then in another terminal
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse
```

### Tool Calls Fail in Inspector

**Symptom:** `tools/list` works but `tools/call` fails.

**Check:**
1. Input schema validation
2. Handler errors
3. Response format

**Solution:**
```bash
# Check tool schema
--method tools/list

# Call with proper arguments
--method tools/call --params '{"name":"my_tool","arguments":{"city":"Portland"}}'

# Check server logs for errors
```

---

## Common Error Messages

### "Tool not found"

**Cause:** Tool not registered or name mismatch.

**Solution:**
```typescript
// Check tool name matches
app.tool('get_weather', { ... })

// Call with exact name
await window.openai.callTool('get_weather', { ... })
// NOT: 'getWeather' or 'get-weather'
```

### "Resource not found"

**Cause:** Component not bundled or URI wrong.

**Solution:**
```bash
# List all resources
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse \
  --method resources/list

# Check URI format
ui://widget/{component-type}.html
```

### "Input validation error"

**Cause:** Input doesn't match Zod schema.

**Solution:**
```typescript
// Define clear schema
input: z.object({
  city: z.string(), // Required
  units: z.enum(['C', 'F']).optional() // Optional with specific values
})

// Call with valid arguments
{ city: "Portland", units: "F" }  // ✅
{ city: 123 }  // ❌ Wrong type
{ city: "" }  // ❌ Empty string
```

---

## Getting Help

### 1. Check Server Logs

Unido provides detailed logging:
```
[unido:adapter] Initializing OpenAI adapter
[unido:adapter] Components bundled { successCount: 1 }
[unido:adapter] 📋 MCP Request: tools/list
[unido:adapter] 🔧 MCP Request: tools/call
```

### 2. Use MCP Inspector

Test server directly without ChatGPT:
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse
```

### 3. Query Context7

For OpenAI Apps SDK specific issues:
- Library ID: `/websites/developers_openai_apps-sdk`
- Query topics: "error messages", "troubleshooting", "debugging"

### 4. Check Official Docs

- Unido: [../../README.md](../../README.md)
- OpenAI Apps SDK: https://developers.openai.com/apps-sdk/
- MCP Protocol: https://modelcontextprotocol.io/

---

## Debug Checklist

When something's not working:

- [ ] Server starts without errors
- [ ] Components bundle successfully (check logs)
- [ ] Tools appear in `tools/list`
- [ ] Resources appear in `resources/list`
- [ ] Tool metadata includes `openai/outputTemplate`
- [ ] Component type matches resource URI
- [ ] Input validation passes
- [ ] Handler returns correct response format
- [ ] For interactive widgets: `widgetAccessible: true` on both component and tool
- [ ] ChatGPT Developer Mode enabled
- [ ] Server URL added to ChatGPT
- [ ] No CORS errors in browser console

---

> 📚 **For detailed troubleshooting**: Query Context7 with `/websites/developers_openai_apps-sdk` and topic "troubleshooting debugging"
