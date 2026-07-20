/**
 * اختبارات useRecentlyUsed Hook
 * useRecentlyUsed Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentlyUsed } from '../useRecentlyUsed';

const RECENTLY_USED_KEY = 'dashboard_recently_used_tools';

describe('useRecentlyUsed - Initialization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('يجب أن يبدأ بقائمة فارغة', () => {
    const { result } = renderHook(() => useRecentlyUsed());
    expect(result.current.recentlyUsed).toEqual([]);
  });

  it('يجب أن يحمل الأدوات من localStorage', () => {
    const storedTools = [
      {
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
        timestamp: Date.now(),
      },
    ];
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(storedTools));

    const { result } = renderHook(() => useRecentlyUsed());
    expect(result.current.recentlyUsed).toEqual(storedTools);
  });

  it('يجب أن يفلتر الأدوات القديمة (أكثر من 7 أيام)', () => {
    const oldTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const recentTimestamp = Date.now();
    const storedTools = [
      {
        id: '1',
        title: 'Old Tool',
        href: '/old',
        timestamp: oldTimestamp,
      },
      {
        id: '2',
        title: 'Recent Tool',
        href: '/recent',
        timestamp: recentTimestamp,
      },
    ];
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(storedTools));

    const { result } = renderHook(() => useRecentlyUsed());
    expect(result.current.recentlyUsed).toHaveLength(1);
    expect(result.current.recentlyUsed[0].id).toBe('2');
  });

  it('يجب أن يتعامل مع localStorage errors بصمت', () => {
    const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useRecentlyUsed());
    expect(result.current.recentlyUsed).toEqual([]);

    getItemSpy.mockRestore();
  });
});

describe('useRecentlyUsed - addRecentlyUsed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('يجب أن يضيف أداة جديدة', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    expect(result.current.recentlyUsed).toHaveLength(1);
    expect(result.current.recentlyUsed[0].id).toBe('1');
    expect(result.current.recentlyUsed[0].timestamp).toBeDefined();
  });

  it('يجب أن يضيف الأداة في البداية', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    act(() => {
      result.current.addRecentlyUsed({
        id: '2',
        title: 'Tool 2',
        href: '/tool2',
      });
    });

    expect(result.current.recentlyUsed).toHaveLength(2);
    expect(result.current.recentlyUsed[0].id).toBe('2');
    expect(result.current.recentlyUsed[1].id).toBe('1');
  });

  it('يجب أن يزيل الأداة الموجودة ويضيفها في البداية', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    act(() => {
      result.current.addRecentlyUsed({
        id: '2',
        title: 'Tool 2',
        href: '/tool2',
      });
    });

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    expect(result.current.recentlyUsed).toHaveLength(2);
    expect(result.current.recentlyUsed[0].id).toBe('1');
    expect(result.current.recentlyUsed[1].id).toBe('2');
  });

  it('يجب أن يحافظ على أقصى 5 أدوات', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    for (let i = 1; i <= 7; i++) {
      act(() => {
        result.current.addRecentlyUsed({
          id: String(i),
          title: `Tool ${i}`,
          href: `/tool${i}`,
        });
      });
    }

    expect(result.current.recentlyUsed).toHaveLength(5);
    expect(result.current.recentlyUsed[0].id).toBe('7');
    expect(result.current.recentlyUsed[4].id).toBe('3');
  });

  it('يجب أن يحفظ في localStorage', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    const stored = localStorage.getItem(RECENTLY_USED_KEY);
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored || '[]');
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('1');
  });

  it('يجب أن يتعامل مع localStorage errors بصمت', () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useRecentlyUsed());

    expect(() => {
      act(() => {
        result.current.addRecentlyUsed({
          id: '1',
          title: 'Tool 1',
          href: '/tool1',
        });
      });
    }).not.toThrow();

    setItemSpy.mockRestore();
  });
});

describe('useRecentlyUsed - clearRecentlyUsed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('يجب أن يمسح قائمة المستخدمة مؤخراً', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    expect(result.current.recentlyUsed).toHaveLength(1);

    act(() => {
      result.current.clearRecentlyUsed();
    });

    expect(result.current.recentlyUsed).toEqual([]);
  });

  it('يجب أن يمسح من localStorage', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    expect(localStorage.getItem(RECENTLY_USED_KEY)).toBeDefined();

    act(() => {
      result.current.clearRecentlyUsed();
    });

    expect(localStorage.getItem(RECENTLY_USED_KEY)).toBeNull();
  });

  it('يجب أن يتعامل مع localStorage errors بصمت', () => {
    const removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useRecentlyUsed());

    expect(() => {
      act(() => {
        result.current.clearRecentlyUsed();
      });
    }).not.toThrow();

    removeItemSpy.mockRestore();
  });
});

describe('useRecentlyUsed - Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('يجب أن يتعامل مع JSON غير صالح', () => {
    localStorage.setItem(RECENTLY_USED_KEY, 'invalid json');

    const { result } = renderHook(() => useRecentlyUsed());
    expect(result.current.recentlyUsed).toEqual([]);
  });

  it('يجب أن يتعامل مع بيانات غير صالحة', () => {
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify([{ invalid: 'data' }]));

    const { result } = renderHook(() => useRecentlyUsed());
    // The hook filters data based on timestamp, so invalid data without timestamp might be filtered out
    // We just verify it doesn't crash
    expect(Array.isArray(result.current.recentlyUsed)).toBe(true);
  });

  it('يجب أن يتعامل مع إضافة أداة بنفس المعرف', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Updated Tool 1',
        href: '/tool1-updated',
      });
    });

    expect(result.current.recentlyUsed).toHaveLength(1);
    expect(result.current.recentlyUsed[0].title).toBe('Updated Tool 1');
  });

  it('يجب أن يحافظ على ترتيب زمني صحيح', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    // Wait a bit to ensure different timestamps
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.addRecentlyUsed({
        id: '2',
        title: 'Tool 2',
        href: '/tool2',
      });
    });

    expect(result.current.recentlyUsed[0].timestamp).toBeGreaterThan(
      result.current.recentlyUsed[1].timestamp
    );
  });

  it('يجب أن يتعامل مع مسح قائمة فارغة', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    expect(() => {
      act(() => {
        result.current.clearRecentlyUsed();
      });
    }).not.toThrow();

    expect(result.current.recentlyUsed).toEqual([]);
  });
});

describe('useRecentlyUsed - Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('يجب أن يحافظ على البيانات عبر إعادة العرض', () => {
    const { result, rerender } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
      });
    });

    rerender();

    expect(result.current.recentlyUsed).toHaveLength(1);
    expect(result.current.recentlyUsed[0].id).toBe('1');
  });

  it('يجب أن يحمل البيانات المحفوظة عند التحميل الأولي', () => {
    const storedTools = [
      {
        id: '1',
        title: 'Tool 1',
        href: '/tool1',
        timestamp: Date.now(),
      },
    ];
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(storedTools));

    const { result } = renderHook(() => useRecentlyUsed());
    expect(result.current.recentlyUsed).toEqual(storedTools);
  });
});