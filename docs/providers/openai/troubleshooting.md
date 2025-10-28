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

## Debugging in ChatGPT

### Opening ChatGPT Developer Console

**Desktop App:**
- **macOS:** `Cmd + Option + I`
- **Windows:** `Ctrl + Shift + I`

**Web:**
- **Chrome/Edge:** `F12` or `Ctrl + Shift + I` (Windows) / `Cmd + Option + I` (Mac)
- **Firefox:** `F12`
- **Safari:** `Cmd + Option + C`

### Common Error Patterns

#### Widget Not Appearing

**Symptom:** Tool executes successfully but no widget shows in ChatGPT.

**Checklist:**
1. ✅ Component registered with `app.component()`
2. ✅ `metadata.openai.outputTemplate` set to `ui://widget/your-widget.html`
3. ✅ Widget resource exposed in MCP resources list
4. ✅ No console errors in ChatGPT developer tools

**Verification:**
```bash
# Check resources list
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method resources/list
```

Should show: `ui://widget/your-widget.html`

**Check in ChatGPT Console:**
```javascript
// Look for errors like:
// - Failed to fetch widget resource
// - Widget bundle failed to load
// - Component render error
```

#### Widget Appears But Broken

**Symptom:** Widget renders but doesn't work correctly or shows errors.

**Common Causes:**

**1. CSP Violations**

**Error in Console:**
```
Refused to execute inline script because it violates Content Security Policy
```

**Solution:**
Update widget CSP metadata:
```typescript
app.component({
  type: 'my-widget',
  metadata: {
    openai: {
      widgetCSP: "default-src 'self'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'"
    }
  }
})
```

See [CSP Guide](../../security/CSP_GUIDE.md) for secure configurations.

**2. Missing window.openai API**

**Error:**
```
Cannot read property 'callTool' of undefined
```

**Check:**
```typescript
useEffect(() => {
  console.log('window.openai available:', !!window.openai);
  console.log('window.openai.toolOutput:', window.openai?.toolOutput);
}, []);
```

**Solution:**
Ensure `metadata.openai.widgetAccessible: true` is set:
```typescript
app.component({
  type: 'my-widget',
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true  // ← Required for window.openai
      }
    }
  }
});
```

**3. Props Not Received**

**Error:**
```
TypeError: Cannot read property 'city' of undefined
```

**Check:**
```typescript
// In component
useEffect(() => {
  console.log('Tool output:', window.openai?.toolOutput);
}, []);
```

**Solution:**
Verify `componentResponse()` includes props:
```typescript
return componentResponse(
  'my-widget',
  { city: 'Portland', temperature: 72 },  // ← Props here
  'Fallback text'
);
```

#### CORS Errors

**Symptom:** "Cross-Origin Request Blocked" in console.

**Error:**
```
Access to fetch at 'http://localhost:3000/...' from origin 'https://chatgpt.com'
has been blocked by CORS policy
```

**Solution:**
Unido OpenAI provider enables CORS by default. If you see this error:

```typescript
openAI({
  port: 3000,
  cors: true,        // Should be true (default)
  corsOrigin: '*'    // Or specific origin
})
```

For production, specify ChatGPT origin:
```typescript
openAI({
  corsOrigin: 'https://chatgpt.com'
})
```

#### Network Errors

**Symptom:** "Failed to load resource" or "net::ERR_CONNECTION_REFUSED"

**Causes:**
1. Server not running
2. Wrong URL in ChatGPT settings
3. Firewall blocking connection

**Debug Steps:**

**1. Verify server is running:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

**2. Check URL in ChatGPT:**
- Settings → Custom Tools → Manage Servers
- Verify URL matches server (e.g., `http://localhost:3000`)

**3. Test MCP connection:**
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method tools/list
```

### Debugging Workflow

When widget doesn't work in ChatGPT:

**1. Check MCP Connection**
- ChatGPT Settings → Custom Tools
- Verify green indicator (connected)
- If red: server not reachable

**2. Verify Tool Registration**
- Ask ChatGPT: "What tools do you have access to?"
- Should list your tools
- If missing: check tool registration

**3. Test Tool Execution**
- Ask ChatGPT to use a tool
- Open console (see shortcuts above)
- Look for errors in Console tab

**4. Inspect Widget Loading**
- **Network tab:** Look for `ui://widget/...` requests
- Should show 200 OK with HTML content
- If 404: widget resource not found

**5. Check Widget Console Errors**
- **Console tab:** Look for React errors, CSP violations
- Fix errors one at a time
- Reload ChatGPT to test changes

### Widget-Specific Debug Tips

**Check Props Received:**
```typescript
export const MyWidget: FC = () => {
  useEffect(() => {
    console.log('=== WIDGET DEBUG ===');
    console.log('window.openai:', window.openai);
    console.log('toolOutput:', window.openai?.toolOutput);
    console.log('conversationId:', window.openai?.conversationId);
    console.log('==================');
  }, []);

  // Rest of component...
}
```

**Test window.openai.callTool:**
```typescript
const handleClick = async () => {
  console.log('Calling tool...');
  try {
    const result = await window.openai.callTool('my_action', { id: '123' });
    console.log('Tool result:', result);
  } catch (error) {
    console.error('Tool call failed:', error);
  }
};
```

**Verify Component Rendering:**
```typescript
export const MyWidget: FC = () => {
  console.log('MyWidget rendering!');

  return (
    <div>
      <p>Widget rendered successfully!</p>
      <p>Check console for props</p>
    </div>
  );
};
```

### Production Debugging

**Enable Source Maps (if needed):**
```typescript
// In bundler config
{
  sourcemap: true  // Helps debug minified code
}
```

**Add Error Boundary:**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Widget error:', error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

// Wrap your component
export const MyWidget = () => (
  <ErrorBoundary>
    <ActualComponent />
  </ErrorBoundary>
);
```

### Still Stuck?

**1. Compare with Working Example:**
```bash
cd examples/weather-app
pnpm install
pnpm run dev
# Test in ChatGPT to verify setup works
```

**2. Check Widget Preview Tool:**
```bash
cd packages/dev
pnpm run dev
# Load widget locally to isolate ChatGPT-specific issues
```

**3. Review Documentation:**
- [Widget Preview Guide](../../development/WIDGET_PREVIEW.md)
- [OpenAI Apps SDK Guide](OPENAI_APPS_SDK.md)
- [Widget Examples](examples/)

**4. Ask for Help:**
- 💬 [Open a discussion](https://github.com/bandofai/unido/discussions)
- 🐛 [File an issue](https://github.com/bandofai/unido/issues) with:
  - Console errors screenshot
  - Tool registration code
  - Component code
  - MCP Inspector output
- 🚀 Ready for production? Review the [Hosting Options guide](../deployment/HOSTING_OPTIONS.md) to choose an HTTPS platform and run final checks.

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
