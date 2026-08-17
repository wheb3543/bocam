import { describe, expect, it } from 'vitest';
import { allNavItems, allToolsGroups, DEFAULT_VISIBLE_IDS } from './sidebarNavigation';

describe('sidebar navigation', () => {
  it('shows the unified social inbox by default', () => {
    const inboxItem = allNavItems.find((item) => item.id === 'messages');

    expect(DEFAULT_VISIBLE_IDS).toContain('messages');
    expect(inboxItem).toMatchObject({
      title: 'صندوق البريد الموحد',
      href: '/admin/communications/messages',
    });
  });

  it('keeps the inbox link in the communications tools group', () => {
    const communicationsGroup = allToolsGroups.find((group) => group.label === 'التواصل');

    expect(communicationsGroup?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'messages',
          href: '/admin/communications/messages',
        }),
      ])
    );
  });
});
