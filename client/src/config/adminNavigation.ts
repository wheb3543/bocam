import { allNavItems, type NavItem } from './sidebarNavigation';

export interface AdminNavigationSubsection {
  id: string;
  label: string;
  items: NavItem[];
}

export interface AdminNavigationSection {
  id: string;
  label: string;
  items: NavItem[];
  subsections: AdminNavigationSubsection[];
}

export interface TaskDepartment {
  id: string;
  label: string;
}

const navigationItem = (id: string): NavItem => {
  const item = allNavItems.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Missing canonical navigation item: ${id}`);
  }
  return item;
};

const navigationItems = (...ids: string[]) => ids.map(navigationItem);

export const ADMIN_NAVIGATION_SECTIONS: AdminNavigationSection[] = [
  {
    id: 'home',
    label: 'الرئيسية',
    items: navigationItems('home', 'notifications'),
    subsections: [],
  },
  {
    id: 'booking-and-patients',
    label: 'الحجز والجدولة والمرضى والعملاء',
    items: navigationItems('bookings', 'tasks'),
    subsections: [
      {
        id: 'appointments-and-bookings',
        label: 'المواعيد والحجوزات',
        items: navigationItems('leads', 'appointments', 'offer-leads', 'camp-registrations'),
      },
      {
        id: 'customer-relationship',
        label: 'علاقات العملاء والمرضى',
        items: navigationItems('customers', 'patient-results'),
      },
      {
        id: 'operational-reporting',
        label: 'التقارير التشغيلية',
        items: navigationItems('camp-stats', 'tracking-settings'),
      },
    ],
  },
  {
    id: 'omni-channel-inbox',
    label: 'التواصل الموحد',
    items: navigationItems('messages', 'whatsapp'),
    subsections: [
      {
        id: 'unified-centers',
        label: 'المراكز الموحدة',
        items: navigationItems(
          'whatsapp-operations',
          'whatsapp-automation',
          'whatsapp-campaign-center',
          'whatsapp-governance',
          'whatsapp-analytics-center'
        ),
      },
      {
        id: 'channel-services',
        label: 'الخدمات والإعدادات',
        items: navigationItems(
          'whatsapp-lab-results',
          'message-settings',
          'integration-settings',
          'meta-settings'
        ),
      },
    ],
  },
  {
    id: 'automated-cms',
    label: 'المحتوى والموقع والنشر',
    items: navigationItems('content', 'publishing'),
    subsections: [
      {
        id: 'media-and-editing',
        label: 'الوسائط والتحرير',
        items: navigationItems('media-library', 'management'),
      },
      {
        id: 'content-approval',
        label: 'المراجعة والاعتماد',
        items: navigationItems('review-approval'),
      },
    ],
  },
  {
    id: 'media-social-and-tasks',
    label: 'الإعلام الاجتماعي والمهام المؤسسية',
    items: navigationItems('campaigns', 'projects'),
    subsections: [
      {
        id: 'media-and-marketing',
        label: 'الإعلام والتسويق',
        items: navigationItems('digital-marketing', 'media', 'field-marketing'),
      },
      {
        id: 'service-teams',
        label: 'فرق الخدمة',
        items: navigationItems('customer-service'),
      },
    ],
  },
  {
    id: 'reports-and-analytics',
    label: 'التقارير والتحليلات',
    items: navigationItems('reports', 'analytics', 'bi', 'pwa-stats'),
    subsections: [],
  },
  {
    id: 'administration-and-system',
    label: 'الإدارة والنظام',
    items: navigationItems('profile', 'settings', 'advanced-settings', 'offline'),
    subsections: [
      {
        id: 'users-and-permissions',
        label: 'المستخدمون والصلاحيات',
        items: navigationItems('users'),
      },
      {
        id: 'system-operations',
        label: 'تشغيل النظام',
        items: navigationItems('system-status', 'updates', 'backups'),
      },
    ],
  },
  {
    id: 'help',
    label: 'المساعدة',
    items: navigationItems('support'),
    subsections: [],
  },
];

export const TASK_DEPARTMENTS: TaskDepartment[] = [
  { id: 'legal', label: 'الشؤون القانونية' },
  { id: 'finance', label: 'المالية والحسابات' },
  { id: 'human-resources', label: 'الموارد البشرية' },
  { id: 'nursing', label: 'التمريض' },
  { id: 'housekeeping', label: 'النظافة' },
  { id: 'training', label: 'التدريب' },
  { id: 'procurement', label: 'المشتريات' },
];

export const ADMIN_NAVIGATION_ITEMS = allNavItems;
