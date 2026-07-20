/**
 * Error handling utilities for localStorage, SSE, and JSON operations
 */

/**
 * Safely handles localStorage operations with detailed error logging
 */
export class SafeLocalStorage {
  private static isAvailable: boolean | null = null;

  /**
   * Check if localStorage is available
   */
  static checkAvailability(): boolean {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
      return true;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Safely get item from localStorage
   */
  static getItem(key: string): string | null {
    if (!this.checkAvailability()) {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Safely set item in localStorage
   */
  static setItem(key: string, value: string): boolean {
    if (!this.checkAvailability()) {
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely remove item from localStorage
   */
  static removeItem(key: string): boolean {
    if (!this.checkAvailability()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely parse JSON from localStorage
   */
  static getJSON<T>(key: string): T | null {
    const value = this.getItem(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Safely stringify and set JSON in localStorage
   */
  static setJSON<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      return this.setItem(key, serialized);
    } catch {
      return false;
    }
  }
}

/**
 * Safely handle SSE (Server-Sent Events) parsing errors
 */
export class SafeSSEParser {
  /**
   * Safely parse SSE event data
   */
  static parseEventData(data: string): unknown {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Safely handle SSE event processing
   */
  static handleEvent(handler: () => void): void {
    try {
      handler();
    } catch {
      // Silently handle SSE errors
    }
  }
}

/**
 * Safely handle SSE write operations
 */
export class SafeSSEWriter {
  /**
   * Safely write to SSE response
   */
  static write(res: { writableEnded: boolean; write: (data: string) => void }, data: string): boolean {
    try {
      if (res.writableEnded) {
        return false;
      }
      res.write(data);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Safely parse JSON with detailed error handling
 */
export function safeJSONParse<T>(value: string, fallback?: T): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback ?? null;
  }
}
