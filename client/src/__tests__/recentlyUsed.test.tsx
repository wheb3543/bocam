import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRecentlyUsed } from '@/hooks/data/useRecentlyUsed';

describe('useRecentlyUsed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('orders the latest destination first, de-duplicates entries, and clears local storage', () => {
    const { result } = renderHook(() => useRecentlyUsed());

    act(() => {
      result.current.addRecentlyUsed({ id: 'messages', title: 'صندوق البريد الموحد', href: '/messages' });
      result.current.addRecentlyUsed({ id: 'publishing', title: 'النشر', href: '/publishing' });
      result.current.addRecentlyUsed({ id: 'messages', title: 'صندوق البريد الموحد', href: '/messages' });
    });

    expect(result.current.recentlyUsed.map((tool) => tool.id)).toEqual(['messages', 'publishing']);

    act(() => {
      result.current.clearRecentlyUsed();
    });

    expect(result.current.recentlyUsed).toEqual([]);
    expect(localStorage.getItem('dashboard_recently_used_tools')).toBeNull();
  });
});
