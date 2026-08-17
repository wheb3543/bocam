export const SOCIAL_INBOX_ALLOWED_ROLES = ['admin', 'manager', 'team_leader', 'staff'] as const;

export type SocialInboxAllowedRole = (typeof SOCIAL_INBOX_ALLOWED_ROLES)[number];

export function canAccessSocialInbox(
  role: string | null | undefined
): role is SocialInboxAllowedRole {
  return SOCIAL_INBOX_ALLOWED_ROLES.some((allowedRole) => allowedRole === role);
}
