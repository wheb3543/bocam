import {
  Settings as SettingsIcon,
  Send,
  MessageSquare,
  FileText,
  BarChart3,
  MessageCircle,
  FileEdit,
  Users,
  Calendar,
  CheckSquare,
  Target,
  Megaphone,
  Video,
  MapPin,
  Headphones,
  UserCheck,
  Gift,
  Tent,
  Contact,
  Home,
  ClipboardList,
  FolderKanban,
  TrendingUp,
  Smartphone,
  Radio,
  Shield,
  Database,
  PieChart,
  User,
  Gauge,
  ShoppingCart,
  Package,
  RotateCw,
  MoreHorizontal,
  Cloud,
  Activity,
  Cpu,
  Bot,
  LayoutDashboard,
  ShieldCheck,
  LineChart,
  Sparkles,
} from 'lucide-react';
import { SOCIAL_INBOX_ALLOWED_ROLES } from '@shared/socialInboxAccess';
import type { RolePermission } from '@shared/rolePermissions';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  hasDot?: boolean;
  id: string;
  feature?: string;
  allowedRoles?: readonly string[];
  requiredPermission?: RolePermission;
}

export interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

export const DEFAULT_VISIBLE_IDS = [
  'home',
  'leads',
  'appointments',
  'offer-leads',
  'camp-registrations',
  'customers',
  'tasks',
  'reports',
  'whatsapp',
  'messages',
];

export const STORAGE_KEY = 'sgh-sidebar-visible-items';

const primaryNavItems: NavItem[] = [
  {
    id: 'home',
    title: 'لوحة التحكم',
    href: '/system/dashboard',
    icon: Home,
  },
  {
    id: 'leads',
    title: 'العملاء المحتملين',
    href: '/admin/bookings/leads',
    icon: UserCheck,
    hasDot: true,
  },
  {
    id: 'appointments',
    title: 'مواعيد الأطباء',
    href: '/admin/bookings/appointments',
    icon: Calendar,
  },
  {
    id: 'offer-leads',
    title: 'عروض العملاء',
    href: '/admin/bookings/offer-leads',
    icon: Gift,
    feature: 'offers',
  },
  {
    id: 'camp-registrations',
    title: 'تسجيلات المخيمات',
    href: '/admin/bookings/camp-registrations',
    icon: Tent,
    feature: 'camps',
  },
  {
    id: 'customers',
    title: 'ملفات العملاء',
    href: '/admin/bookings/customers',
    icon: Contact,
    requiredPermission: 'customers.view',
  },
  {
    id: 'tasks',
    title: 'المهام',
    href: '/admin/bookings/tasks',
    icon: CheckSquare,
  },
  {
    id: 'reports',
    title: 'التقارير',
    href: '/admin/reports/reports',
    icon: BarChart3,
    feature: 'reports',
  },
  {
    id: 'whatsapp',
    title: 'واتساب',
    href: '/admin/whatsapp',
    icon: MessageCircle,
    feature: 'whatsapp',
  },
  {
    id: 'management',
    title: 'الإدارة',
    href: '/admin/management',
    icon: SettingsIcon,
  },
  {
    id: 'content',
    title: 'المحتوى',
    href: '/admin/content/content',
    icon: FileEdit,
  },
  {
    id: 'publishing',
    title: 'النشر',
    href: '/admin/content/publishing',
    icon: Send,
  },
  {
    id: 'messages',
    title: 'صندوق البريد الموحد',
    href: '/admin/communications/messages',
    icon: MessageSquare,
  },
  {
    id: 'analytics',
    title: 'التحليلات',
    href: '/admin/reports/analytics',
    icon: BarChart3,
    feature: 'reports',
  },
];

/**
 * Canonical RBAC permission requirements for communications modules and operations centers:
 * - Operations / Connection: requiredPermission: 'media.view'
 * - Automation / Auto-reply: 'communications.automation.view'
 * - Governance / Compliance: 'communications.security.view'
 * - Integration / Testing: 'communications.testing.view'
 * - User Subscriptions: 'communications.consents.view'
 */
export const allToolsGroups: NavGroup[] = [
  {
    label: 'إدارة الحجوزات',
    icon: ClipboardList,
    defaultOpen: true,
    items: [
      {
        id: 'appointments',
        title: 'مواعيد الأطباء',
        href: '/admin/bookings/appointments',
        icon: Calendar,
      },
      { id: 'leads', title: 'العملاء المحتملين', href: '/admin/bookings/leads', icon: UserCheck },
      {
        id: 'offer-leads',
        title: 'عروض العملاء',
        href: '/admin/bookings/offer-leads',
        icon: Gift,
        feature: 'offers',
      },
      {
        id: 'camp-registrations',
        title: 'تسجيلات المخيمات',
        href: '/admin/bookings/camp-registrations',
        icon: Tent,
        feature: 'camps',
      },
      {
        id: 'customers',
        title: 'ملفات العملاء',
        href: '/admin/bookings/customers',
        icon: Contact,
        requiredPermission: 'customers.view',
      },
      {
        id: 'patient-results',
        title: 'نتائج بوابة المريض',
        href: '/admin/bookings/patient-results',
        icon: FileText,
        feature: 'patient_portal',
      },
      { id: 'tasks', title: 'المهام', href: '/admin/bookings/tasks', icon: CheckSquare },
      { id: 'support', title: 'تذاكر الدعم', href: '/admin/support', icon: Headphones },
      {
        id: 'camp-stats',
        title: 'إحصائيات المخيمات',
        href: '/admin/reports/camp-stats',
        icon: Database,
        feature: 'camps',
      },
    ],
  },
  {
    label: 'إدارة المحتوى',
    icon: FileEdit,
    items: [
      { id: 'management', title: 'الإدارة', href: '/admin/management', icon: SettingsIcon },
      { id: 'content', title: 'المحتوى', href: '/admin/content/content', icon: FileEdit },
      {
        id: 'media-library',
        title: 'مكتبة الوسائط',
        href: '/admin/content/media-library',
        icon: FolderKanban,
      },
      { id: 'publishing', title: 'النشر', href: '/admin/content/publishing', icon: Send },
    ],
  },
  {
    label: 'التواصل',
    icon: MessageCircle,
    items: [
      {
        id: 'whatsapp',
        title: 'واتساب',
        href: '/admin/whatsapp',
        icon: MessageCircle,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-operations',
        title: 'مركز العمليات',
        href: '/admin/whatsapp/operations',
        icon: Cpu,
        feature: 'whatsapp',
        requiredPermission: 'communications.reply',
      },
      {
        id: 'whatsapp-automation',
        title: 'مركز الأتمتة',
        href: '/admin/whatsapp/automation',
        icon: Bot,
        feature: 'whatsapp',
        requiredPermission: 'communications.automation.view',
      },
      {
        id: 'whatsapp-campaign-center',
        title: 'مركز الحملات',
        href: '/admin/whatsapp/campaigns',
        icon: LayoutDashboard,
        feature: 'whatsapp',
        requiredPermission: 'communications.templates.manage',
      },
      {
        id: 'whatsapp-governance',
        title: 'مركز الحوكمة',
        href: '/admin/whatsapp/governance',
        icon: ShieldCheck,
        feature: 'whatsapp',
        requiredPermission: 'integrations.logs.view',
      },
      {
        id: 'whatsapp-analytics-center',
        title: 'مركز التحليلات',
        href: '/admin/whatsapp/analytics',
        icon: LineChart,
        feature: 'whatsapp',
        requiredPermission: 'reports.view',
      },
      {
        id: 'whatsapp-lab-results',
        title: 'نتائج المختبر عبر واتساب',
        href: '/admin/whatsapp/lab-results',
        icon: FileText,
        feature: 'whatsapp',
      },
      {
        id: 'messages',
        title: 'صندوق البريد الموحد',
        href: '/admin/communications/messages',
        icon: MessageSquare,
        allowedRoles: SOCIAL_INBOX_ALLOWED_ROLES,
      },
      {
        id: 'message-settings',
        title: 'إعدادات الرسائل',
        href: '/admin/message-settings',
        icon: SettingsIcon,
      },
      {
        id: 'integration-settings',
        title: 'إعدادات الربط',
        href: '/admin/communications/integration-settings',
        icon: Cloud,
        allowedRoles: ['admin'],
        requiredPermission: 'integrations.view',
      },
      {
        id: 'meta-settings',
        title: 'إعدادات Meta',
        href: '/admin/communications/meta-settings',
        icon: Cloud,
      },
    ],
  },
  {
    label: 'الفرق',
    icon: Users,
    items: [
      {
        id: 'digital-marketing',
        title: 'التسويق الرقمي',
        href: '/admin/teams/digital-marketing',
        icon: Megaphone,
      },
      { id: 'media', title: 'وحدة الإعلام', href: '/admin/teams/media', icon: Video },
      {
        id: 'field-marketing',
        title: 'التسويق الميداني',
        href: '/admin/teams/field-marketing',
        icon: MapPin,
      },
      {
        id: 'customer-service',
        title: 'خدمة العملاء',
        href: '/admin/teams/customer-service',
        icon: Headphones,
      },
    ],
  },
  {
    label: 'التقارير والتحليلات',
    icon: BarChart3,
    items: [
      {
        id: 'reports',
        title: 'التقارير',
        href: '/admin/reports/reports',
        icon: FileText,
        feature: 'reports',
        requiredPermission: 'reports.view',
      },
      {
        id: 'analytics',
        title: 'التحليلات',
        href: '/admin/reports/analytics',
        icon: BarChart3,
        feature: 'reports',
        requiredPermission: 'reports.view',
      },
      {
        id: 'bi',
        title: 'تحليلات الأعمال',
        href: '/admin/reports/bi',
        icon: PieChart,
        requiredPermission: 'reports.view',
      },
      {
        id: 'pwa-stats',
        title: 'إحصائيات PWA',
        href: '/admin/reports/pwa-stats',
        icon: Gauge,
        requiredPermission: 'reports.view',
      },
    ],
  },
  {
    label: 'الإدارة العامة',
    icon: SettingsIcon,
    items: [
      { id: 'profile', title: 'الملف الشخصي', href: '/admin/profile', icon: User },
      {
        id: 'notifications',
        title: 'الإشعارات',
        href: '/admin/notifications',
        icon: MessageCircle,
      },
      { id: 'offline', title: 'وضع عدم الاتصال', href: '/admin/offline', icon: Cloud },
      { id: 'users', title: 'المستخدمين', href: '/admin/users/users', icon: Users },
      {
        id: 'campaigns',
        title: 'الحملات والمشاريع',
        href: '/admin/campaigns/campaigns',
        icon: Target,
        requiredPermission: 'campaigns.view',
      },
      {
        id: 'projects',
        title: 'المشاريع',
        href: '/admin/campaigns/projects',
        icon: FolderKanban,
        requiredPermission: 'campaigns.view',
      },
      {
        id: 'review-approval',
        title: 'المراجعة والاعتماد',
        href: '/admin/campaigns/review-approval',
        icon: CheckSquare,
        requiredPermission: 'content.review',
      },
      {
        id: 'tracking-settings',
        title: 'إعدادات التتبع',
        href: '/admin/tracking-settings',
        icon: SettingsIcon,
        requiredPermission: 'settings.tracking.manage',
      },
      { id: 'settings', title: 'الإعدادات', href: '/admin/settings', icon: SettingsIcon },
      { id: 'updates', title: 'إدارة التحديثات', href: '/admin/system/updates', icon: RotateCw },
      { id: 'system-status', title: 'حالة النظام', href: '/admin/system/status', icon: Gauge },
      { id: 'backups', title: 'النسخ الاحتياطي', href: '/admin/system/backups', icon: Database },
      {
        id: 'advanced-settings',
        title: 'إعدادات متقدمة',
        href: '/admin/advanced-settings',
        icon: MoreHorizontal,
      },
    ],
  },
];

// The flat registry is derived from the grouped registry so every navigation
// consumer resolves the same item definition and permission metadata.
export const allNavItems: NavItem[] = Array.from(
  new Map(
    [...primaryNavItems, ...allToolsGroups.flatMap((group) => group.items)].map((item) => [
      item.id,
      item,
    ])
  ).values()
);
