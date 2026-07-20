/**
 * أدوات تنظيف الاختبارات (Test Cleanup Utilities)
 * يوفر دوال لتنظيف البيانات والموارد بعد الاختبارات
 */

import { resetMockDatabase } from './test-db';
import { resetMockData } from './mocks/trpc';
import { vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// ============================================================================
// Cleanup Functions
// ============================================================================

/**
 * تنظيف جميع البيانات بعد كل اختبار
 */
export const cleanupTestData = () => {
  // إعادة تعيين قاعدة البيانات
  resetMockDatabase();

  // إعادة تعيين بيانات tRPC
  resetMockData();

  // إعادة تعيين جميع mocks
  vi.clearAllMocks();
};

/**
 * تنظيف بيانات محددة
 */
export const cleanupSpecificData = (tables: string[]) => {
  tables.forEach((table) => {
    if (table === 'patients') {
      resetMockData();
    }
    if (table === 'appointments') {
      resetMockData();
    }
    if (table === 'leads') {
      resetMockData();
    }
    if (table === 'conversations') {
      resetMockData();
    }
    if (table === 'messages') {
      resetMockData();
    }
    if (table === 'doctors') {
      resetMockData();
    }
    if (table === 'campaigns') {
      resetMockData();
    }
    if (table === 'camps') {
      resetMockData();
    }
    if (table === 'offers') {
      resetMockData();
    }
    if (table === 'users') {
      resetMockData();
    }
    if (table === 'settings') {
      resetMockData();
    }
  });
};

/**
 * تنظيف localStorage و sessionStorage
 */
export const cleanupStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * تنظيف جميع الـ timers
 */
export const cleanupTimers = () => {
  vi.useRealTimers();
};

/**
 * تنظيف جميع الـ mocks
 */
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

/**
 * تنظيف MSW handlers
 */
export const cleanupMSW = () => {
  // سيتم تنفيذ هذا عند إعداد MSW
  // msw.resetHandlers();
};

/**
 * تنظيف شامل بعد كل اختبار
 */
export const fullCleanup = () => {
  cleanupTestData();
  cleanupStorage();
  cleanupTimers();
  cleanupMocks();
  cleanupMSW();
};

// ============================================================================
// Setup and Teardown Helpers
// ============================================================================

/**
 * إعداد قبل كل اختبار
 */
export const beforeEachSetup = () => {
  // استخدام fake timers للاختبارات
  vi.useFakeTimers();

  // تنظيف البيانات القديمة
  cleanupTestData();
};

/**
 * تنظيف بعد كل اختبار
 */
export const afterEachCleanup = () => {
  fullCleanup();
};

/**
 * إعداد قبل جميع الاختبارات في ملف
 */
export const beforeAllSetup = () => {
  // يمكن إعداد MSW هنا
  // msw.setupWorker(handlers);
};

/**
 * تنظيف بعد جميع الاختبارات في ملف
 */
export const afterAllCleanup = () => {
  // إيقاف MSW
  // msw.teardownWorker();
};

// ============================================================================
// Vitest Hooks Integration
// ============================================================================

/**
 * إضافة hooks تلقائياً للاختبارات
 */
export const setupTestHooks = () => {
  beforeEach(() => {
    beforeEachSetup();
  });

  afterEach(() => {
    afterEachCleanup();
  });

  beforeAll(() => {
    beforeAllSetup();
  });

  afterAll(() => {
    afterAllCleanup();
  });
};

// ============================================================================
// Export Default
// ============================================================================

export default {
  cleanupTestData,
  cleanupSpecificData,
  cleanupStorage,
  cleanupTimers,
  cleanupMocks,
  cleanupMSW,
  fullCleanup,
  beforeEachSetup,
  afterEachCleanup,
  beforeAllSetup,
  afterAllCleanup,
  setupTestHooks,
};
