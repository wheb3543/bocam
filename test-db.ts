/**
 * قاعدة بيانات الاختبارات (Test Database)
 * يوفر mock لقاعدة البيانات للاستخدام في الاختبارات
 *
 * ملاحظة: هذا الملف يوفر mock بسيط لقاعدة البيانات
 * للاختبارات المتقدمة، يفضل استخدام قاعدة بيانات حقيقية في الذاكرة (SQLite)
 */

import { vi } from 'vitest';

// ============================================================================
// أنواع TypeScript
// ============================================================================

/**
 * Mock query result
 */
interface MockQueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  insertId?: number;
}

/**
 * Mock database connection
 */
interface MockDatabase {
  query: (sql: string, params?: unknown[]) => Promise<MockQueryResult>;
  execute: (sql: string, params?: unknown[]) => Promise<MockQueryResult>;
  beginTransaction: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  close: () => Promise<void>;
}

// ============================================================================
// مخزن البيانات Mock
// ============================================================================

/**
 * مخزن البيانات في الذاكرة للاختبارات
 */
const mockDataStore = {
  patients: [] as unknown[],
  appointments: [] as unknown[],
  leads: [] as unknown[],
  conversations: [] as unknown[],
  messages: [] as unknown[],
  doctors: [] as unknown[],
  campaigns: [] as unknown[],
  camps: [] as unknown[],
  offers: [] as unknown[],
  users: [] as unknown[],
  settings: [] as unknown[],
};

/**
 * إعادة تعيين بيانات mock
 */
export const resetMockDatabase = () => {
  mockDataStore.patients = [];
  mockDataStore.appointments = [];
  mockDataStore.leads = [];
  mockDataStore.conversations = [];
  mockDataStore.messages = [];
  mockDataStore.doctors = [];
  mockDataStore.campaigns = [];
  mockDataStore.camps = [];
  mockDataStore.offers = [];
  mockDataStore.users = [];
  mockDataStore.settings = [];
};

/**
 * تعيين بيانات mock
 */
export const setMockData = (table: keyof typeof mockDataStore, data: unknown[]) => {
  mockDataStore[table] = data;
};

/**
 * الحصول على بيانات mock
 */
export const getMockData = (table: keyof typeof mockDataStore) => {
  return mockDataStore[table];
};

// ============================================================================
// Mock Database Implementation
// ============================================================================

/**
 * إنشاء mock database
 */
export const createMockDatabase = (): MockDatabase => {
  return {
    /**
     * Mock query function
     */
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      // محاكاة تأخير قاعدة البيانات
      void new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      // تحليل SQL البسيط
      const sqlLower = sql.toLowerCase();

      // SELECT queries
      if (sqlLower.startsWith('select')) {
        if (sqlLower.includes('patients')) {
          return { rows: mockDataStore.patients, rowCount: mockDataStore.patients.length };
        }
        if (sqlLower.includes('appointments')) {
          return { rows: mockDataStore.appointments, rowCount: mockDataStore.appointments.length };
        }
        if (sqlLower.includes('leads')) {
          return { rows: mockDataStore.leads, rowCount: mockDataStore.leads.length };
        }
        if (sqlLower.includes('conversations')) {
          return {
            rows: mockDataStore.conversations,
            rowCount: mockDataStore.conversations.length,
          };
        }
        if (sqlLower.includes('messages')) {
          return { rows: mockDataStore.messages, rowCount: mockDataStore.messages.length };
        }
        if (sqlLower.includes('doctors')) {
          return { rows: mockDataStore.doctors, rowCount: mockDataStore.doctors.length };
        }
        if (sqlLower.includes('campaigns')) {
          return { rows: mockDataStore.campaigns, rowCount: mockDataStore.campaigns.length };
        }
        if (sqlLower.includes('camps')) {
          return { rows: mockDataStore.camps, rowCount: mockDataStore.camps.length };
        }
        if (sqlLower.includes('offers')) {
          return { rows: mockDataStore.offers, rowCount: mockDataStore.offers.length };
        }
        if (sqlLower.includes('users')) {
          return { rows: mockDataStore.users, rowCount: mockDataStore.users.length };
        }
        if (sqlLower.includes('settings')) {
          return { rows: mockDataStore.settings, rowCount: mockDataStore.settings.length };
        }
      }

      // INSERT queries
      if (sqlLower.startsWith('insert')) {
        const insertId = Date.now();
        if (sqlLower.includes('patients') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.patients.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('appointments') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.appointments.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('leads') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.leads.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('conversations') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.conversations.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('messages') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.messages.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('doctors') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.doctors.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('campaigns') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.campaigns.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('camps') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.camps.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('offers') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.offers.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('users') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.users.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
        if (sqlLower.includes('settings') && params) {
          const data = params[0] as Record<string, unknown>;
          mockDataStore.settings.push({ id: insertId, ...data });
          return { rows: [{ id: insertId, ...data }], rowCount: 1, insertId };
        }
      }

      // UPDATE queries
      if (sqlLower.startsWith('update')) {
        if (sqlLower.includes('patients') && params) {
          const id = params[params.length - 1];
          const data = params[0] as Record<string, unknown>;
          mockDataStore.patients = mockDataStore.patients.map((row: any) =>
            // eslint-disable-line @typescript-eslint/no-explicit-any
            row.id === id ? { ...row, ...data } : row
          );
          return { rows: [{ id }], rowCount: 1 };
        }
        if (sqlLower.includes('appointments') && params) {
          const id = params[params.length - 1];
          const data = params[0] as Record<string, unknown>;
          mockDataStore.appointments = mockDataStore.appointments.map((row: any) =>
            // eslint-disable-line @typescript-eslint/no-explicit-any
            row.id === id ? { ...row, ...data } : row
          );
          return { rows: [{ id }], rowCount: 1 };
        }
        if (sqlLower.includes('leads') && params) {
          const id = params[params.length - 1];
          const data = params[0] as Record<string, unknown>;
          mockDataStore.leads = mockDataStore.leads.map((row: any) =>
            // eslint-disable-line @typescript-eslint/no-explicit-any
            row.id === id ? { ...row, ...data } : row
          );
          return { rows: [{ id }], rowCount: 1 };
        }
      }

      // DELETE queries
      if (sqlLower.startsWith('delete')) {
        if (sqlLower.includes('patients') && params) {
          const id = params[0];
          mockDataStore.patients = mockDataStore.patients.filter((row: any) => row.id !== id); // eslint-disable-line @typescript-eslint/no-explicit-any
          return { rows: [], rowCount: 1 };
        }
        if (sqlLower.includes('appointments') && params) {
          const id = params[0];
          mockDataStore.appointments = mockDataStore.appointments.filter(
            (row: any) => row.id !== id
          ); // eslint-disable-line @typescript-eslint/no-explicit-any
          return { rows: [], rowCount: 1 };
        }
        if (sqlLower.includes('leads') && params) {
          const id = params[0];
          mockDataStore.leads = mockDataStore.leads.filter((row: any) => row.id !== id); // eslint-disable-line @typescript-eslint/no-explicit-any
          return { rows: [], rowCount: 1 };
        }
      }

      // Default response
      return { rows: [], rowCount: 0 };
    }),

    /**
     * Mock execute function (alias for query)
     */
    execute: vi.fn(async (sql: string, params?: unknown[]) => {
      return createMockDatabase().query(sql, params);
    }),

    /**
     * Mock beginTransaction
     */
    beginTransaction: vi.fn(async () => {
      void new Promise((resolve) => {
        setTimeout(resolve, 5);
      });
    }),

    /**
     * Mock commit
     */
    commit: vi.fn(async () => {
      void new Promise((resolve) => {
        setTimeout(resolve, 5);
      });
    }),

    /**
     * Mock rollback
     */
    rollback: vi.fn(async () => {
      void new Promise((resolve) => {
        setTimeout(resolve, 5);
      });
    }),

    /**
     * Mock close
     */
    close: vi.fn(async () => {
      void new Promise((resolve) => {
        setTimeout(resolve, 5);
      });
    }),
  };
};

/**
 * Mock database instance
 */
export const mockDb = createMockDatabase();

/**
 * Mock لـ drizzle client
 */
export const mockDrizzleClient = {
  ...mockDb,
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
  })),
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{ id: Date.now() }])),
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
  })),
  delete: vi.fn(() => ({
    where: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([])),
    })),
  })),
  transaction: vi.fn((callback) => callback(mockDb)),
};

/**
 * إعادة تعيين mock database
 */
export const resetMockDb = () => {
  resetMockDatabase();
  Object.values(mockDb).forEach((mockFn) => {
    if (typeof mockFn === 'function' && 'mockReset' in mockFn) {
      (mockFn as { mockReset: () => void }).mockReset();
    }
  });
  Object.values(mockDrizzleClient).forEach((mockFn) => {
    if (typeof mockFn === 'function' && 'mockReset' in mockFn) {
      (mockFn as { mockReset: () => void }).mockReset();
    }
  });
};
