import { describe, expect, it } from 'vitest';
import { SOCIAL_INBOX_ALLOWED_ROLES } from '@shared/socialInboxAccess';
import { allNavItems, allToolsGroups, defaultVisibleItemIds } from './sidebarData';

describe('sidebar data for the unified inbox', () => {
  it('shows the inbox by default and attaches the authorized roles policy', () => {
    const inboxItem = allNavItems.find((item) => item.id === 'messages');

    expect(defaultVisibleItemIds).toContain('messages');
    expect(inboxItem).toMatchObject({
      title: 'صندوق البريد الموحد',
      href: '/admin/communications/messages',
      allowedRoles: SOCIAL_INBOX_ALLOWED_ROLES,
    });
  });

  it('keeps the same guarded inbox item inside the communications tools group', () => {
    const communications = allToolsGroups.find((group) => group.label === 'التواصل');
    const inboxItem = communications?.items.find((item) => item.id === 'messages');

    expect(inboxItem).toMatchObject({
      href: '/admin/communications/messages',
      allowedRoles: SOCIAL_INBOX_ALLOWED_ROLES,
    });
  });

  it('links administrators to the general integration settings from both navigation variants', () => {
    const generalItem = allNavItems.find((item) => item.id === 'integration-settings');
    const communications = allToolsGroups.find((group) => group.label === 'التواصل');
    const toolItem = communications?.items.find((item) => item.id === 'integration-settings');

    expect(generalItem).toMatchObject({
      title: 'إعدادات الربط',
      href: '/admin/communications/integration-settings',
      allowedRoles: ['admin'],
    });
    expect(toolItem).toMatchObject({ href: '/admin/communications/integration-settings' });
  });
});
