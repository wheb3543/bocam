/**
 * ملف إعداد الاختبارات العام لـ Vitest
 * يتم تحميل هذا الملف قبل جميع الاختبارات ويوفر mocks عامة وأدوات مساعدة
 */

import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// ============================================================================
// Mock لـ localStorage
// ============================================================================

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ============================================================================
// Mock لـ sessionStorage
// ============================================================================

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// ============================================================================
// Mock لـ window.matchMedia
// ============================================================================

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ============================================================================
// Mock لـ EventSource (لـ SSE)
// ============================================================================

class MockEventSource {
  url: string;
  listeners: Record<string, Function[]> = {};
  readyState: number = 0;
  static instances: MockEventSource[] = [];

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
    this.readyState = 0; // CONNECTING
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
    }, 10);
  }

  addEventListener(event: string, cb: Function) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(cb);
  }

  removeEventListener(event: string, cb: Function) {
    this.listeners[event] = (this.listeners[event] || []).filter((f) => f !== cb);
  }

  close() {
    this.readyState = 2; // CLOSED
    const index = MockEventSource.instances.indexOf(this);
    if (index > -1) {
      MockEventSource.instances.splice(index, 1);
    }
  }

  // Helper to emit events for testing
  emit(event: string, data: unknown) {
    const ev = { data: JSON.stringify(data) } as unknown;
    (this.listeners[event] || []).forEach((cb) => cb(ev));
  }

  // Helper to emit message events
  emitMessage(data: unknown) {
    this.emit('message', data);
  }

  // Helper to emit error events
  emitError(error: Error) {
    this.emit('error', error);
  }

  // Helper to emit open events
  emitOpen() {
    this.emit('open', {});
  }
}

Object.defineProperty(global, 'EventSource', {
  value: MockEventSource,
  writable: true,
});

// ============================================================================
// Mock لـ WebSocket
// ============================================================================

class MockWebSocket {
  url: string;
  readyState: number = 0;
  listeners: Record<string, Function[]> = {};
  static instances: MockWebSocket[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    this.readyState = 0; // CONNECTING
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.emit('open');
    }, 10);
  }

  addEventListener(event: string, cb: Function) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(cb);
  }

  removeEventListener(event: string, cb: Function) {
    this.listeners[event] = (this.listeners[event] || []).filter((f) => f !== cb);
  }

  send(data: string) {
    // Simulate sending data
    setTimeout(() => {
      this.emit('message', { data });
    }, 5);
  }

  close() {
    this.readyState = 3; // CLOSED
    this.emit('close');
    const index = MockWebSocket.instances.indexOf(this);
    if (index > -1) {
      MockWebSocket.instances.splice(index, 1);
    }
  }

  // Helper to emit events for testing
  emit(event: string, data?: unknown) {
    (this.listeners[event] || []).forEach((cb) => cb(data));
  }

  // Static helper to clear all instances
  static clearAll() {
    MockWebSocket.instances = [];
  }
}

Object.defineProperty(global, 'WebSocket', {
  value: MockWebSocket,
  writable: true,
});

// ============================================================================
// Mock لـ IntersectionObserver
// ============================================================================

class MockIntersectionObserver implements IntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];
  root: Element | Document | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    if (options) {
      this.root = options.root || null;
      this.rootMargin = options.rootMargin || '0px';
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold || 0];
    }
  }

  observe(element: Element) {
    this.elements.push(element);
    // Simulate intersection after a short delay
    setTimeout(() => {
      this.callback(
        [
          {
            target: element,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: element.getBoundingClientRect(),
            intersectionRect: element.getBoundingClientRect(),
            rootBounds: null,
            time: Date.now(),
          },
        ],
        this
      );
    }, 10);
  }

  unobserve(element: Element) {
    this.elements = this.elements.filter((el) => el !== element);
  }

  disconnect() {
    this.elements = [];
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver,
  writable: true,
});

// ============================================================================
// Mock لـ ResizeObserver
// ============================================================================

class MockResizeObserver {
  callback: ResizeObserverCallback;
  elements: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element) {
    this.elements.push(element);
    // Simulate resize after a short delay
    setTimeout(() => {
      this.callback(
        [
          {
            target: element,
            contentRect: element.getBoundingClientRect(),
            borderBoxSize: [{ inlineSize: 100, blockSize: 100 }],
            contentBoxSize: [{ inlineSize: 100, blockSize: 100 }],
            devicePixelContentBoxSize: [{ inlineSize: 100, blockSize: 100 }],
          },
        ],
        this
      );
    }, 10);
  }

  unobserve(element: Element) {
    this.elements = this.elements.filter((el) => el !== element);
  }

  disconnect() {
    this.elements = [];
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  value: MockResizeObserver,
  writable: true,
});

// ============================================================================
// Mock لـ MutationObserver
// ============================================================================

class MockMutationObserver {
  callback: MutationCallback;
  elements: Node[] = [];

  constructor(callback: MutationCallback) {
    this.callback = callback;
  }

  observe(target: Node, _options?: MutationObserverInit) {
    this.elements.push(target);
  }

  disconnect() {
    this.elements = [];
  }

  takeRecords(): MutationRecord[] {
    return [];
  }
}

Object.defineProperty(window, 'MutationObserver', {
  value: MockMutationObserver,
  writable: true,
});

// ============================================================================
// Mock لـ scrollTo
// ============================================================================

window.scrollTo = vi.fn();

// ============================================================================
// Mock لـ getBoundingClientRect
// ============================================================================

Element.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  x: 0,
  y: 0,
  toJSON: () => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
  }),
}));

// ============================================================================
// Mock لـ HTMLCanvasElement.toBlob
// ============================================================================

HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const blob = new Blob([''], { type: 'image/png' });
  callback(blob);
});

// ============================================================================
// Mock لـ URL.createObjectURL
// ============================================================================

global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// ============================================================================
// Mock لقارئ الملفات (File Reader)
// ============================================================================

class MockFileReader {
  result: string | ArrayBuffer | null = null;
  readyState: number = 0;
  error: Error | null = null;
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(_blob: Blob) {
    this.readyState = 1; // LOADING - جاري التحميل
    setTimeout(() => {
      this.readyState = 2; // DONE - تم
      this.result = 'data:image/png;base64,mock-data';
      if (this.onload) {
        this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
      }
      if (this.onloadend) {
        this.onloadend({ target: this } as unknown as ProgressEvent<FileReader>);
      }
    }, 10);
  }

  readAsText(_blob: Blob) {
    this.readyState = 1; // LOADING - جاري التحميل
    setTimeout(() => {
      this.readyState = 2; // DONE - تم
      this.result = 'mock-text';
      if (this.onload) {
        this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
      }
      if (this.onloadend) {
        this.onloadend({ target: this } as unknown as ProgressEvent<FileReader>);
      }
    }, 10);
  }

  readAsArrayBuffer(_blob: Blob) {
    this.readyState = 1; // LOADING - جاري التحميل
    setTimeout(() => {
      this.readyState = 2; // DONE - تم
      this.result = new ArrayBuffer(10);
      if (this.onload) {
        this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
      }
      if (this.onloadend) {
        this.onloadend({ target: this } as unknown as ProgressEvent<FileReader>);
      }
    }, 10);
  }
}

Object.defineProperty(global, 'FileReader', {
  value: MockFileReader,
  writable: true,
});

// ============================================================================
// Mock لـ Clipboard API
// ============================================================================

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('mock-text')),
  },
});

// ============================================================================
// Mock لـ Notification
// ============================================================================

class MockNotification {
  static permission: NotificationPermission = 'granted';
  title: string;
  options?: NotificationOptions;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
  }

  static requestPermission(): Promise<NotificationPermission> {
    return Promise.resolve('granted');
  }
}

Object.defineProperty(global, 'Notification', {
  value: MockNotification,
  writable: true,
});

// ============================================================================
// Mock لـ Service Worker
// ============================================================================

const mockServiceWorkerRegistration = {
  update: vi.fn(() => Promise.resolve()),
  unregister: vi.fn(() => Promise.resolve()),
  active: null,
  installing: null,
  waiting: null,
  scope: '/',
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn(() => Promise.resolve(mockServiceWorkerRegistration)),
    ready: Promise.resolve(mockServiceWorkerRegistration),
    controller: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

// ============================================================================
// التنظيف بعد كل اختبار
// ============================================================================

afterEach(() => {
  // مسح localStorage
  localStorage.clear();
  // مسح sessionStorage
  sessionStorage.clear();
  // مسح حالات EventSource
  MockEventSource.instances = [];
  // مسح حالات WebSocket
  MockWebSocket.clearAll();
  // مسح جميع الـ mocks
  vi.clearAllMocks();
});

// ============================================================================
// تصدير الأدوات المساعدة للاستخدام في الاختبارات
// ============================================================================

export { MockEventSource, MockWebSocket };
