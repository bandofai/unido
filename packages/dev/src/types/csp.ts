/**
 * Content Security Policy (CSP) configuration types
 *
 * Provides type-safe CSP management for widget iframes with support
 * for both trusted (development) and untrusted (production) scenarios.
 */

/**
 * CSP security level determines the strictness of the policy
 */
export type CSPSecurityLevel = 'trusted' | 'untrusted';

/**
 * CSP directive values
 */
export type CSPDirectiveValue =
  | "'self'"
  | "'none'"
  | "'unsafe-inline'"
  | "'unsafe-eval'"
  | "'strict-dynamic'"
  | `'nonce-${string}'`
  | `'sha256-${string}'`
  | `'sha384-${string}'`
  | `'sha512-${string}'`
  | 'data:'
  | 'blob:'
  | 'https:'
  | 'http:'
  | string;

/**
 * Complete CSP directives configuration
 */
export interface CSPDirectives {
  /**
   * Fallback for other fetch directives
   * @default ["'self'", "'unsafe-inline'", "'unsafe-eval'", "data:", "blob:"]
   */
  'default-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for JavaScript
   * @default ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
   */
  'script-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for stylesheets
   * @default ["'self'", "'unsafe-inline'"]
   */
  'style-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for images
   * @default ["'self'", "data:", "https:"]
   */
  'img-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for XMLHttpRequest, WebSocket, EventSource, etc.
   * @default ["'self'"]
   */
  'connect-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for fonts
   */
  'font-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for <object>, <embed>, and <applet>
   */
  'object-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for <audio> and <video>
   */
  'media-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for Worker, SharedWorker, or ServiceWorker scripts
   */
  'worker-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for <frame> and <iframe>
   */
  'frame-src'?: CSPDirectiveValue[];

  /**
   * Valid sources for form submissions
   */
  'form-action'?: CSPDirectiveValue[];

  /**
   * Valid ancestors that can embed this resource in <frame>, <iframe>, etc.
   */
  'frame-ancestors'?: CSPDirectiveValue[];

  /**
   * Valid sources for loading resources using script interfaces
   */
  'prefetch-src'?: CSPDirectiveValue[];

  /**
   * Restricts URLs that can appear in a page's <base> element
   */
  'base-uri'?: CSPDirectiveValue[];

  /**
   * Enables Content Security Policy protection in sandbox mode
   */
  sandbox?: (
    | 'allow-forms'
    | 'allow-modals'
    | 'allow-orientation-lock'
    | 'allow-pointer-lock'
    | 'allow-popups'
    | 'allow-popups-to-escape-sandbox'
    | 'allow-presentation'
    | 'allow-same-origin'
    | 'allow-scripts'
    | 'allow-top-navigation'
    | 'allow-top-navigation-by-user-activation'
  )[];

  /**
   * Controls which features can be used in the document
   */
  'require-trusted-types-for'?: ["'script'"];

  /**
   * Trusted Types policy names
   */
  'trusted-types'?: (string | "'none'")[];

  /**
   * Upgrade insecure requests
   */
  'upgrade-insecure-requests'?: boolean;

  /**
   * Block all mixed content
   */
  'block-all-mixed-content'?: boolean;
}

/**
 * CSP configuration options
 */
export interface CSPConfig {
  /**
   * Security level: 'trusted' for development, 'untrusted' for production
   * @default 'trusted'
   */
  level?: CSPSecurityLevel;

  /**
   * Custom CSP directives (merged with level-based defaults)
   */
  directives?: CSPDirectives;

  /**
   * Nonce value for inline scripts (required for 'untrusted' level)
   * Auto-generated if not provided when level is 'untrusted'
   */
  nonce?: string;

  /**
   * Whether to report CSP violations
   * @default false
   */
  reportOnly?: boolean;

  /**
   * URI to report CSP violations to
   */
  reportUri?: string;
}

/**
 * Preset CSP configurations for different security levels
 */
export const CSP_PRESETS: Record<CSPSecurityLevel, CSPDirectives> = {
  /**
   * TRUSTED: Permissive policy for development and trusted widgets
   * - Allows inline scripts and styles (needed for bundled React components)
   * - Allows eval (needed for some build tools and dynamic imports)
   * - Suitable for local development and trusted widget sources
   */
  trusted: {
    'default-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'data:', 'blob:'],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'"],
    'font-src': ["'self'", 'data:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  /**
   * UNTRUSTED: Strict policy for production and untrusted widgets
   * - Requires nonce for inline scripts
   * - Disallows eval
   * - Restricts resource loading to same-origin or explicit allowlist
   * - Use 'strict-dynamic' for modern browsers
   */
  untrusted: {
    'default-src': ["'self'"],
    // Note: nonce will be injected at runtime when CSP is built
    'script-src': ["'self'", "'strict-dynamic'"],
    'style-src': ["'self'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'"],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': true,
  },
};

/**
 * Generate a cryptographically secure nonce for CSP
 * @returns Base64-encoded nonce string
 */
export function generateCSPNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  if (typeof require !== 'undefined') {
    // Node.js environment
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodeCrypto = require('node:crypto');
      return nodeCrypto.randomBytes(16).toString('base64');
    } catch {
      // Fallback if crypto is not available
      console.warn('[CSP] crypto module not available, using insecure nonce generation');
    }
  }

  // Fallback (not cryptographically secure - use only for development)
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return btoa(`${timestamp}-${random}`);
}

/**
 * Build CSP string from directives
 * @param directives CSP directives configuration
 * @param nonce Optional nonce to inject into script-src
 * @returns CSP policy string
 */
export function buildCSPString(directives: CSPDirectives, nonce?: string): string {
  const parts: string[] = [];

  for (const [directive, value] of Object.entries(directives)) {
    if (value === undefined || value === null) continue;

    // Handle boolean directives
    if (typeof value === 'boolean') {
      if (value) {
        parts.push(directive);
      }
      continue;
    }

    // Handle array directives
    if (Array.isArray(value)) {
      let directiveValues = [...value];

      // Inject nonce into script-src if provided
      if (directive === 'script-src' && nonce) {
        directiveValues = [`'nonce-${nonce}'`, ...directiveValues];
      }

      if (directiveValues.length > 0) {
        parts.push(`${directive} ${directiveValues.join(' ')}`);
      }
      continue;
    }
  }

  return parts.join('; ');
}

/**
 * Create CSP configuration from options
 * @param config CSP configuration options
 * @returns Complete CSP configuration with merged directives
 */
export function createCSPConfig(config: CSPConfig = {}): {
  directives: CSPDirectives;
  nonce?: string;
  cspString: string;
  metaTag: string;
} {
  const level = config.level ?? 'trusted';
  const baseDirectives = CSP_PRESETS[level];

  // Generate nonce for untrusted level if not provided
  let nonce = config.nonce;
  if (level === 'untrusted' && !nonce) {
    nonce = generateCSPNonce();
  }

  // Merge custom directives with base directives
  const directives: CSPDirectives = {
    ...baseDirectives,
    ...config.directives,
  };

  // Build CSP string
  const cspString = buildCSPString(directives, nonce);

  // Build meta tag
  const metaTag = `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;

  return {
    directives,
    nonce,
    cspString,
    metaTag,
  };
}

/**
 * Validate CSP configuration
 * @param config CSP configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateCSPConfig(config: CSPConfig): void {
  if (config.level === 'untrusted') {
    const directives = config.directives || CSP_PRESETS.untrusted;

    // Check that unsafe-inline is not used in script-src for untrusted
    const scriptSrc = directives['script-src'] || [];
    if (scriptSrc.includes("'unsafe-inline'")) {
      throw new Error(
        "CSP validation failed: 'unsafe-inline' in script-src is not allowed for 'untrusted' security level"
      );
    }

    // Check that unsafe-eval is not used for untrusted
    if (scriptSrc.includes("'unsafe-eval'")) {
      throw new Error(
        "CSP validation failed: 'unsafe-eval' in script-src is not allowed for 'untrusted' security level"
      );
    }
  }
}

/**
 * Add nonce attribute to script tags in HTML
 * @param html HTML string
 * @param nonce Nonce value
 * @returns HTML with nonce attributes added to script tags
 */
export function addNonceToScripts(html: string, nonce: string): string {
  // Add nonce to inline script tags that don't already have one
  return html.replace(
    /<script(?![^>]*\bnonce=)([^>]*)>/gi,
    `<script nonce="${nonce}"$1>`
  );
}

/**
 * HTTP CSP header builder
 * @param config CSP configuration
 * @returns CSP header value
 */
export function buildCSPHeader(config: CSPConfig = {}): string {
  const { cspString } = createCSPConfig(config);
  return cspString;
}
