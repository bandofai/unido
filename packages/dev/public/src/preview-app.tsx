/**
 * Widget preview React application
 */

import { components as componentData } from 'virtual:unido-components';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './error-boundary.js';
import { PropEditor } from './prop-editor.js';

interface ComponentInfo {
  type: string;
  title: string;
  description: string;
  sourcePath: string;
}

const App = () => {
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(
    componentData[0] || null
  );
  const [props, setProps] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<'single' | 'gallery'>('single');

  // Dynamically import component
  const loadComponent = (sourcePath: string) => {
    return lazy(() =>
      import(/* @vite-ignore */ sourcePath).then((module) => ({
        default: module.default || Object.values(module)[0],
      }))
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🎨 Unido Widget Preview</h1>
          <div style={styles.controls}>
            <button
              type="button"
              style={{
                ...styles.button,
                ...(viewMode === 'single' ? styles.buttonActive : {}),
              }}
              onClick={() => setViewMode('single')}
            >
              Single
            </button>
            <button
              type="button"
              style={{
                ...styles.button,
                ...(viewMode === 'gallery' ? styles.buttonActive : {}),
              }}
              onClick={() => setViewMode('gallery')}
            >
              Gallery
            </button>
          </div>
        </div>
      </header>

      <div style={styles.main}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Components ({componentData.length})</h2>
          <ul style={styles.componentList}>
            {componentData.map((comp: ComponentInfo) => (
              <li key={comp.type} style={styles.componentItem}>
                <button
                  type="button"
                  style={{
                    ...styles.componentButton,
                    ...(selectedComponent?.type === comp.type ? styles.componentItemActive : {}),
                  }}
                  onClick={() => {
                    setSelectedComponent(comp);
                    setProps({});
                  }}
                >
                  <div style={styles.componentName}>{comp.title}</div>
                  <div style={styles.componentType}>{comp.type}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main style={styles.content}>
          {viewMode === 'single' && selectedComponent && (
            <div style={styles.singleView}>
              {/* Component info */}
              <div style={styles.infoPanel}>
                <h2>{selectedComponent.title}</h2>
                <p style={styles.description}>{selectedComponent.description}</p>
                <code style={styles.path}>{selectedComponent.sourcePath}</code>
              </div>

              {/* Prop editor */}
              <PropEditor props={props} onChange={setProps} />

              {/* Preview */}
              <div style={styles.preview}>
                <div style={styles.previewLabel}>Preview</div>
                <div style={styles.previewFrame}>
                  <ErrorBoundary>
                    <Suspense fallback={<div style={styles.loading}>Loading...</div>}>
                      {React.createElement(loadComponent(selectedComponent.sourcePath), props)}
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'gallery' && (
            <div style={styles.gallery}>
              {componentData.map((comp: ComponentInfo) => (
                <div key={comp.type} style={styles.galleryCard}>
                  <h3 style={styles.galleryTitle}>{comp.title}</h3>
                  <p style={styles.galleryDescription}>{comp.description}</p>
                  <div style={styles.galleryPreview}>
                    <ErrorBoundary>
                      <Suspense fallback={<div style={styles.loading}>Loading...</div>}>
                        {React.createElement(loadComponent(comp.sourcePath), {})}
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e5e5e5',
    padding: '16px 24px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
  },
  controls: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '8px 16px',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  buttonActive: {
    background: '#000',
    color: '#fff',
    borderColor: '#000',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '280px',
    background: '#fff',
    borderRight: '1px solid #e5e5e5',
    padding: '20px',
    overflowY: 'auto' as const,
  },
  sidebarTitle: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '12px',
    textTransform: 'uppercase' as const,
    color: '#666',
  },
  componentList: {
    listStyle: 'none',
  },
  componentItem: {
    listStyle: 'none',
  },
  componentButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'background 0.2s',
    border: 'none',
    background: 'transparent',
    textAlign: 'left' as const,
  },
  componentItemActive: {
    background: '#f5f5f5',
  },
  componentName: {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '4px',
  },
  componentType: {
    fontSize: '12px',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto' as const,
  },
  singleView: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  infoPanel: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  description: {
    margin: '8px 0',
    color: '#666',
  },
  path: {
    fontSize: '12px',
    color: '#999',
  },
  preview: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '20px',
  },
  previewLabel: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '12px',
    textTransform: 'uppercase' as const,
    color: '#666',
  },
  previewFrame: {
    padding: '20px',
    border: '2px dashed #e5e5e5',
    borderRadius: '8px',
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  galleryCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e5e5',
  },
  galleryTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  galleryDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  galleryPreview: {
    border: '2px dashed #e5e5e5',
    borderRadius: '8px',
    padding: '16px',
    minHeight: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    color: '#999',
    fontSize: '14px',
  },
};

// Mount app
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
