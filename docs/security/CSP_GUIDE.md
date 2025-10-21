# Content Security Policy (CSP) Guide

## Overview

Unido provides a comprehensive Content Security Policy (CSP) system for securing widget iframes. The system supports two security levels optimized for different use cases:

- **Trusted**: Permissive policy for development and trusted widget sources
- **Untrusted**: Strict policy for production environments with third-party widgets

## Quick Start

### Development Mode (Default)

For local development with trusted widgets:

```tsx
import { WidgetIframeRenderer } from '@bandofai/unido-dev';

<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
  // Default: trusted security level
/>
```

### Production Mode

For production environments loading untrusted third-party widgets:

```tsx
import { WidgetIframeRenderer } from '@bandofai/unido-dev';

<WidgetIframeRenderer
  mcpClient={client}
  widgetType="my-widget"
  securityLevel="untrusted"
  // Or equivalently:
  csp={{ level: 'untrusted' }}
/>
```

## Security Levels

### Trusted Level (Default)

**Use Case**: Development, localhost testing, known/trusted widget sources

**Characteristics**:
- ✅ Allows inline scripts (`'unsafe-inline'`)
- ✅ Allows eval (`'unsafe-eval'`)
- ✅ Allows inline styles
- ✅ Works with bundled React components out of the box
- ⚠️ Less restrictive - use only with trusted code

**CSP Policy**:
```
default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self';
font-src 'self' data:;
object-src 'none';
base-uri 'self';
form-action 'self';
```

### Untrusted Level

**Use Case**: Production, third-party widgets, user-generated content

**Characteristics**:
- ✅ Nonce-based inline scripts
- ✅ No eval allowed
- ✅ Strict resource loading
- ✅ `'strict-dynamic'` for modern browsers
- ✅ Automatic HTTPS upgrade
- ✅ Maximum security

**CSP Policy**:
```
default-src 'self';
script-src 'self' 'nonce-{random}' 'strict-dynamic';
style-src 'self';
img-src 'self' data: https:;
connect-src 'self';
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

## Configuration Options

### Basic Configuration

```tsx
// Security level shorthand
<WidgetIframeRenderer
  securityLevel="trusted" // or "untrusted"
  {...props}
/>

// Full CSP configuration
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    nonce: 'custom-nonce', // optional, auto-generated if omitted
  }}
  {...props}
/>
```

### Custom Directives

Override or extend default CSP directives:

```tsx
<WidgetIframeRenderer
  csp={{
    level: 'trusted',
    directives: {
      'connect-src': ["'self'", 'https://api.example.com'],
      'img-src': ["'self'", 'data:', 'https:', 'https://cdn.example.com'],
    }
  }}
  {...props}
/>
```

### Server-Level CSP (Defense in Depth)

Add CSP headers at the HTTP server level:

```typescript
import { openAI } from '@bandofai/unido-provider-openai';

const app = createApp({
  providers: {
    openai: openAI({
      port: 3000,
      csp: {
        level: 'untrusted',
        directives: {
          'connect-src': ["'self'", 'https://api.example.com'],
        }
      }
    })
  }
});
```

## Implementation Details

### How CSP Works in Unido

1. **Meta Tag Injection**: CSP policy is injected as a `<meta>` tag in widget HTML
2. **Nonce Generation**: Cryptographically secure nonces generated per render (untrusted mode)
3. **Script Attribution**: Inline scripts automatically receive nonce attributes
4. **HTTP Headers**: Optional server-level CSP headers for defense in depth

### Nonce-Based Scripts (Untrusted Mode)

When using `level: 'untrusted'`, Unido automatically:

1. Generates a cryptographically secure nonce
2. Injects nonce into CSP meta tag: `script-src 'nonce-abc123'`
3. Adds nonce attribute to all inline scripts: `<script nonce="abc123">`

This allows legitimate inline scripts while blocking injected malicious code.

### Defense in Depth Strategy

Unido implements multiple security layers:

```
┌─────────────────────────────────────────┐
│  HTTP CSP Headers (Server)              │  ← Layer 1: Server headers
├─────────────────────────────────────────┤
│  CSP Meta Tag (Widget HTML)             │  ← Layer 2: Document policy
├─────────────────────────────────────────┤
│  Iframe Sandbox Attributes              │  ← Layer 3: Iframe isolation
│  (allow-scripts allow-same-origin)      │
├─────────────────────────────────────────┤
│  HTML Validation                         │  ← Layer 4: Input validation
│  (checks for external scripts)          │
└─────────────────────────────────────────┘
```

## Migration Guide

### From Hardcoded CSP to Configurable CSP

**Before** (v0.1.x):
```tsx
// CSP was hardcoded to permissive policy
<WidgetIframeRenderer {...props} />
```

**After** (v0.2.x):
```tsx
// Default remains the same (trusted)
<WidgetIframeRenderer {...props} />

// Opt into strict security for production
<WidgetIframeRenderer
  securityLevel="untrusted"
  {...props}
/>
```

**Breaking Changes**: None - the default behavior is unchanged.

### Upgrading to Untrusted Mode

**Step 1**: Test in development with `securityLevel="untrusted"`

```tsx
<WidgetIframeRenderer
  securityLevel="untrusted"
  widgetType="my-widget"
  mcpClient={client}
/>
```

**Step 2**: Verify widgets load and function correctly

- Check browser console for CSP violations
- Test all interactive features
- Verify external resource loading

**Step 3**: Add custom directives if needed

```tsx
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    directives: {
      // Allow API calls to your backend
      'connect-src': ["'self'", 'https://api.yourapp.com'],
      // Allow images from CDN
      'img-src': ["'self'", 'data:', 'https://cdn.yourapp.com'],
    }
  }}
  {...props}
/>
```

**Step 4**: Deploy to production

## Advanced Usage

### Custom Nonce Generation

Provide your own nonce for integration with existing CSP systems:

```tsx
import { generateCSPNonce } from '@bandofai/unido-dev';

const nonce = generateCSPNonce(); // or use your own

<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    nonce: nonce,
  }}
  {...props}
/>
```

### CSP Violation Reporting

Enable CSP violation reporting:

```tsx
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    reportUri: 'https://your-app.com/csp-report',
  }}
  {...props}
/>
```

### Programmatic CSP Building

Build CSP strings programmatically:

```typescript
import {
  createCSPConfig,
  buildCSPString,
  CSP_PRESETS,
} from '@bandofai/unido-dev';

// Use preset
const { cspString, nonce } = createCSPConfig({
  level: 'untrusted'
});

// Build from scratch
const custom = buildCSPString({
  'default-src': ["'self'"],
  'script-src': ["'self'", "'nonce-xyz'"],
}, 'xyz');

// Extend preset
const extended = createCSPConfig({
  level: 'trusted',
  directives: {
    ...CSP_PRESETS.trusted,
    'connect-src': ["'self'", 'https://api.example.com'],
  }
});
```

### Validation

Validate CSP configuration before use:

```typescript
import { validateCSPConfig } from '@bandofai/unido-dev';

const config = {
  level: 'untrusted',
  directives: {
    'script-src': ["'self'", "'unsafe-inline'"], // ❌ Not allowed for untrusted
  }
};

try {
  validateCSPConfig(config);
} catch (err) {
  console.error('Invalid CSP:', err.message);
  // Error: 'unsafe-inline' in script-src is not allowed for 'untrusted' security level
}
```

## Best Practices

### 1. Use Trusted Mode for Development

```tsx
// ✅ Good: Fast iteration in development
<WidgetIframeRenderer
  securityLevel="trusted"
  {...props}
/>
```

### 2. Use Untrusted Mode for Production

```tsx
// ✅ Good: Maximum security in production
<WidgetIframeRenderer
  securityLevel="untrusted"
  {...props}
/>
```

### 3. Test Untrusted Mode Early

Don't wait until deployment to test strict CSP:

```tsx
// ✅ Good: Test during development
const isProduction = process.env.NODE_ENV === 'production';

<WidgetIframeRenderer
  securityLevel={isProduction ? 'untrusted' : 'trusted'}
  {...props}
/>
```

### 4. Minimize Custom Directives

Only add custom directives when necessary:

```tsx
// ❌ Avoid: Overly permissive
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    directives: {
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
    }
  }}
/>

// ✅ Better: Specific allowlist
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    directives: {
      'script-src': ["'self'", 'https://trusted-cdn.com'],
    }
  }}
/>
```

### 5. Monitor CSP Violations

Use browser DevTools to identify CSP violations:

```javascript
// Listen for CSP violations
document.addEventListener('securitypolicyviolation', (e) => {
  console.error('CSP Violation:', {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    originalPolicy: e.originalPolicy,
  });
});
```

### 6. Layer Security Measures

Combine CSP with other security features:

```tsx
<WidgetIframeRenderer
  securityLevel="untrusted"           // ✅ Strict CSP
  sandbox="allow-scripts"             // ✅ Minimal sandbox permissions
  validateHtml={true}                 // ✅ HTML validation
  {...props}
/>
```

## Troubleshooting

### Widget Not Loading

**Symptom**: Blank iframe or console errors

**Solution**: Check CSP violations in browser console

```tsx
// Try relaxing CSP temporarily
<WidgetIframeRenderer
  securityLevel="trusted"
  {...props}
/>
```

### External Resources Blocked

**Symptom**: Images, fonts, or API calls failing

**Solution**: Add allowed origins to CSP

```tsx
<WidgetIframeRenderer
  csp={{
    level: 'untrusted',
    directives: {
      'img-src': ["'self'", 'data:', 'https://cdn.example.com'],
      'connect-src': ["'self'", 'https://api.example.com'],
      'font-src': ["'self'", 'https://fonts.googleapis.com'],
    }
  }}
  {...props}
/>
```

### Inline Scripts Blocked

**Symptom**: Scripts not executing in untrusted mode

**Solution**: Ensure nonce is being used (automatic in Unido)

If using custom HTML, add nonce attributes:

```typescript
import { addNonceToScripts } from '@bandofai/unido-dev';

const htmlWithNonces = addNonceToScripts(originalHtml, nonce);
```

## Security Considerations

### When to Use Trusted Mode

✅ **Appropriate for**:
- Local development
- Localhost testing
- Internal tools with vetted widgets
- Trusted widget sources you control

❌ **Not appropriate for**:
- Production environments
- Third-party widgets
- User-generated content
- Public-facing applications

### When to Use Untrusted Mode

✅ **Required for**:
- Production deployments
- Third-party widget marketplaces
- User-uploaded widgets
- SaaS platforms with custom widgets
- Any untrusted code execution

### Threat Model

**Threats Mitigated** (Untrusted Mode):
- ✅ Cross-site scripting (XSS) via inline injection
- ✅ External script loading from untrusted sources
- ✅ Data exfiltration to unauthorized domains
- ✅ Clickjacking via frame embedding
- ✅ Form submission to malicious endpoints

**Threats NOT Mitigated**:
- ⚠️ Bugs in trusted widget code
- ⚠️ Legitimate scripts with malicious behavior
- ⚠️ Social engineering attacks
- ⚠️ Server-side vulnerabilities

## API Reference

### Types

```typescript
type CSPSecurityLevel = 'trusted' | 'untrusted';

interface CSPConfig {
  level?: CSPSecurityLevel;
  directives?: CSPDirectives;
  nonce?: string;
  reportOnly?: boolean;
  reportUri?: string;
}

interface CSPDirectives {
  'default-src'?: CSPDirectiveValue[];
  'script-src'?: CSPDirectiveValue[];
  'style-src'?: CSPDirectiveValue[];
  'img-src'?: CSPDirectiveValue[];
  'connect-src'?: CSPDirectiveValue[];
  'font-src'?: CSPDirectiveValue[];
  'object-src'?: CSPDirectiveValue[];
  'media-src'?: CSPDirectiveValue[];
  'frame-src'?: CSPDirectiveValue[];
  'base-uri'?: CSPDirectiveValue[];
  'form-action'?: CSPDirectiveValue[];
  'frame-ancestors'?: CSPDirectiveValue[];
  // ... and more
}
```

### Functions

```typescript
// Generate cryptographically secure nonce
function generateCSPNonce(): string;

// Build CSP string from directives
function buildCSPString(
  directives: CSPDirectives,
  nonce?: string
): string;

// Create complete CSP configuration
function createCSPConfig(config?: CSPConfig): {
  directives: CSPDirectives;
  nonce?: string;
  cspString: string;
  metaTag: string;
};

// Validate CSP configuration
function validateCSPConfig(config: CSPConfig): void;

// Add nonce to inline scripts in HTML
function addNonceToScripts(html: string, nonce: string): string;

// Build CSP header value
function buildCSPHeader(config?: CSPConfig): string;
```

### Constants

```typescript
const CSP_PRESETS: Record<CSPSecurityLevel, CSPDirectives>;
```

## Related Documentation

- [Production Readiness Assessment](../PRODUCTION_READINESS_ASSESSMENT.md)
- [Iframe Renderer Guide](../../packages/dev/IFRAME_RENDERER.md)
- [Security Best Practices](https://developers.google.com/web/fundamentals/security/csp)
- [MDN CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Support

For security issues or questions:
- GitHub Issues: https://github.com/bandofai/unido/issues
- Security Email: security@bandofai.com (for sensitive issues)
