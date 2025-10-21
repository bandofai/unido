/**
 * Tests for CSP (Content Security Policy) utilities
 */

import { describe, it, expect } from 'vitest';
import {
  generateCSPNonce,
  buildCSPString,
  createCSPConfig,
  validateCSPConfig,
  addNonceToScripts,
  CSP_PRESETS,
  type CSPConfig,
  type CSPDirectives,
} from '../csp.js';

describe('CSP Utilities', () => {
  describe('generateCSPNonce', () => {
    it('should generate a non-empty nonce', () => {
      const nonce = generateCSPNonce();
      expect(nonce).toBeTruthy();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate unique nonces', () => {
      const nonce1 = generateCSPNonce();
      const nonce2 = generateCSPNonce();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('buildCSPString', () => {
    it('should build CSP string from directives', () => {
      const directives: CSPDirectives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
      };

      const csp = buildCSPString(directives);
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    });

    it('should inject nonce into script-src', () => {
      const directives: CSPDirectives = {
        'script-src': ["'self'"],
      };

      const csp = buildCSPString(directives, 'test-nonce');
      expect(csp).toContain("'nonce-test-nonce'");
      expect(csp).toContain("'self'");
    });

    it('should handle empty directives', () => {
      const csp = buildCSPString({});
      expect(csp).toBe('');
    });

    it('should handle boolean directives', () => {
      const directives: CSPDirectives = {
        'upgrade-insecure-requests': true,
      };

      const csp = buildCSPString(directives);
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('should skip false boolean directives', () => {
      const directives: CSPDirectives = {
        'upgrade-insecure-requests': false,
      };

      const csp = buildCSPString(directives);
      expect(csp).not.toContain('upgrade-insecure-requests');
    });
  });

  describe('createCSPConfig', () => {
    it('should create trusted CSP config by default', () => {
      const config = createCSPConfig();
      expect(config.directives['script-src']).toContain("'unsafe-inline'");
      expect(config.directives['script-src']).toContain("'unsafe-eval'");
      expect(config.nonce).toBeUndefined();
    });

    it('should create untrusted CSP config with nonce', () => {
      const config = createCSPConfig({ level: 'untrusted' });
      expect(config.directives['script-src']).not.toContain("'unsafe-inline'");
      expect(config.directives['script-src']).not.toContain("'unsafe-eval'");
      expect(config.directives['script-src']).toContain("'strict-dynamic'");
      expect(config.nonce).toBeTruthy();
    });

    it('should use provided nonce', () => {
      const config = createCSPConfig({
        level: 'untrusted',
        nonce: 'custom-nonce',
      });
      expect(config.nonce).toBe('custom-nonce');
    });

    it('should merge custom directives with base', () => {
      const config = createCSPConfig({
        level: 'trusted',
        directives: {
          'connect-src': ["'self'", 'https://api.example.com'],
        },
      });
      expect(config.directives['connect-src']).toContain('https://api.example.com');
    });

    it('should generate meta tag', () => {
      const config = createCSPConfig({ level: 'trusted' });
      expect(config.metaTag).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(config.metaTag).toContain('content="');
    });

    it('should include nonce in CSP string for untrusted mode', () => {
      const config = createCSPConfig({ level: 'untrusted' });
      expect(config.cspString).toContain(`'nonce-${config.nonce}'`);
    });
  });

  describe('validateCSPConfig', () => {
    it('should pass for valid trusted config', () => {
      const config: CSPConfig = {
        level: 'trusted',
        directives: {
          'script-src': ["'self'", "'unsafe-inline'"],
        },
      };
      expect(() => validateCSPConfig(config)).not.toThrow();
    });

    it('should pass for valid untrusted config', () => {
      const config: CSPConfig = {
        level: 'untrusted',
        directives: {
          'script-src': ["'self'", "'strict-dynamic'"],
        },
      };
      expect(() => validateCSPConfig(config)).not.toThrow();
    });

    it('should fail for untrusted config with unsafe-inline', () => {
      const config: CSPConfig = {
        level: 'untrusted',
        directives: {
          'script-src': ["'self'", "'unsafe-inline'"],
        },
      };
      expect(() => validateCSPConfig(config)).toThrow(/unsafe-inline/);
    });

    it('should fail for untrusted config with unsafe-eval', () => {
      const config: CSPConfig = {
        level: 'untrusted',
        directives: {
          'script-src': ["'self'", "'unsafe-eval'"],
        },
      };
      expect(() => validateCSPConfig(config)).toThrow(/unsafe-eval/);
    });
  });

  describe('addNonceToScripts', () => {
    it('should add nonce to inline scripts', () => {
      const html = '<script>console.log("test");</script>';
      const result = addNonceToScripts(html, 'test-nonce');
      expect(result).toContain('nonce="test-nonce"');
    });

    it('should add nonce to multiple scripts', () => {
      const html = `
        <script>console.log("1");</script>
        <script>console.log("2");</script>
      `;
      const result = addNonceToScripts(html, 'test-nonce');
      const matches = result.match(/nonce="test-nonce"/g);
      expect(matches).toHaveLength(2);
    });

    it('should not duplicate nonce', () => {
      const html = '<script nonce="existing">console.log("test");</script>';
      const result = addNonceToScripts(html, 'new-nonce');
      expect(result).not.toContain('new-nonce');
      expect(result).toContain('existing');
    });

    it('should handle scripts with attributes', () => {
      const html = '<script type="module">console.log("test");</script>';
      const result = addNonceToScripts(html, 'test-nonce');
      expect(result).toContain('nonce="test-nonce"');
      expect(result).toContain('type="module"');
    });

    it('should be case insensitive', () => {
      const html = '<SCRIPT>console.log("test");</SCRIPT>';
      const result = addNonceToScripts(html, 'test-nonce');
      expect(result).toContain('nonce="test-nonce"');
    });
  });

  describe('CSP_PRESETS', () => {
    it('should have trusted preset', () => {
      expect(CSP_PRESETS.trusted).toBeDefined();
      expect(CSP_PRESETS.trusted['script-src']).toContain("'unsafe-inline'");
      expect(CSP_PRESETS.trusted['script-src']).toContain("'unsafe-eval'");
    });

    it('should have untrusted preset', () => {
      expect(CSP_PRESETS.untrusted).toBeDefined();
      expect(CSP_PRESETS.untrusted['script-src']).not.toContain("'unsafe-inline'");
      expect(CSP_PRESETS.untrusted['script-src']).not.toContain("'unsafe-eval'");
      expect(CSP_PRESETS.untrusted['script-src']).toContain("'strict-dynamic'");
    });

    it('trusted preset should have object-src none', () => {
      expect(CSP_PRESETS.trusted['object-src']).toContain("'none'");
    });

    it('untrusted preset should have frame-ancestors none', () => {
      expect(CSP_PRESETS.untrusted['frame-ancestors']).toContain("'none'");
    });

    it('untrusted preset should have upgrade-insecure-requests', () => {
      expect(CSP_PRESETS.untrusted['upgrade-insecure-requests']).toBe(true);
    });
  });
});
