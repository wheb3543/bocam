/**
 * اختبارات usePersistFn Hook
 * usePersistFn Hook Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePersistFn } from '../usePersistFn';

describe('usePersistFn - Basic Functionality', () => {
  it('يجب أن يحافظ على مرجع الدالة', () => {
    const fn = vi.fn(() => 'test');
    const { result } = renderHook(() => usePersistFn(fn));
    
    expect(typeof result.current).toBe('function');
  });

  it('يجب أن ينفذ الدالة المحفوظة', () => {
    const fn = vi.fn(() => 'test');
    const { result } = renderHook(() => usePersistFn(fn));
    
    const output = result.current();
    expect(output).toBe('test');
    expect(fn).toHaveBeenCalled();
  });

  it('يجب أن يمرر المعاملات بشكل صحيح', () => {
    const fn = vi.fn().mockImplementation((a: number, b: number) => a + b);
    const { result } = renderHook(() => usePersistFn(fn));
    
    const output = result.current(5, 10);
    expect(output).toBe(15);
    expect(fn).toHaveBeenCalledWith(5, 10);
  });
});

describe('usePersistFn - Reference Stability', () => {
  it('يجب أن يحافظ على نفس المرجع عند إعادة العرض', () => {
    const fn = vi.fn();
    const { result, rerender } = renderHook(({ callback }) => usePersistFn(callback), {
      initialProps: { callback: fn },
    });

    const firstRef = result.current;
    
    rerender({ callback: fn });
    
    const secondRef = result.current;
    
    expect(firstRef).toBe(secondRef);
  });

  it('يجب أن يستخدم أحدث نسخة من الدالة', () => {
    let counter = 0;
    const fn1 = vi.fn(() => counter++);
    const fn2 = vi.fn(() => counter++);
    
    const { result, rerender } = renderHook(({ callback }) => usePersistFn(callback), {
      initialProps: { callback: fn1 },
    });

    result.current();
    expect(fn1).toHaveBeenCalled();
    expect(counter).toBe(1);
    
    rerender({ callback: fn2 });
    
    result.current();
    expect(fn2).toHaveBeenCalled();
    expect(counter).toBe(2);
  });
});

describe('usePersistFn - Different Function Types', () => {
  it('يجب أن يتعامل مع الدوال التي لا ترجع قيمة', () => {
    const fn = vi.fn(() => {
      // void function
    });
    const { result } = renderHook(() => usePersistFn(fn));
    
    result.current();
    expect(fn).toHaveBeenCalled();
  });

  it('يجب أن يتعامل مع الدوال التي ترجع قيمة', () => {
    const fn = vi.fn(() => 42);
    const { result } = renderHook(() => usePersistFn(fn));
    
    const output = result.current();
    expect(output).toBe(42);
  });

  it('يجب أن يتعامل مع الدوال غير المتزامنة', () => {
    const fn = vi.fn(async () => {
      return 'async result';
    });
    const { result } = renderHook(() => usePersistFn(fn));
    
    const promise = result.current();
    expect(promise).toBeInstanceOf(Promise);
  });

  it('يجب أن يتعامل مع الدوال مع معاملات متعددة', () => {
    const fn = vi.fn().mockImplementation((a: string, b: number, c: boolean) => {
      return { a, b, c };
    });
    const { result } = renderHook(() => usePersistFn(fn));
    
    const output = result.current('test', 123, true);
    expect(output).toEqual({ a: 'test', b: 123, c: true });
    expect(fn).toHaveBeenCalledWith('test', 123, true);
  });
});

describe('usePersistFn - Context and this', () => {
  it('يجب أن يحافظ سياق this', () => {
    const obj = {
      value: 42,
      getValue(this: { value: number }) {
        return this.value;
      },
    };
    
    const fn = vi.fn(obj.getValue);
    const { result } = renderHook(() => usePersistFn(fn));
    
    const output = result.current.call(obj);
    expect(output).toBe(42);
  });
});

describe('usePersistFn - Edge Cases', () => {
  it('يجب أن يتعامل مع الدوال الفارغة', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => usePersistFn(fn));
    
    result.current();
    expect(fn).toHaveBeenCalled();
  });

  it('يجب أن يتعامل مع الدوال التي ترمي خطأ', () => {
    const fn = vi.fn(() => {
      throw new Error('Test error');
    });
    const { result } = renderHook(() => usePersistFn(fn));
    
    expect(() => result.current()).toThrow('Test error');
  });

  it('يجب أن يتعامل مع الدوال مع معاملات افتراضية', () => {
    const add = (a: number, b: number = 10) => a + b;
    const fn = vi.fn().mockImplementation(add);
    const { result } = renderHook(() => usePersistFn(fn));
    
    const output1 = result.current(5);
    expect(output1).toBe(15);
    
    const output2 = result.current(5, 20);
    expect(output2).toBe(25);
  });

  it('يجب أن يتعامل مع الدوال مع rest parameters', () => {
    const sum = (...args: number[]) => args.reduce((sum, val) => sum + val, 0);
    const fn = vi.fn().mockImplementation(sum);
    const { result } = renderHook(() => usePersistFn(fn));
    
    const output = result.current(1, 2, 3, 4, 5);
    expect(output).toBe(15);
  });
});

describe('usePersistFn - Performance', () => {
  it('يجب أن لا يسبب إعادة عرض غير ضرورية', () => {
    let renderCount = 0;
    const TestComponent = () => {
      renderCount++;
      const fn = vi.fn();
      const persistFn = usePersistFn(fn);
      return { persistFn };
    };
    
    const { result, rerender } = renderHook(() => TestComponent());
    
    const firstPersistFn = result.current.persistFn;
    
    rerender();
    
    const secondPersistFn = result.current.persistFn;
    
    expect(firstPersistFn).toBe(secondPersistFn);
    expect(renderCount).toBe(2);
  });
});