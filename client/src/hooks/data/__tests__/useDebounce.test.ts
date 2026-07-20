/**
 * اختبارات useDebounce Hook
 * useDebounce Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce - Basic Functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يرجع القيمة الأولية', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('يجب أن يؤخر تحديث القيمة', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    
    // Value should not update immediately
    expect(result.current).toBe('initial');
    
    // Advance timer
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Value should update after delay
    expect(result.current).toBe('updated');
  });

  it('يجب أن يستخدم delay الافتراضي (500ms)', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    
    expect(result.current).toBe('initial');
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('updated');
  });

  it('يجب أن يستخدم delay المخصص', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    
    expect(result.current).toBe('initial');
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Should not update yet (delay is 1000ms)
    expect(result.current).toBe('initial');
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Should update after 1000ms
    expect(result.current).toBe('updated');
  });
});

describe('useDebounce - Multiple Updates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يلغي التحديث السابق عند تغيير القيمة بسرعة', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'update1' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: 'update2' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: 'update3' });
    
    // Should still be initial
    expect(result.current).toBe('initial');
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Should be the last update
    expect(result.current).toBe('update3');
  });

  it('يجب أن يتعامل مع التحديثات المتتالية', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 0 },
    });

    rerender({ value: 1 });
    rerender({ value: 2 });
    rerender({ value: 3 });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe(3);
  });
});

describe('useDebounce - Cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن ينظف timer عند unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    
    unmount();
    
    // Clear timeout should be called on unmount
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});

describe('useDebounce - Different Value Types', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يتعامل مع السلاسل النصية', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'hello' },
    });

    rerender({ value: 'world' });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('world');
  });

  it('يجب أن يتعامل مع الأرقام', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 0 },
    });

    rerender({ value: 100 });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe(100);
  });

  it('يجب أن يتعامل مع الكائنات', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: { id: 1 } },
    });

    rerender({ value: { id: 2 } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toEqual({ id: 2 });
  });

  it('يجب أن يتعامل مع المصفوفات', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: [1, 2, 3] },
    });

    rerender({ value: [4, 5, 6] });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toEqual([4, 5, 6]);
  });

  it('يجب أن يتعامل مع القيم البولية', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: false },
    });

    rerender({ value: true });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe(true);
  });

  it('يجب أن يتعامل مع null', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'test' as string | null },
    });

    rerender({ value: null as string | null });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toBeNull();
  });

  it('يجب أن يتعامل مع undefined', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'test' as string | undefined },
    });

    rerender({ value: undefined as string | undefined });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toBeUndefined();
  });
});

describe('useDebounce - Edge Cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يتعامل مع delay=0', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    
    act(() => {
      vi.advanceTimersByTime(0);
    });
    
    expect(result.current).toBe('updated');
  });

  it('يجب أن يتعامل مع delay صغير جداً', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 10), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    
    act(() => {
      vi.advanceTimersByTime(10);
    });
    
    expect(result.current).toBe('updated');
  });

  it('يجب أن يتعامل مع delay كبير جداً', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 10000), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Should not update yet
    expect(result.current).toBe('initial');
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Should update after 10000ms
    expect(result.current).toBe('updated');
  });

  it('يجب أن لا يحدث تحديث عند نفس القيمة', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'test' },
    });

    rerender({ value: 'test' });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('test');
  });
});
