/**
 * Test setup file
 * Runs before all tests
 */

import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, vi } from 'vitest';

// Mock fetch globally with proper SSE response including ReadableStream
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Headers({
    'content-type': 'text/event-stream',
  }),
  body: new ReadableStream({
    start(controller) {
      // Simulate SSE message stream
      // Keep the stream open for testing
      controller.enqueue(new TextEncoder().encode('data: {"jsonrpc":"2.0","id":1,"result":{}}\n\n'));
    },
  }),
  json: async () => ({}),
  text: async () => '',
  blob: async () => new Blob(),
  arrayBuffer: async () => new ArrayBuffer(0),
  formData: async () => new FormData(),
  clone: vi.fn(),
});

// Mock EventSource for SSE with proper lifecycle simulation
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  CONNECTING = 0;
  OPEN = 1;
  CLOSED = 2;

  readyState = 0;
  url: string;
  withCredentials = false;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;

  private listeners = new Map<string, Set<EventListener>>();

  constructor(url: string | URL) {
    this.url = url.toString();

    // Simulate successful connection after a microtask
    setTimeout(() => {
      this.readyState = this.OPEN;
      const openEvent = new Event('open');
      if (this.onopen) {
        this.onopen(openEvent);
      }
      this.dispatchEvent(openEvent);
    }, 0);
  }

  addEventListener(type: string, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
    return true;
  }

  close(): void {
    this.readyState = this.CLOSED;
  }
}

global.EventSource = MockEventSource as unknown as typeof EventSource;

// Setup console mocks to reduce noise in tests
beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
