export const ROLE_BASE_KEYS = [
  'admin',
  'manager',
  'staff',
  'team_leader',
  'viewer',
  'user',
] as const;
export type RoleBaseKey = (typeof ROLE_BASE_KEYS)[number];

export const ROLE_PERMISSIONS = [
  'dashboard.view',
  'users.view',
  'users.manage',
  'roles.manage',
  'content.view',
  'content.manage',
  'content.publish',
  'media.manage',
  'appointments.manage',
  'leads.manage',
  'communications.manage',
  'campaigns.manage',
  'reports.view',
  'notifications.manage',
  'settings.manage',
] as const;

export type RolePermission = (typeof ROLE_PERMISSIONS)[number];

export const ROLE_PERMISSION_GROUPS = [
  { key: 'dashboard', label: 'لوحة التحكم', permissions: ['dashboard.view'] },
  {
    key: 'users',
    label: 'المستخدمون والصلاحيات',
    permissions: ['users.view', 'users.manage', 'roles.manage'],
  },
  {
    key: 'content',
    label: 'المحتوى والوسائط',
    permissions: ['content.view', 'content.manage', 'content.publish', 'media.manage'],
  },
  {
    key: 'operations',
    label: 'التشغيل والتواصل',
    permissions: [
      'appointments.manage',
      'leads.manage',
      'communications.manage',
      'campaigns.manage',
    ],
  },
  {
    key: 'governance',
    label: 'التقارير والإعدادات',
    permissions: ['reports.view', 'notifications.manage', 'settings.manage'],
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  permissions: readonly RolePermission[];
}>;

export const ROLE_PERMISSION_LABELS: Record<RolePermission, string> = {
  'dashboard.view': 'عرض لوحة التحكم',
  'users.view': 'عرض المستخدمين',
  'users.manage': 'إدارة المستخدمين',
  'roles.manage': 'إدارة الأدوار والصلاحيات',
  'content.view': 'عرض المحتوى',
  'content.manage': 'إدارة المحتوى',
  'content.publish': 'نشر المحتوى',
  'media.manage': 'إدارة مكتبة الوسائط',
  'appointments.manage': 'إدارة المواعيد',
  'leads.manage': 'إدارة العملاء المحتملين',
  'communications.manage': 'إدارة WhatsApp وصندوق التواصل',
  'campaigns.manage': 'إدارة الحملات',
  'reports.view': 'عرض التقارير',
  'notifications.manage': 'إدارة إعدادات الإشعارات',
  'settings.manage': 'إدارة إعدادات النظام',
};

export const DEFAULT_ROLE_DEFINITIONS: Record<
  RoleBaseKey,
  { name: string; description: string; permissions: RolePermission[] }
> = {
  admin: {
    name: 'مسؤول النظام',
    description: 'إدارة شاملة للنظام والمستخدمين.',
    permissions: [...ROLE_PERMISSIONS],
  },
  manager: {
    name: 'مدير',
    description: 'إدارة العمل والتقارير والمحتوى دون إدارة إعدادات النظام الحساسة.',
    permissions: [
      'dashboard.view',
      'users.view',
      'content.view',
      'content.manage',
      'content.publish',
      'media.manage',
      'appointments.manage',
      'leads.manage',
      'communications.manage',
      'campaigns.manage',
      'reports.view',
    ],
  },
  staff: {
    name: 'موظف',
    description: 'تنفيذ العمليات المسندة والوصول التشغيلي اليومي.',
    permissions: [
      'dashboard.view',
      'content.view',
      'appointments.manage',
      'leads.manage',
      'communications.manage',
    ],
  },
  team_leader: {
    name: 'قائد فريق',
    description: 'إدارة عمل الفريق والحملات والمحتوى ضمن نطاقه.',
    permissions: [
      'dashboard.view',
      'users.view',
      'content.view',
      'content.manage',
      'media.manage',
      'leads.manage',
      'communications.manage',
      'campaigns.manage',
      'reports.view',
    ],
  },
  viewer: {
    name: 'مشاهد',
    description: 'عرض المعلومات المصرح بها فقط.',
    permissions: ['dashboard.view', 'content.view', 'reports.view'],
  },
  user: {
    name: 'مستخدم',
    description: 'وصول محدود إلى المهام والتنبيهات المسندة.',
    permissions: ['dashboard.view'],
  },
};
