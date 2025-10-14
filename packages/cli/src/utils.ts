/**
 * Utility functions for CLI
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate project name
 * Must be a valid npm package name
 */
export function validateProjectName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }

  // Check for valid characters (lowercase, numbers, hyphens, underscores)
  if (!/^[a-z0-9-_]+$/.test(name)) {
    return {
      valid: false,
      error: 'Project name can only contain lowercase letters, numbers, hyphens, and underscores',
    };
  }

  // Cannot start with dot or hyphen
  if (name.startsWith('.') || name.startsWith('-')) {
    return {
      valid: false,
      error: 'Project name cannot start with . or -',
    };
  }

  // Reserved names
  const reserved = ['node_modules', 'favicon.ico'];
  if (reserved.includes(name.toLowerCase())) {
    return {
      valid: false,
      error: `"${name}" is a reserved name`,
    };
  }

  return { valid: true };
}

/**
 * Format provider list for display
 */
export function formatProviders(provider: string): string[] {
  return [provider];
}
