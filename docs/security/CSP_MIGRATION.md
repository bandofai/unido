# CSP Migration Guide - Issue #22

## Summary

Issue #22 adds configurable Content Security Policy (CSP) support for widget iframes, enabling stricter security when loading untrusted widgets.

## What Changed

### Before (v0.1.x)

CSP was hardcoded in `WidgetIframeRenderer.tsx` with a permissive policy:

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
/>
// Always uses permissive CSP with 'unsafe-inline' and 'unsafe-eval'
```

### After (v0.2.x)

CSP is now configurable with two security levels:

```tsx
// Trusted mode (default - same as before)
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
  securityLevel="trusted" // optional, this is the default
/>

// Untrusted mode (new - for production/third-party widgets)
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
  securityLevel="untrusted"
/>
```

## Breaking Changes

**None.** The default behavior remains unchanged - widgets continue to use the permissive "trusted" CSP policy.

## When to Migrate

### Keep Current Behavior (Trusted Mode)

**Use trusted mode if**:
- You're developing locally
- All widgets come from your own MCP server
- You control the widget source code
- You're not loading third-party widgets

**Action required**: None. The default is already "trusted" mode.

### Upgrade to Untrusted Mode

**Use untrusted mode if**:
- Loading widgets from third-party sources
- Building a widget marketplace
- Accepting user-generated widgets
- Deploying to production with untrusted code

**Action required**: Add `securityLevel="untrusted"` prop.

## Migration Steps

### Step 1: Identify Your Use Case

Answer these questions:

1. Do you load widgets from sources you don't control? → **Untrusted**
2. Will users be able to upload custom widgets? → **Untrusted**
3. Is this a production deployment? → **Consider Untrusted**
4. Is this localhost development with your own widgets? → **Trusted** (default)

### Step 2: Update Component Props

#### For Development/Trusted Widgets

No changes needed:

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
  // Uses trusted mode by default
/>
```

#### For Production/Untrusted Widgets

Add security level:

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
  securityLevel="untrusted"
/>
```

### Step 3: Test Changes

1. **Run your application** with the new security level
2. **Open browser DevTools** → Console tab
3. **Look for CSP violations** (errors like "Refused to execute inline script")
4. **Test all widget functionality** (especially interactive features)

If you see CSP violations, you may need to add custom directives (see Step 4).

### Step 4: Add Custom Directives (If Needed)

If widgets need to access external resources:

```tsx
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
  csp={{
    level: 'untrusted',
    directives: {
      // Allow API calls to your backend
      'connect-src': ["'self'", 'https://api.yourapp.com'],

      // Allow images from CDN
      'img-src': ["'self'", 'data:', 'https://cdn.yourapp.com'],

      // Allow fonts from Google Fonts
      'font-src': ["'self'", 'https://fonts.googleapis.com'],
    }
  }}
/>
```

### Step 5: Optional - Add Server-Level CSP

For defense in depth, add CSP headers at the server level:

```typescript
import { createApp } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';

const app = createApp({
  providers: {
    openai: openAI({
      port: 3000,
      csp: {
        level: 'untrusted',
      }
    })
  }
});
```

## Examples

### Example 1: Development Server (No Changes)

```tsx
// Before
<WidgetIframeRenderer mcpClient={client} widgetType="weather-card" />

// After (no changes needed)
<WidgetIframeRenderer mcpClient={client} widgetType="weather-card" />
```

### Example 2: Production with Untrusted Widgets

```tsx
// Before
<WidgetIframeRenderer mcpClient={client} widgetType="user-widget" />

// After
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="user-widget"
  securityLevel="untrusted"
/>
```

### Example 3: Production with External Resources

```tsx
// After (with custom directives)
<WidgetIframeRenderer
  mcpClient={client}
  widgetType="dashboard"
  csp={{
    level: 'untrusted',
    directives: {
      'connect-src': ["'self'", 'https://api.example.com'],
      'img-src': ["'self'", 'data:', 'https://cdn.example.com'],
    }
  }}
/>
```

### Example 4: Environment-Based Configuration

```tsx
const securityLevel = process.env.NODE_ENV === 'production'
  ? 'untrusted'
  : 'trusted';

<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
  securityLevel={securityLevel}
/>
```

## CSP Comparison

### Trusted Mode (Default)

| Directive | Value |
|-----------|-------|
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'` |
| `style-src` | `'self' 'unsafe-inline'` |
| `connect-src` | `'self'` |
| **Security** | ⚠️ Permissive - development use |

### Untrusted Mode

| Directive | Value |
|-----------|-------|
| `script-src` | `'self' 'nonce-{random}' 'strict-dynamic'` |
| `style-src` | `'self'` |
| `connect-src` | `'self'` |
| `frame-ancestors` | `'none'` |
| **Security** | ✅ Strict - production use |

## Troubleshooting

### Problem: Widget Displays Blank Screen

**Cause**: CSP blocking required resources

**Solution**: Check browser console for CSP violations, add allowed origins

```tsx
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    directives: {
      'script-src': ["'self'", 'https://allowed-cdn.com'],
    }
  }}
  {...props}
/>
```

### Problem: External API Calls Failing

**Cause**: `connect-src` directive too restrictive

**Solution**: Add API domain to `connect-src`

```tsx
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    directives: {
      'connect-src': ["'self'", 'https://api.yourapp.com'],
    }
  }}
  {...props}
/>
```

### Problem: Images Not Loading

**Cause**: `img-src` directive blocking image sources

**Solution**: Add image sources to `img-src`

```tsx
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    directives: {
      'img-src': ["'self'", 'data:', 'https:', 'https://cdn.example.com'],
    }
  }}
  {...props}
/>
```

## Testing Checklist

Before deploying with untrusted mode:

- [ ] Widget renders without errors
- [ ] All interactive features work (buttons, forms, etc.)
- [ ] External API calls succeed
- [ ] Images and media load correctly
- [ ] No CSP violations in console
- [ ] Widget state persists across re-renders
- [ ] Tool calls (`window.openai.callTool`) work
- [ ] Theme and display mode changes work

## FAQ

### Q: Is this a breaking change?

**A**: No. The default behavior is unchanged. Existing code continues to work without modifications.

### Q: Should I use untrusted mode for all widgets?

**A**: Not necessarily. Use trusted mode for development and widgets you control. Use untrusted mode for production and third-party widgets.

### Q: What's the performance impact?

**A**: Negligible. CSP is enforced by the browser with minimal overhead. Nonce generation adds microseconds per render.

### Q: Can I use both modes in the same app?

**A**: Yes. Different `WidgetIframeRenderer` instances can use different security levels:

```tsx
<WidgetIframeRenderer securityLevel="trusted" {...trustedProps} />
<WidgetIframeRenderer securityLevel="untrusted" {...untrustedProps} />
```

### Q: How do I know which mode I'm currently using?

**A**: Check browser DevTools → Elements → Find the iframe → Look at CSP meta tag in `<head>`

Trusted mode includes `'unsafe-inline'`:
```html
<meta http-equiv="Content-Security-Policy" content="... 'unsafe-inline' ...">
```

Untrusted mode includes `'nonce-...'`:
```html
<meta http-equiv="Content-Security-Policy" content="... 'nonce-abc123' ...">
```

### Q: What if I need eval() in untrusted mode?

**A**: You can't. Untrusted mode explicitly disallows `'unsafe-eval'` for security. Consider refactoring code to avoid eval, or use trusted mode if you control the widget source.

## Additional Resources

- [Full CSP Guide](./CSP_GUIDE.md)
- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator Tool](https://csp-evaluator.withgoogle.com/)
- [Production Readiness Assessment](../PRODUCTION_READINESS_ASSESSMENT.md)

## Support

Questions or issues? File a GitHub issue:
https://github.com/bandofai/unido/issues/22
