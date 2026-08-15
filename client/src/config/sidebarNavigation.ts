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
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  hasDot?: boolean;
  id: string;
  feature?: string;
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
];

export const STORAGE_KEY = 'sgh-sidebar-visible-items';

export const allNavItems: NavItem[] = [
  {
    id: 'home',
    title: 'الرئيسية',
    href: '/admin',
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
    title: 'الرسائل',
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

export const allToolsGroups: NavGroup[] = [
  {
    label: 'إدارة الحجوزات',
    icon: ClipboardList,
    defaultOpen: true,
    items: [
      { id: 'bookings', title: 'الحجوزات', href: '/admin/bookings', icon: FolderKanban },
      { id: 'leads', title: 'العملاء المحتملين', href: '/admin/bookings/leads', icon: UserCheck },
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
      { id: 'customers', title: 'ملفات العملاء', href: '/admin/bookings/customers', icon: Contact },
      {
        id: 'patient-results',
        title: 'نتائج بوابة المريض',
        href: '/admin/bookings/patient-results',
        icon: FileText,
        feature: 'patient_portal',
      },
      { id: 'tasks', title: 'المهام', href: '/admin/bookings/tasks', icon: CheckSquare },
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
        id: 'whatsapp-templates',
        title: 'قوالب واتساب',
        href: '/admin/whatsapp/templates',
        icon: FileText,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-connection',
        title: 'اتصال واتساب',
        href: '/admin/whatsapp/connection',
        icon: Cloud,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-auto-reply',
        title: 'الردود التلقائية',
        href: '/admin/whatsapp/auto-reply',
        icon: SettingsIcon,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-analytics',
        title: 'تحليلات واتساب',
        href: '/admin/whatsapp/analytics',
        icon: TrendingUp,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-broadcast',
        title: 'بث واتساب',
        href: '/admin/whatsapp/broadcast',
        icon: Radio,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-compliance',
        title: 'الامتثال والأمان',
        href: '/admin/whatsapp/compliance',
        icon: Shield,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-appointments',
        title: 'سجل الإشعارات',
        href: '/admin/whatsapp/appointments',
        icon: Smartphone,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-integration',
        title: 'تكامل واتساب',
        href: '/admin/whatsapp/integration',
        icon: Cloud,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-costs',
        title: 'تكاليف واتساب',
        href: '/admin/whatsapp/costs',
        icon: TrendingUp,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-orders',
        title: 'طلبات واتساب',
        href: '/admin/whatsapp/orders',
        icon: ShoppingCart,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-products',
        title: 'منتجات واتساب',
        href: '/admin/whatsapp/products',
        icon: Package,
        feature: 'whatsapp',
      },
      {
        id: 'whatsapp-referrals',
        title: 'إحالات واتساب',
        href: '/admin/whatsapp/referrals',
        icon: Megaphone,
        feature: 'whatsapp',
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
      {
        id: 'reports',
        title: 'التقارير',
        href: '/admin/reports/reports',
        icon: FileText,
        feature: 'reports',
      },
      {
        id: 'analytics',
        title: 'التحليلات',
        href: '/admin/reports/analytics',
        icon: BarChart3,
        feature: 'reports',
      },
      { id: 'bi', title: 'تحليلات الأعمال', href: '/admin/reports/bi', icon: PieChart },
      { id: 'pwa-stats', title: 'إحصائيات PWA', href: '/admin/reports/pwa-stats', icon: Gauge },
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
      {
        id: 'tracking-settings',
        title: 'إعدادات التتبع',
        href: '/admin/tracking-settings',
        icon: SettingsIcon,
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
      {
        id: 'departments-specialties',
        title: 'الأقسام والتخصصات',
        href: '/admin/departments-specialties',
        icon: LayoutDashboard,
      },
    ],
  },
];
