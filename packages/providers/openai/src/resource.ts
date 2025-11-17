/**
 * OpenAI MCP Resource System
 * Handles ui:// resources for component templates
 */

import type { ComponentDefinition } from '@bandofai/unido-core';

/**
 * Generate a resource URI for a component
 *
 * @param componentType - Component type (e.g., 'weather-card')
 * @returns Resource URI (e.g., 'ui://widget/weather-card.html')
 */
export function generateResourceUri(componentType: string): string {
  return `ui://widget/${componentType}.html`;
}

/**
 * Resource for MCP
 */
export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType: string;
}

/**
 * Create an MCP resource for a component
 *
 * @param component - Component definition
 * @param _bundleUrl - URL to the bundled component JavaScript (reserved for future use)
 */
export function createComponentResource(
  component: ComponentDefinition,
  _bundleUrl: string
): McpResource {
  return {
    uri: generateResourceUri(component.type),
    name: component.title ?? component.type,
    description: component.description,
    mimeType: 'text/html+skybridge',
  };
}

/**
 * Generate HTML template for component resource
 *
 * This creates the HTML that loads the component bundle in an iframe.
 * Note: CSP meta tag is injected by the iframe renderer, not here.
 *
 * @param bundleUrl - URL to the component JavaScript bundle
 * @param componentType - Component type for initialization
 * @param options - Optional configuration
 * @param options.nonce - CSP nonce for inline scripts (optional, for untrusted widgets)
 */
export function generateComponentHtml(
  bundleUrl: string,
  componentType: string,
  options?: { nonce?: string }
): string {
  const nonce = options?.nonce;
  const nonceAttr = nonce ? ` nonce="${nonce}"` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentType}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  ${
    bundleUrl.startsWith('data:')
      ? `<script${nonceAttr}>${atob(bundleUrl.split(',')[1] || '')}</script>`
      : `<script src="${bundleUrl}"${nonceAttr}></script>`
  }
</body>
</html>`;
}

/**
 * Component metadata for OpenAI
 */
export interface OpenAIComponentMetadata {
  /**
   * Output template URI
   */
  outputTemplate: string;

  /**
   * Whether the component can call tools
   */
  widgetAccessible?: boolean;

  /**
   * Component description for status display
   */
  description?: string;

  /**
   * Status message while tool is invoking/loading
   */
  invoking?: string;

  /**
   * Completion message after tool has invoked
   */
  invoked?: string;

  /**
   * Indicates the tool result can produce a widget
   */
  resultCanProduceWidget?: boolean;
}

/**
 * Create OpenAI-specific component metadata
 */
export function createOpenAIMetadata(
  component: ComponentDefinition,
  options?: {
    widgetAccessible?: boolean;
    invoking?: string;
    invoked?: string;
    resultCanProduceWidget?: boolean;
  }
): OpenAIComponentMetadata {
  const title = component.title ?? component.type;

  return {
    outputTemplate: generateResourceUri(component.type),
    widgetAccessible: options?.widgetAccessible ?? false,
    description: component.description,
    invoking: options?.invoking ?? `Loading ${title}...`,
    invoked: options?.invoked ?? `${title} loaded`,
    resultCanProduceWidget: options?.resultCanProduceWidget ?? true,
  };
}
