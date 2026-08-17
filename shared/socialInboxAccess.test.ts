import { describe, expect, it } from 'vitest';
import { canAccessSocialInbox, SOCIAL_INBOX_ALLOWED_ROLES } from './socialInboxAccess';

describe('social inbox access policy', () => {
  it('allows the operational roles that manage social conversations', () => {
    expect(SOCIAL_INBOX_ALLOWED_ROLES).toEqual(['admin', 'manager', 'team_leader', 'staff']);
    expect(canAccessSocialInbox('admin')).toBe(true);
    expect(canAccessSocialInbox('manager')).toBe(true);
    expect(canAccessSocialInbox('team_leader')).toBe(true);
    expect(canAccessSocialInbox('staff')).toBe(true);
  });

  it('does not expose the inbox to unprivileged roles', () => {
    expect(canAccessSocialInbox('viewer')).toBe(false);
    expect(canAccessSocialInbox('user')).toBe(false);
    expect(canAccessSocialInbox(undefined)).toBe(false);
  });
});

