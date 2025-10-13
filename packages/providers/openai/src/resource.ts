/**
 * OpenAI MCP Resource System
 * Handles ui:// resources for component templates
 */

import type { ComponentDefinition } from '@unido/core';

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
 *
 * @param bundleUrl - URL to the component JavaScript bundle
 * @param componentType - Component type for initialization
 */
export function generateComponentHtml(bundleUrl: string, componentType: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentType}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${bundleUrl}"></script>
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
}

/**
 * Create OpenAI-specific component metadata
 */
export function createOpenAIMetadata(
  component: ComponentDefinition,
  options?: {
    widgetAccessible?: boolean;
  }
): OpenAIComponentMetadata {
  return {
    outputTemplate: generateResourceUri(component.type),
    widgetAccessible: options?.widgetAccessible ?? false,
    description: component.description,
  };
}
