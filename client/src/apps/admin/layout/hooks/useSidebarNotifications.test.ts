import { describe, expect, it } from 'vitest';
import { getSocialInboxUnreadCount } from './useSidebarNotifications';

describe('getSocialInboxUnreadCount', () => {
  it('returns the unread social inbox count and defaults safely to zero', () => {
    expect(getSocialInboxUnreadCount({ unread: 7 })).toBe(7);
    expect(getSocialInboxUnreadCount(undefined)).toBe(0);
    expect(getSocialInboxUnreadCount(null)).toBe(0);
  });
});
