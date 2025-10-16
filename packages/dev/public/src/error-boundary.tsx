/**
 * Error boundary for component preview
 */

import type React from 'react';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.icon}>⚠️</div>
          <div style={styles.title}>Component Error</div>
          <div style={styles.message}>{this.state.error?.message}</div>
          <pre style={styles.stack}>{this.state.error?.stack}</pre>
          <button
            type="button"
            style={styles.button}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    padding: '40px',
    textAlign: 'center' as const,
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#c00',
  },
  message: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  stack: {
    fontSize: '11px',
    color: '#999',
    textAlign: 'left' as const,
    background: '#f5f5f5',
    padding: '12px',
    borderRadius: '8px',
    overflow: 'auto',
    maxHeight: '200px',
    marginBottom: '16px',
  },
  button: {
    padding: '8px 16px',
    border: '1px solid #e5e5e5',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
