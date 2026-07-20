/**
 * Dashboard Sidebar Navigation Data
 * بيانات التنقل للشريط الجانبي
 */

import {
  LayoutDashboard,
  Settings as SettingsIcon,
  Send,
  MessageSquare,
  FileText,
  BarChart3,
  MessageCircle,
  FileEdit,
  Users,
  User,
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
  MoreHorizontal,
  TrendingUp,
  Radio,
  Smartphone,
  FolderKanban,
  PieChart,
  Shield,
  Activity,
  Terminal,
  Gauge,
  Database,
  ShoppingCart,
  Package,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  hasDot?: boolean;
  id: string;
}

export interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

// جميع العناصر المتاحة
export const allNavItems: NavItem[] = [
  { id: 'home', title: 'الرئيسية', href: '/admin', icon: Home },
  { id: 'profile', title: 'الملف الشخصي', href: '/admin/profile', icon: User },
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
  { id: 'offer-leads', title: 'عروض العملاء', href: '/admin/bookings/offer-leads', icon: Gift },
  {
    id: 'camp-registrations',
    title: 'تسجيلات المخيمات',
    href: '/admin/bookings/camp-registrations',
    icon: Tent,
  },
  { id: 'customers', title: 'ملفات العملاء', href: '/admin/bookings/customers', icon: Contact },
  { id: 'tasks', title: 'المهام', href: '/admin/bookings/tasks', icon: CheckSquare },
  { id: 'bookings', title: 'إدارة الحجوزات', href: '/admin/bookings', icon: ClipboardList },
  { id: 'reports', title: 'التقارير', href: '/admin/reports/reports', icon: FileText },
  { id: 'analytics', title: 'التحليلات', href: '/admin/reports/analytics', icon: BarChart3 },
  { id: 'bi', title: 'ذكاء الأعمال (BI)', href: '/admin/reports/bi', icon: TrendingUp },
  {
    id: 'camp-stats',
    title: 'إحصائيات المخيمات',
    href: '/admin/reports/camp-stats',
    icon: BarChart3,
  },
  {
    id: 'tracking-settings',
    title: 'إعدادات التتبع',
    href: '/admin/tracking-settings',
    icon: SettingsIcon,
  },
  { id: 'whatsapp', title: 'الرسائل والمحادثات', href: '/admin/whatsapp', icon: MessageCircle },
  {
    id: 'whatsapp-dashboard',
    title: 'لوحة تحكم واتساب',
    href: '/admin/whatsapp/whatsapp-dashboard',
    icon: BarChart3,
  },
  {
    id: 'whatsapp-templates',
    title: 'قوالب الرسائل',
    href: '/admin/whatsapp/templates',
    icon: FileText,
  },
  {
    id: 'whatsapp-analytics',
    title: 'تحليلات واتساب',
    href: '/admin/whatsapp/analytics',
    icon: BarChart3,
  },
  { id: 'whatsapp-broadcast', title: 'بث واتساب', href: '/admin/whatsapp/broadcast', icon: Radio },
  {
    id: 'whatsapp-auto-reply',
    title: 'الرد التلقائي',
    href: '/admin/whatsapp/auto-reply',
    icon: MessageSquare,
  },
  {
    id: 'whatsapp-compliance',
    title: 'الأمان والامتثال',
    href: '/admin/whatsapp/compliance',
    icon: SettingsIcon,
  },
  {
    id: 'whatsapp-appointments',
    title: 'سجل الإشعارات',
    href: '/admin/whatsapp/appointments',
    icon: Calendar,
  },
  {
    id: 'whatsapp-connection',
    title: 'إعدادات الاتصال',
    href: '/admin/whatsapp/connection',
    icon: SettingsIcon,
  },
  {
    id: 'whatsapp-integration',
    title: 'التكامل',
    href: '/admin/whatsapp/integration',
    icon: Smartphone,
  },
  {
    id: 'whatsapp-account-health',
    title: 'صحة الحساب',
    href: '/admin/whatsapp/account-health',
    icon: Shield,
  },
  {
    id: 'whatsapp-phone-quality',
    title: 'جودة الرقم',
    href: '/admin/whatsapp/phone-quality',
    icon: Smartphone,
  },
  {
    id: 'whatsapp-subscriptions',
    title: 'الاشتراكات',
    href: '/admin/whatsapp/subscriptions',
    icon: Users,
  },
  {
    id: 'whatsapp-webhook-inspector',
    title: 'فاحص الأحداث',
    href: '/admin/whatsapp/webhook-inspector',
    icon: Terminal,
  },
  { id: 'messages', title: 'الرسائل', href: '/admin/communications/messages', icon: MessageSquare },
  {
    id: 'message-settings',
    title: 'إعدادات الرسائل',
    href: '/admin/message-settings',
    icon: SettingsIcon,
  },
  { id: 'management', title: 'الإدارة', href: '/admin/management', icon: SettingsIcon },
  { id: 'content', title: 'المحتوى', href: '/admin/content/content', icon: FileEdit },
  { id: 'publishing', title: 'النشر', href: '/admin/content/publishing', icon: Send },
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
  { id: 'users', title: 'المستخدمين', href: '/admin/users/users', icon: Users },
  { id: 'campaigns', title: 'الحملات والمشاريع', href: '/admin/campaigns/campaigns', icon: Target },
  { id: 'projects', title: 'المشاريع', href: '/admin/campaigns/projects', icon: FolderKanban },
  {
    id: 'review-approval',
    title: 'المراجعة والاعتماد',
    href: '/admin/campaigns/review-approval',
    icon: CheckSquare,
  },
  { id: 'pwa-stats', title: 'إحصائيات PWA', href: '/admin/reports/pwa-stats', icon: PieChart },
  { id: 'settings', title: 'الإعدادات', href: '/admin/settings', icon: SettingsIcon },
];

// المجموعات لعرضها في لوحة كل الأدوات
export const allToolsGroups: NavGroup[] = [
  {
    label: 'إدارة الحجوزات',
    icon: ClipboardList,
    items: [
      { id: 'bookings', title: 'إدارة الحجوزات', href: '/admin/bookings', icon: ClipboardList },
      { id: 'leads', title: 'العملاء المحتملين', href: '/admin/bookings/leads', icon: UserCheck },
      {
        id: 'appointments',
        title: 'مواعيد الأطباء',
        href: '/admin/bookings/appointments',
        icon: Calendar,
      },
      { id: 'offer-leads', title: 'عروض العملاء', href: '/admin/bookings/offer-leads', icon: Gift },
      {
        id: 'camp-registrations',
        title: 'تسجيلات المخيمات',
        href: '/admin/bookings/camp-registrations',
        icon: Tent,
      },
      { id: 'customers', title: 'ملفات العملاء', href: '/admin/bookings/customers', icon: Contact },
      { id: 'tasks', title: 'المهام', href: '/admin/bookings/tasks', icon: CheckSquare },
    ],
  },
  {
    label: 'إدارة المحتوى',
    icon: FileEdit,
    items: [
      { id: 'management', title: 'الإدارة', href: '/admin/management', icon: SettingsIcon },
      { id: 'content', title: 'المحتوى', href: '/admin/content/content', icon: FileEdit },
      { id: 'publishing', title: 'النشر', href: '/admin/content/publishing', icon: Send },
    ],
  },
  {
    label: 'التواصل',
    icon: MessageCircle,
    items: [
      { id: 'whatsapp', title: 'الرسائل والمحادثات', href: '/admin/whatsapp', icon: MessageCircle },
      {
        id: 'whatsapp-dashboard',
        title: 'لوحة تحكم واتساب',
        href: '/admin/whatsapp/whatsapp-dashboard',
        icon: BarChart3,
      },
      {
        id: 'whatsapp-templates',
        title: 'قوالب الرسائل',
        href: '/admin/whatsapp/templates',
        icon: FileText,
      },
      {
        id: 'whatsapp-analytics',
        title: 'تحليلات واتساب',
        href: '/admin/whatsapp/analytics',
        icon: BarChart3,
      },
      {
        id: 'whatsapp-broadcast',
        title: 'بث واتساب',
        href: '/admin/whatsapp/broadcast',
        icon: Radio,
      },
      {
        id: 'whatsapp-auto-reply',
        title: 'الرد التلقائي',
        href: '/admin/whatsapp/auto-reply',
        icon: MessageSquare,
      },
      {
        id: 'whatsapp-compliance',
        title: 'الأمان والامتثال',
        href: '/admin/whatsapp/compliance',
        icon: SettingsIcon,
      },
      {
        id: 'whatsapp-appointments',
        title: 'سجل الإشعارات',
        href: '/admin/whatsapp/appointments',
        icon: Calendar,
      },
      {
        id: 'whatsapp-connection',
        title: 'إعدادات الاتصال',
        href: '/admin/whatsapp/connection',
        icon: SettingsIcon,
      },
      {
        id: 'whatsapp-integration',
        title: 'التكامل',
        href: '/admin/whatsapp/integration',
        icon: Smartphone,
      },
      {
        id: 'whatsapp-account-health',
        title: 'صحة الحساب',
        href: '/admin/whatsapp/account-health',
        icon: Shield,
      },
      {
        id: 'whatsapp-phone-quality',
        title: 'جودة الرقم',
        href: '/admin/whatsapp/phone-quality',
        icon: Smartphone,
      },
      {
        id: 'whatsapp-subscriptions',
        title: 'الاشتراكات',
        href: '/admin/whatsapp/subscriptions',
        icon: Users,
      },
      {
        id: 'whatsapp-webhook-inspector',
        title: 'فاحص الأحداث',
        href: '/admin/whatsapp/webhook-inspector',
        icon: Terminal,
      },
      {
        id: 'whatsapp-costs',
        title: 'تكاليف واتساب',
        href: '/admin/whatsapp/costs',
        icon: TrendingUp,
      },
      {
        id: 'whatsapp-orders',
        title: 'طلبات واتساب',
        href: '/admin/whatsapp/orders',
        icon: ShoppingCart,
      },
      {
        id: 'whatsapp-products',
        title: 'منتجات واتساب',
        href: '/admin/whatsapp/products',
        icon: Package,
      },
      {
        id: 'whatsapp-referrals',
        title: 'إحالات واتساب',
        href: '/admin/whatsapp/referrals',
        icon: Megaphone,
      },
      {
        id: 'whatsapp-lab-results',
        title: 'نتائج المختبر',
        href: '/admin/whatsapp/lab-results',
        icon: FileText,
      },
      {
        id: 'messages',
        title: 'الرسائل',
        href: '/admin/communications/messages',
        icon: MessageSquare,
      },
      {
        id: 'message-settings',
        title: 'إعدادات الرسائل',
        href: '/admin/message-settings',
        icon: SettingsIcon,
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
      { id: 'reports', title: 'التقارير', href: '/admin/reports/reports', icon: FileText },
      { id: 'analytics', title: 'التحليلات', href: '/admin/reports/analytics', icon: BarChart3 },
      { id: 'bi', title: 'ذكاء الأعمال (BI)', href: '/admin/reports/bi', icon: TrendingUp },
      {
        id: 'camp-stats',
        title: 'إحصائيات المخيمات',
        href: '/admin/reports/camp-stats',
        icon: BarChart3,
      },
      { id: 'pwa-stats', title: 'إحصائيات PWA', href: '/admin/reports/pwa-stats', icon: PieChart },
      {
        id: 'tracking-settings',
        title: 'إعدادات التتبع',
        href: '/admin/tracking-settings',
        icon: SettingsIcon,
      },
    ],
  },
  {
    label: 'الإدارة العامة',
    icon: SettingsIcon,
    items: [
      { id: 'profile', title: 'الملف الشخصي', href: '/admin/profile', icon: User },
      { id: 'users', title: 'المستخدمين', href: '/admin/users/users', icon: Users },
      {
        id: 'campaigns',
        title: 'الحملات والمشاريع',
        href: '/admin/campaigns/campaigns',
        icon: Target,
      },
      { id: 'projects', title: 'المشاريع', href: '/admin/campaigns/projects', icon: FolderKanban },
      {
        id: 'review-approval',
        title: 'المراجعة والاعتماد',
        href: '/admin/campaigns/review-approval',
        icon: CheckSquare,
      },
      { id: 'settings', title: 'الإعدادات', href: '/admin/settings', icon: SettingsIcon },
      { id: 'updates', title: 'إدارة التحديثات', href: '/admin/system/updates', icon: Activity },
      { id: 'system-status', title: 'حالة النظام', href: '/admin/system/status', icon: Gauge },
      { id: 'backups', title: 'النسخ الاحتياطي', href: '/admin/system/backups', icon: Database },
      {
        id: 'advanced-settings',
        title: 'إعدادات متقدمة',
        href: '/admin/advanced-settings',
        icon: MoreHorizontal,
      },
      {
        id: 'departments-specialties',
        title: 'الأقسام والتخصصات',
        href: '/admin/departments-specialties',
        icon: LayoutDashboard,
      },
    ],
  },
];

// أهم 5 أقسام للشريط السفلي
export const bottomNavItems: NavItem[] = [
  { id: 'home', title: 'الرئيسية', href: '/admin', icon: Home },
  {
    id: 'leads',
    title: 'العملاء',
    href: '/admin/bookings/leads',
    icon: UserCheck,
    hasDot: true,
  },
  {
    id: 'appointments',
    title: 'المواعيد',
    href: '/admin/bookings/appointments',
    icon: Calendar,
  },
  { id: 'reports', title: 'التقارير', href: '/admin/reports/reports', icon: FileText },
];

// القيم الافتراضية للعناصر المرئية
export const defaultVisibleItemIds: string[] = [
  'home',
  'leads',
  'appointments',
  'offer-leads',
  'camp-registrations',
  'customers',
  'tasks',
  'reports',
  'whatsapp',
  'management',
];
