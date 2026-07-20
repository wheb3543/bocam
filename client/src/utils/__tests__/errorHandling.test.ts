/**
 * اختبارات Error Handling Utilities
 * Error Handling Utilities Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SafeLocalStorage, SafeSSEParser, SafeSSEWriter, safeJSONParse } from '../errorHandling';

describe('SafeLocalStorage - Availability Check', () => {
  beforeEach(() => {
    // Reset the static property before each test
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = null;
  });

  it('يجب أن يتحقق من توفر localStorage', () => {
    const result = SafeLocalStorage.checkAvailability();
    expect(typeof result).toBe('boolean');
  });

  it('يجب أن يحفظ نتيجة التحقق من التوفر', () => {
    SafeLocalStorage.checkAvailability();
    const result1 = SafeLocalStorage.checkAvailability();
    const result2 = SafeLocalStorage.checkAvailability();
    expect(result1).toBe(result2);
  });
});

describe('SafeLocalStorage - getItem', () => {
  beforeEach(() => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = null;
  });

  it('يجب أن يحصل على قيمة من localStorage', () => {
    localStorage.setItem('testKey', 'testValue');
    const result = SafeLocalStorage.getItem('testKey');
    expect(result).toBe('testValue');
    localStorage.removeItem('testKey');
  });

  it('يجب أن يرجع null للمفتاح غير الموجود', () => {
    const result = SafeLocalStorage.getItem('nonExistentKey');
    expect(result).toBeNull();
  });

  it('يجب أن يرجع null عندما localStorage غير متاح', () => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = false;
    const result = SafeLocalStorage.getItem('testKey');
    expect(result).toBeNull();
  });
});

describe('SafeLocalStorage - setItem', () => {
  beforeEach(() => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = null;
  });

  it('يجب أن يضبط قيمة في localStorage', () => {
    const result = SafeLocalStorage.setItem('testKey', 'testValue');
    expect(result).toBe(true);
    expect(localStorage.getItem('testKey')).toBe('testValue');
    localStorage.removeItem('testKey');
  });

  it('يجب أن يرجع false عند الفشل', () => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = false;
    const result = SafeLocalStorage.setItem('testKey', 'testValue');
    expect(result).toBe(false);
  });
});

describe('SafeLocalStorage - removeItem', () => {
  beforeEach(() => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = null;
  });

  it('يجب أن يحذف قيمة من localStorage', () => {
    localStorage.setItem('testKey', 'testValue');
    const result = SafeLocalStorage.removeItem('testKey');
    expect(result).toBe(true);
    expect(localStorage.getItem('testKey')).toBeNull();
  });

  it('يجب أن يرجع false عند الفشل', () => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = false;
    const result = SafeLocalStorage.removeItem('testKey');
    expect(result).toBe(false);
  });
});

describe('SafeLocalStorage - getJSON', () => {
  beforeEach(() => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = null;
  });

  it('يجب أن يحصل على JSON من localStorage', () => {
    const testData = { name: 'test', value: 123 };
    localStorage.setItem('testKey', JSON.stringify(testData));
    const result = SafeLocalStorage.getJSON<typeof testData>('testKey');
    expect(result).toEqual(testData);
    localStorage.removeItem('testKey');
  });

  it('يجب أن يرجع null للقيمة غير الصالحة', () => {
    localStorage.setItem('testKey', 'invalid json');
    const result = SafeLocalStorage.getJSON('testKey');
    expect(result).toBeNull();
    localStorage.removeItem('testKey');
  });

  it('يجب أن يرجع null للمفتاح غير الموجود', () => {
    const result = SafeLocalStorage.getJSON('nonExistentKey');
    expect(result).toBeNull();
  });
});

describe('SafeLocalStorage - setJSON', () => {
  beforeEach(() => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = null;
  });

  it('يجب أن يضبط JSON في localStorage', () => {
    const testData = { name: 'test', value: 123 };
    const result = SafeLocalStorage.setJSON('testKey', testData);
    expect(result).toBe(true);
    const stored = JSON.parse(localStorage.getItem('testKey') || '{}');
    expect(stored).toEqual(testData);
    localStorage.removeItem('testKey');
  });

  it('يجب أن يرجع false عند الفشل', () => {
    (SafeLocalStorage as unknown as { isAvailable: boolean | null }).isAvailable = false;
    const result = SafeLocalStorage.setJSON('testKey', { test: 'data' });
    expect(result).toBe(false);
  });
});

describe('SafeSSEParser - parseEventData', () => {
  it('يجب أن يحلل بيانات حدث SSE صالحة', () => {
    const data = JSON.stringify({ type: 'message', content: 'test' });
    const result = SafeSSEParser.parseEventData(data);
    expect(result).toEqual({ type: 'message', content: 'test' });
  });

  it('يجب أن يرجع null للبيانات غير الصالحة', () => {
    const result = SafeSSEParser.parseEventData('invalid json');
    expect(result).toBeNull();
  });

  it('يجب أن يرجع null للسلسلة الفارغة', () => {
    const result = SafeSSEParser.parseEventData('');
    expect(result).toBeNull();
  });
});

describe('SafeSSEParser - handleEvent', () => {
  it('يجب أن ينفذ المعالج بنجاح', () => {
    const handler = vi.fn();
    SafeSSEParser.handleEvent(handler);
    expect(handler).toHaveBeenCalled();
  });

  it('يجب أن يتعامل مع الأخطاء بصمت', () => {
    const handler = vi.fn(() => {
      throw new Error('Test error');
    });
    expect(() => SafeSSEParser.handleEvent(handler)).not.toThrow();
  });
});

describe('SafeSSEWriter - write', () => {
  it('يجب أن يكتب البيانات بنجاح', () => {
    const mockRes = {
      writableEnded: false,
      write: vi.fn(),
    };
    const result = SafeSSEWriter.write(mockRes, 'test data');
    expect(result).toBe(true);
    expect(mockRes.write).toHaveBeenCalledWith('test data');
  });

  it('يجب أن يرجع false عندما انتهت الكتابة', () => {
    const mockRes = {
      writableEnded: true,
      write: vi.fn(),
    };
    const result = SafeSSEWriter.write(mockRes, 'test data');
    expect(result).toBe(false);
    expect(mockRes.write).not.toHaveBeenCalled();
  });

  it('يجب أن يرجع false عند حدوث خطأ', () => {
    const mockRes = {
      writableEnded: false,
      write: vi.fn(() => {
        throw new Error('Write error');
      }),
    };
    const result = SafeSSEWriter.write(mockRes, 'test data');
    expect(result).toBe(false);
  });
});

describe('safeJSONParse', () => {
  it('يجب أن يحلل JSON صالح', () => {
    const data = JSON.stringify({ name: 'test', value: 123 });
    const result = safeJSONParse(data);
    expect(result).toEqual({ name: 'test', value: 123 });
  });

  it('يجب أن يرجع null للبيانات غير الصالحة', () => {
    const result = safeJSONParse('invalid json');
    expect(result).toBeNull();
  });

  it('يجب أن يرجع القيمة الاحتياطية عند الفشل', () => {
    const fallback = { default: true };
    const result = safeJSONParse('invalid json', fallback);
    expect(result).toEqual(fallback);
  });

  it('يجب أن يرجع null عند عدم وجود قيمة احتياطية', () => {
    const result = safeJSONParse('invalid json');
    expect(result).toBeNull();
  });

  it('يجب أن يتعامل مع الأرقام', () => {
    const result = safeJSONParse('123');
    expect(result).toBe(123);
  });

  it('يجب أن يتعامل مع السلاسل النصية', () => {
    const result = safeJSONParse('"test string"');
    expect(result).toBe('test string');
  });

  it('يجب أن يتعامل مع المصفوفات', () => {
    const result = safeJSONParse('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('يجب أن يتعامل مع القيم البولية', () => {
    const result = safeJSONParse('true');
    expect(result).toBe(true);
  });

  it('يجب أن يتعامل مع null', () => {
    const result = safeJSONParse('null');
    expect(result).toBeNull();
  });
});