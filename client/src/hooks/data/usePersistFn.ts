import { useRef } from 'react';

type noop<Args extends unknown[] = unknown[], Result = unknown> = (...args: Args) => Result;

/**
 * Custom hook to persist function references across re-renders
 *
 * This hook can replace useCallback to reduce mental burden by always
 * returning a stable function reference that calls the latest implementation.
 * Unlike useCallback, you don't need to specify dependencies - it automatically
 * uses the latest function implementation.
 *
 * @param fn - The function to persist
 * @returns A stable function reference that always calls the latest implementation
 * @example
 * const handleClick = usePersistFn(() => {
 *   console.log('Latest state:', state);
 * });
 *
 * // handleClick reference never changes, but always uses latest state
 */
export function usePersistFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useRef<T>(null);
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args) {
      return fnRef.current?.apply(this, args);
    } as T;
  }

  return persistFn.current as T;
}
