/**
 * Universal component system for Unido
 */

import type {
  ComponentBundle,
  ComponentDefinition,
  ProviderName,
} from '@bandofai/unido-core/types.js';

// ============================================================================
// Component Registry
// ============================================================================

export class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>();
  private bundles = new Map<string, Map<ProviderName, ComponentBundle>>();

  /**
   * Register a component
   */
  register(component: ComponentDefinition): void {
    if (this.components.has(component.type)) {
      throw new Error(`Component "${component.type}" is already registered`);
    }

    this.components.set(component.type, component);
    this.bundles.set(component.type, new Map());
  }

  /**
   * Get a component definition
   */
  get(type: string): ComponentDefinition | undefined {
    return this.components.get(type);
  }

  /**
   * Get all registered components
   */
  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  /**
   * Check if a component exists
   */
  has(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * Register a component bundle for a provider
   */
  registerBundle(bundle: ComponentBundle): void {
    const providerBundles = this.bundles.get(bundle.type);

    if (!providerBundles) {
      throw new Error(`Component "${bundle.type}" is not registered`);
    }

    providerBundles.set(bundle.provider, bundle);
  }

  /**
   * Get a component bundle for a specific provider
   */
  getBundle(type: string, provider: ProviderName): ComponentBundle | undefined {
    return this.bundles.get(type)?.get(provider);
  }

  /**
   * Get all bundles for a component
   */
  getAllBundles(type: string): ComponentBundle[] {
    const providerBundles = this.bundles.get(type);
    return providerBundles ? Array.from(providerBundles.values()) : [];
  }

  /**
   * Clear all components
   */
  clear(): void {
    this.components.clear();
    this.bundles.clear();
  }
}

// ============================================================================
// Component Helpers
// ============================================================================

/**
 * Create a component definition
 */
export function defineComponent(definition: ComponentDefinition): ComponentDefinition {
  return definition;
}
