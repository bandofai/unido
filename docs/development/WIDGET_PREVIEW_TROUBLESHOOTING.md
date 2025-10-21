# Widget Preview Troubleshooting Guide

**Common Issues and Solutions for Unido Widget Preview System**

Last Updated: October 17, 2025

---

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Widget Loading Problems](#widget-loading-problems)
3. [Tool Call Failures](#tool-call-failures)
4. [State Persistence Issues](#state-persistence-issues)
5. [Performance Problems](#performance-problems)
6. [Browser Compatibility](#browser-compatibility)
7. [Development Environment](#development-environment)
8. [Debugging Tips](#debugging-tips)
9. [FAQ](#faq)

---

## Connection Issues

### ❌ Status Shows "🔴 Disconnected"

**Symptoms:**
- MCP mode selected
- Status bar shows red "Disconnected"
- Widgets don't load
- Tool calls fail

**Causes:**
1. MCP server not running
2. Wrong server URL
3. Port already in use
4. Firewall blocking connection
5. Network issues

**Solutions:**

**1. Verify MCP server is running:**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Should show Node.js process:
# node  12345 user  TCP *:3000 (LISTEN)
```

**2. Start MCP server if not running:**
```bash
cd examples/weather-app  # or your app directory
pnpm run dev

# Wait for message:
# "MCP server listening on http://localhost:3000"
```

**3. Check server URL in preview app:**
```typescript
// packages/dev/public/src/preview-app.tsx
const [mcpClient] = useState(() => new McpWidgetClient({
  serverUrl: 'http://localhost:3000',  // Verify this matches your server
}));
```

**4. Check for port conflicts:**
```bash
# Kill process using port 3000
kill $(lsof -ti:3000)

# Then restart server
pnpm run dev
```

**5. Test connection manually:**
```bash
# Test server is responding
curl http://localhost:3000/sse

# Should return SSE stream or error message
```

**Prevention:**
- Always start MCP server before switching to MCP mode
- Use consistent ports (3000 for MCP, 5173 for preview)
- Add server status check to your workflow

---

### ⚠️ Status Shows "⚠️ Error"

**Symptoms:**
- Was connected, now shows error
- Reconnect button appears
- Console shows connection errors

**Causes:**
1. Server crashed
2. Network interruption
3. Too many reconnection attempts
4. Invalid server response

**Solutions:**

**1. Click "Reconnect" button:**
- Located in status bar
- Will attempt to reconnect automatically
- May take a few seconds

**2. Check server logs:**
```bash
# In server terminal, look for errors
# Common errors:
# - "EADDRINUSE" - port conflict
# - "ECONNREFUSED" - server not listening
# - "Uncaught exception" - server crash
```

**3. Restart server:**
```bash
# Stop server (Ctrl+C)
# Check for zombie processes
lsof -i :3000

# Restart
pnpm run dev
```

**4. Check browser console:**
```
F12 → Console tab
Look for:
- SSE connection errors
- CORS errors
- Network timeouts
```

**5. Increase reconnection attempts:**
```typescript
const [mcpClient] = useState(() => new McpWidgetClient({
  serverUrl: 'http://localhost:3000',
  maxReconnectAttempts: 10,  // Default: 5
  reconnectDelay: 2000,       // Default: 1000
}));
```

**Prevention:**
- Monitor server health
- Handle errors gracefully in server code
- Use process manager (PM2) for production
- Implement health check endpoint

---

### 🟡 Status Stuck on "🟡 Connecting..."

**Symptoms:**
- Status shows "Connecting..." indefinitely
- Never becomes connected or shows error
- Logs show timeout messages

**Causes:**
1. Server not responding
2. Firewall blocking SSE
3. CORS misconfiguration
4. Timeout too short

**Solutions:**

**1. Increase connection timeout:**
```typescript
const [mcpClient] = useState(() => new McpWidgetClient({
  serverUrl: 'http://localhost:3000',
  timeout: 30000,  // Increase to 30 seconds (default: 10000)
}));
```

**2. Check CORS settings:**
```typescript
// In your Unido app (server side)
import { openAI } from '@bandofai/unido-provider-openai';

const app = createApp({
  providers: {
    openai: openAI({
      port: 3000,
      cors: {
        origin: 'http://localhost:5173',  // Preview app URL
        credentials: true,
      },
    }),
  },
});
```

**3. Test SSE connection:**
```bash
# Use curl to test SSE stream
curl -N -H "Accept: text/event-stream" http://localhost:3000/sse

# Should see SSE events streaming
# If hangs or errors, check server configuration
```

**4. Check browser console for specific errors:**
```
F12 → Console
Look for CORS errors:
"Access to XMLHttpRequest at 'http://localhost:3000/sse' from origin
'http://localhost:5173' has been blocked by CORS policy"
```

**Prevention:**
- Configure CORS properly during setup
- Use consistent URLs (no mixing localhost/127.0.0.1)
- Test connection before developing widgets

---

## Widget Loading Problems

### ❌ Widget Shows "Failed to load widget"

**Symptoms:**
- Error message in preview area
- Widget doesn't render
- Other widgets may work fine

**Causes:**
1. Widget not registered in app
2. Widget HTML malformed
3. Widget bundle failed
4. Resource URI incorrect

**Solutions:**

**1. Verify widget is registered:**
```typescript
// In your Unido app
app.component({
  type: 'my-widget',      // Must match widgetType in preview
  title: 'My Widget',
  description: 'Description',
  sourcePath: './components/MyWidget.tsx',  // Check path is correct
});
```

**2. Check widget appears in MCP resources:**
```bash
# Use MCP Inspector
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method resources/list

# Should show:
# {
#   "resources": [
#     {
#       "uri": "ui://widget/my-widget.html",
#       "name": "my-widget",
#       ...
#     }
#   ]
# }
```

**3. Test widget HTML directly:**
```bash
# Get widget HTML via MCP
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "resources/read",
    "params": { "uri": "ui://widget/my-widget.html" },
    "id": 1
  }'
```

**4. Check widget source file exists:**
```bash
# From your app directory
ls -la components/MyWidget.tsx

# If file missing, widget can't be bundled
```

**5. Check server logs for bundling errors:**
```
# Look for errors like:
# "Failed to bundle component: my-widget"
# "Error reading file: components/MyWidget.tsx"
# "Syntax error in component code"
```

**Prevention:**
- Test widget in direct mode first
- Verify component registration before using MCP mode
- Use TypeScript for compile-time error checking
- Test bundling during development

---

### ⚠️ Widget Loads but Shows Blank/White Screen

**Symptoms:**
- No error message
- Widget area is blank or white
- Browser console may show errors

**Causes:**
1. React component error (unhandled exception)
2. Missing window.openai API usage
3. CSS issues
4. Missing props

**Solutions:**

**1. Check browser console (iframe context):**
```
F12 → Console
Look for:
- "Uncaught Error" in component
- "Cannot read property of undefined"
- "window.openai is not defined"
```

**2. Add error boundary to widget:**
```typescript
// components/MyWidget.tsx
import React from 'react';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Widget error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Check console.</div>;
    }
    return this.props.children;
  }
}

export const MyWidget = () => {
  return (
    <ErrorBoundary>
      <div>Widget content...</div>
    </ErrorBoundary>
  );
};
```

**3. Verify props are being passed:**
```typescript
// Add logging to widget
export const MyWidget: React.FC<Props> = (props) => {
  console.log('Widget props:', props);

  if (!props.requiredField) {
    return <div>Missing required prop: requiredField</div>;
  }

  return <div>...</div>;
};
```

**4. Check for window.openai assumptions:**
```typescript
// BAD - assumes window.openai exists
const result = await window.openai.callTool('action', {});

// GOOD - checks availability
if (window.openai) {
  const result = await window.openai.callTool('action', {});
} else {
  console.warn('window.openai not available (direct mode)');
}
```

**5. Test in direct mode first:**
- Switch to "Direct Load" mode
- If works in direct mode but not MCP, issue is MCP-specific
- If broken in both modes, issue is in component code

**Prevention:**
- Always use error boundaries
- Check for window.openai availability
- Test in both modes
- Validate all props

---

### 🐌 Widget Takes Too Long to Load

**Symptoms:**
- Widget eventually loads
- "Loading..." shows for many seconds
- Performance metrics show high load times

**Causes:**
1. Large bundle size
2. Network latency
3. Heavy component rendering
4. Too many dependencies

**Solutions:**

**1. Check bundle size:**
```bash
# Build and check output size
pnpm run build

# Look for dist/components/MyWidget.js
# Ideal: < 100KB
# Acceptable: < 500KB
# Too large: > 1MB
```

**2. Optimize component:**
```typescript
// Use React.lazy for heavy components
const HeavyChart = React.lazy(() => import('./HeavyChart'));

export const MyWidget = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  );
};
```

**3. Monitor performance:**
```typescript
<WidgetIframeRenderer
  onPerformanceMetric={(metric) => {
    console.log(`${metric.name}: ${metric.duration}ms`);

    if (metric.duration > 2000) {
      console.warn(`Slow widget load: ${metric.duration}ms`);
    }
  }}
/>
```

**4. Reduce dependencies:**
```typescript
// BAD - imports entire library
import _ from 'lodash';

// GOOD - imports only what's needed
import debounce from 'lodash/debounce';

// BETTER - use native alternatives
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
```

**Prevention:**
- Keep bundle size small
- Use code splitting
- Lazy load heavy components
- Minimize dependencies

---

## Tool Call Failures

### ❌ Tool Call Returns Error

**Symptoms:**
- Tool Call Panel shows error
- Widget receives error response
- Log Panel shows "Tool call failed"

**Causes:**
1. Tool not registered
2. Invalid arguments
3. Handler threw exception
4. MCP communication error

**Solutions:**

**1. Verify tool is registered:**
```typescript
// In your Unido app
app.tool('my_tool', {
  description: 'My tool description',
  input: z.object({
    param: z.string(),
  }),
  handler: async ({ param }) => {
    // Handler implementation
    return textResponse(`Result: ${param}`);
  },
});
```

**2. Check tool appears in available tools:**
```bash
# Use MCP Inspector
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse --method tools/list

# Should show your tool:
# {
#   "tools": [
#     {
#       "name": "my_tool",
#       "description": "My tool description",
#       ...
#     }
#   ]
# }
```

**3. Validate arguments match schema:**
```typescript
// If tool expects:
input: z.object({
  city: z.string(),
  units: z.enum(['celsius', 'fahrenheit']),
})

// You must pass:
{
  "city": "San Francisco",
  "units": "celsius"
}

// NOT:
{
  "location": "San Francisco",  // Wrong key
  "temperature_unit": "C"       // Wrong enum value
}
```

**4. Add error handling to tool handler:**
```typescript
app.tool('my_tool', {
  // ...
  handler: async ({ param }) => {
    try {
      // Your logic
      const result = await doSomething(param);
      return textResponse(result);
    } catch (error) {
      console.error('Tool error:', error);
      return textResponse(`Error: ${error.message}`);
    }
  },
});
```

**5. Test tool independently:**
- Use Tool Call Panel to test
- Verify input schema
- Check error message details
- Look at Log Panel for stack traces

**Prevention:**
- Define clear input schemas
- Add comprehensive error handling
- Test tools before using in widgets
- Document expected inputs

---

### 🕐 Tool Call Times Out

**Symptoms:**
- Tool call never completes
- Widget shows loading indefinitely
- Eventually shows timeout error

**Causes:**
1. Handler hangs/infinite loop
2. External API not responding
3. Timeout too short
4. Network issues

**Solutions:**

**1. Add timeout to external requests:**
```typescript
app.tool('fetch_data', {
  handler: async ({ url }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await response.json();
      return textResponse(JSON.stringify(data));
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        return textResponse('Request timed out');
      }
      throw error;
    }
  },
});
```

**2. Add loading timeout in widget:**
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);

  const timeout = setTimeout(() => {
    setLoading(false);
    alert('Request timed out');
  }, 10000);

  try {
    const result = await window.openai.callTool('my_tool', args);
    clearTimeout(timeout);
    setLoading(false);
    // Handle result
  } catch (error) {
    clearTimeout(timeout);
    setLoading(false);
    console.error(error);
  }
};
```

**3. Check for infinite loops:**
```typescript
// BAD - can hang forever
app.tool('process', {
  handler: async ({ items }) => {
    while (items.length > 0) {  // Could loop forever
      // Process items
    }
  },
});

// GOOD - has exit condition
app.tool('process', {
  handler: async ({ items }) => {
    let iterations = 0;
    const MAX_ITERATIONS = 1000;

    while (items.length > 0 && iterations < MAX_ITERATIONS) {
      // Process items
      iterations++;
    }

    if (iterations >= MAX_ITERATIONS) {
      throw new Error('Max iterations exceeded');
    }
  },
});
```

**Prevention:**
- Add timeouts to all external requests
- Limit loop iterations
- Test with slow/failing APIs
- Monitor tool execution times

---

## State Persistence Issues

### ❌ Widget State Not Persisting

**Symptoms:**
- State resets when switching widgets
- Changes don't save
- State lost on reload

**Causes:**
1. Not using window.openai.setWidgetState
2. Testing in direct mode (state only works in MCP)
3. State not being read on mount

**Solutions:**

**1. Use window.openai.setWidgetState:**
```typescript
// BAD - state only in React
const [todos, setTodos] = useState<string[]>([]);

// GOOD - persist to window.openai
const [todos, setTodos] = useState<string[]>([]);

const updateTodos = (newTodos: string[]) => {
  setTodos(newTodos);
  window.openai?.setWidgetState({ todos: newTodos });
};
```

**2. Load state on mount:**
```typescript
useEffect(() => {
  // Load from window.openai.widgetState
  if (window.openai?.widgetState?.todos) {
    setTodos(window.openai.widgetState.todos);
  }
}, []);
```

**3. Verify you're in MCP mode:**
```typescript
// State persistence only works in MCP mode
if (!window.openai) {
  console.warn('State persistence requires MCP mode');
}
```

**4. Check state in console:**
```javascript
// In browser console (iframe context)
console.log(window.openai?.widgetState);

// Should show your saved state:
// { todos: ['Item 1', 'Item 2'] }
```

**5. Complete state management example:**
```typescript
import React, { useState, useEffect } from 'react';

interface State {
  count: number;
  items: string[];
}

export const StatefulWidget: React.FC = () => {
  const [state, setState] = useState<State>({
    count: 0,
    items: [],
  });

  // Load state on mount
  useEffect(() => {
    if (window.openai?.widgetState) {
      setState(prevState => ({
        ...prevState,
        ...window.openai.widgetState,
      }));
    }
  }, []);

  // Save state helper
  const updateState = (updates: Partial<State>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    window.openai?.setWidgetState(newState);
  };

  return (
    <div>
      <button onClick={() => updateState({ count: state.count + 1 })}>
        Count: {state.count}
      </button>
    </div>
  );
};
```

**Prevention:**
- Always use window.openai.setWidgetState for persistence
- Load state on component mount
- Test state persistence in MCP mode
- Document state shape

---

## Performance Problems

### 🐌 Preview App Slow/Laggy

**Symptoms:**
- UI feels sluggish
- Switching widgets is slow
- Props updates delayed

**Causes:**
1. Too many logs
2. Memory leak
3. Heavy components
4. Inefficient re-renders

**Solutions:**

**1. Limit logs:**
```typescript
// Already implemented, but verify setting:
<LogPanel
  logs={logs}
  maxLogs={100}  // Lower if still slow
/>
```

**2. Clear logs regularly:**
```typescript
// Auto-clear old logs
useEffect(() => {
  if (logs.length > 500) {
    setLogs(logs.slice(-200));  // Keep only recent 200
  }
}, [logs]);
```

**3. Check for memory leaks:**
```javascript
// In browser console
// Take heap snapshot before and after actions
// DevTools → Memory → Take snapshot
// Compare snapshots for growing objects
```

**4. Optimize component re-renders:**
```typescript
// Use React.memo
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  // Component implementation
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [/* dependencies */]);

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

**5. Profile performance:**
```
F12 → Performance tab
→ Record
→ Perform slow actions
→ Stop recording
→ Analyze flame graph
```

**Prevention:**
- Monitor log count
- Use React DevTools Profiler
- Optimize expensive components
- Test with large datasets

---

### 💾 High Memory Usage

**Symptoms:**
- Browser tab uses excessive memory
- System becomes slow
- Browser may crash

**Causes:**
1. Memory leak in widget
2. Too many logs stored
3. Large data in state
4. Event listeners not cleaned up

**Solutions:**

**1. Check memory usage:**
```
F12 → Performance Monitor
Watch:
- JS Heap Size
- DOM Nodes
- Event Listeners
```

**2. Find memory leaks:**
```javascript
// Use Chrome DevTools
// Memory → Take heap snapshot
// Perform actions
// Take another snapshot
// Compare to see what's growing
```

**3. Clean up event listeners:**
```typescript
useEffect(() => {
  const handler = () => {
    // Event handler
  };

  window.addEventListener('message', handler);

  return () => {
    window.removeEventListener('message', handler);
  };
}, []);
```

**4. Limit data in memory:**
```typescript
// Don't store entire history
const [logs, setLogs] = useState<LogEntry[]>([]);

// Limit to recent entries
const addLog = (entry: LogEntry) => {
  setLogs(prev => {
    const updated = [...prev, entry];
    return updated.slice(-100);  // Keep only 100 most recent
  });
};
```

**Prevention:**
- Clean up effects properly
- Limit data storage
- Use pagination for large lists
- Monitor memory during development

---

## Browser Compatibility

### 🌐 Safari Issues

**Symptoms:**
- Works in Chrome but not Safari
- SSE connections fail
- Styling looks wrong

**Common Issues:**

**1. SSE reconnection slower:**
```typescript
// Increase delays for Safari
const [mcpClient] = useState(() => new McpWidgetClient({
  serverUrl: 'http://localhost:3000',
  reconnectDelay: 2000,  // Longer delay for Safari
}));
```

**2. Flex layout issues:**
```css
/* Add Safari-specific fixes */
.container {
  display: flex;
  flex-direction: column;
  min-height: 0;  /* Safari flex bug fix */
}
```

**3. Date formatting:**
```typescript
// Safari doesn't support all date formats
const date = new Date('2025-10-17');  // OK
const date = new Date('10/17/2025');  // May fail in Safari

// Use ISO format:
const date = new Date('2025-10-17T00:00:00Z');  // ✅ Works everywhere
```

---

### 🦊 Firefox Issues

**Symptoms:**
- iframe console logs not visible
- DevTools behave differently

**Solutions:**

**1. View iframe logs:**
```
F12 → Console → Show Content Messages (checkbox)
```

**2. Use Log Panel:**
- Don't rely on iframe console
- Use Log Panel for debugging in MCP mode

---

## Development Environment

### ❌ Build Fails

**Symptoms:**
- `pnpm run build` fails
- TypeScript errors
- Cannot start preview

**Solutions:**

**1. Clean and rebuild:**
```bash
# Clean all build artifacts
pnpm run clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm run build
```

**2. Check Node.js version:**
```bash
node --version
# Should be v18.0.0 or higher

# If wrong version, use nvm:
nvm use 18
```

**3. Check TypeScript errors:**
```bash
# Run type checking
pnpm run type-check

# Fix reported errors
```

**4. Update dependencies:**
```bash
# Update all dependencies
pnpm update

# Rebuild
pnpm run build
```

---

### 🔥 Hot Reload Not Working

**Symptoms:**
- Changes don't appear
- Must manually reload browser
- Vite not detecting changes

**Solutions:**

**1. Check Vite is running:**
```bash
cd packages/dev
pnpm run dev

# Should see:
# "Local: http://localhost:5173/"
```

**2. Save file properly:**
- Ensure file is actually saved
- Check file watcher is active
- Try saving again (Cmd+S / Ctrl+S)

**3. Restart dev server:**
```bash
# Stop Vite (Ctrl+C)
# Restart
pnpm run dev
```

**4. Check file paths:**
```typescript
// Use path aliases, not relative
import { X } from '@bandofai/unido-dev';  // ✅
import { X } from '../../../src/X.js';    // ❌ May break HMR
```

---

## Debugging Tips

### General Debugging Workflow

**1. Reproduce the issue:**
- Document exact steps
- Note browser and version
- Record any error messages

**2. Check browser console:**
```
F12 → Console
- Look for red errors
- Check warnings
- Note stack traces
```

**3. Check server logs:**
```
# In MCP server terminal
- Look for errors
- Check request logs
- Note timing information
```

**4. Check Log Panel:**
- Set filter to "All"
- Look for error entries
- Check timestamps

**5. Use MCP Inspector:**
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse

# Test:
- tools/list
- resources/list
- tools/call
```

**6. Test in isolation:**
- Test tool in Tool Call Panel
- Test widget in direct mode
- Test MCP server with curl

### Useful Console Commands

```javascript
// Check MCP client state
window.mcpClient?.getConnectionState()

// Check window.openai API (in iframe)
console.log(window.openai)

// Check widget state
console.log(window.openai?.widgetState)

// Force reconnect
window.mcpClient?.connect()

// Check available widgets
window.mcpClient?.listWidgets()

// Manually call tool
window.openai?.callTool('my_tool', { arg: 'value' })
```

### Network Debugging

```bash
# Watch SSE stream
curl -N http://localhost:3000/sse

# Test tool call
curl -X POST http://localhost:3000/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"my_tool","arguments":{"arg":"value"}}'

# Check server health
curl http://localhost:3000/health
```

---

## FAQ

### Q: Should I use Direct or MCP mode?

**A:** Use both:
- **Direct mode** for UI development (faster iteration)
- **MCP mode** for integration testing (production-equivalent)

### Q: Why isn't my widget state persisting?

**A:** State persistence only works in MCP mode. You must:
1. Switch to MCP Load
2. Use `window.openai.setWidgetState()`
3. Load state on mount from `window.openai.widgetState`

### Q: How do I debug iframe issues?

**A:**
- Use Log Panel instead of console.log
- Check iframe context in DevTools: `Inspect Element → iframe`
- Use `onError` callbacks on WidgetIframeRenderer

### Q: Can I use the preview app in production?

**A:** No, it's a development tool. For production:
- Use OpenAI ChatGPT directly
- Deploy your MCP server
- Test with real ChatGPT environment

### Q: Why is my widget slow in MCP mode but fast in direct mode?

**A:**
- MCP mode adds: network request + iframe rendering + window.openai emulation
- Optimize bundle size
- Minimize tool calls
- Use performance monitoring

### Q: How do I test multiple widgets at once?

**A:** Use Gallery view:
- Click "Gallery" button in header
- All widgets render simultaneously
- Good for visual comparison
- Props cannot be edited in gallery

### Q: Can I use the preview app with non-OpenAI providers?

**A:** Currently no - the MCP mode specifically emulates ChatGPT. Direct mode works with any React components.

### Q: How do I report a bug?

**A:**
1. Check this troubleshooting guide first
2. Search existing issues on GitHub
3. Create new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and version
   - Screenshots if applicable
   - Server logs if relevant

---

## Additional Resources

- [Widget Preview Guide](./WIDGET_PREVIEW.md) - Complete documentation
- [Example Widgets](../../examples/weather-app/) - Working examples
- [MCP Protocol Spec](https://modelcontextprotocol.io/) - Protocol documentation
- [React DevTools](https://react.dev/learn/react-developer-tools) - React debugging
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Browser debugging

---

**Last Updated:** October 17, 2025
**Version:** 1.0.0
**Need More Help?** Open an issue on [GitHub](https://github.com/bandofai/unido/issues)
