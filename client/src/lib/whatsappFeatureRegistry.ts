export const WHATSAPP_WORKSPACE_KEYS = [
  'conversations',
  'campaigns',
  'automation',
  'analytics',
  'operations',
  'governance',
] as const;

export type WhatsAppWorkspaceKey = (typeof WHATSAPP_WORKSPACE_KEYS)[number];
export type WhatsAppTransitionStatus = 'keep' | 'consolidate' | 'relocate' | 'freeze';

export type WhatsAppRouteOwnership = {
  currentPath: string;
  label: string;
  owner: WhatsAppWorkspaceKey | 'crm' | 'reporting';
  transition: WhatsAppTransitionStatus;
  targetPath: string;
  rationale: string;
};

/**
 * سجل انتقال داخلي فقط: يعرّف مالك كل وظيفة في مشروع دمج واتساب.
 * لا يُستخدم بعد لتغيير المسارات أو إخفاء أي صفحة؛ ستستهلكه مراحل الدمج التالية.
 */
export const WHATSAPP_ROUTE_OWNERSHIP: readonly WhatsAppRouteOwnership[] = [
  {
    currentPath: '/admin/whatsapp',
    label: 'المحادثات',
    owner: 'conversations',
    transition: 'keep',
    targetPath: '/admin/whatsapp',
    rationale: 'واجهة التشغيل الأساسية للمحادثات والوسائط والإسناد.',
  },
  {
    currentPath: '/admin/whatsapp/campaigns',
    label: 'إدارة البث',
    owner: 'campaigns',
    transition: 'keep',
    targetPath: '/admin/whatsapp/campaigns',
    rationale: 'المركز الحالي الأكثر اكتمالاً للبث والجدولة والتقارير والجهات.',
  },
  {
    currentPath: '/admin/whatsapp/templates',
    label: 'قوالب الرسائل',
    owner: 'campaigns',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/campaigns',
    rationale: 'تنضم إلى مركز الحملات والقوالب مع الحفاظ على إدارتها الحالية أثناء الانتقال.',
  },
  {
    currentPath: '/admin/whatsapp/broadcast',
    label: 'بث واتساب القديم',
    owner: 'campaigns',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/campaigns',
    rationale: 'وظائفه متداخلة مع إدارة البث الأحدث والأوسع.',
  },
  {
    currentPath: '/admin/whatsapp/integration',
    label: 'تكامل واتساب',
    owner: 'campaigns',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/campaigns',
    rationale: 'اختبار القوالب ينتمي إلى سياق القوالب والحملات، لا إلى مركز مستقل.',
  },
  {
    currentPath: '/admin/whatsapp/auto-reply',
    label: 'الرد التلقائي',
    owner: 'automation',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/automation',
    rationale: 'قاعدة أتمتة ينبغي عرضها بجوار سجل التنفيذ والإشعارات.',
  },
  {
    currentPath: '/admin/whatsapp/appointments',
    label: 'سجل الإشعارات',
    owner: 'automation',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/automation',
    rationale: 'يتضمن تنفيذ تذكيرات ومتابعات مرتبطة مباشرة بالأتمتة.',
  },
  {
    currentPath: '/admin/whatsapp/analytics',
    label: 'تحليلات واتساب',
    owner: 'analytics',
    transition: 'keep',
    targetPath: '/admin/whatsapp/analytics',
    rationale: 'هو موضع التحليل التشغيلي العام للقناة.',
  },
  {
    currentPath: '/admin/whatsapp/costs',
    label: 'تكاليف المحادثات',
    owner: 'analytics',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/analytics',
    rationale: 'التكلفة بُعد تحليلي يجب أن يستخدم فترة ومصطلحات موحدة.',
  },
  {
    currentPath: '/admin/whatsapp/connection',
    label: 'اتصال واتساب',
    owner: 'operations',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/operations',
    rationale: 'جاهزية Cloud API جزء من العمليات الفنية للقناة.',
  },
  {
    currentPath: '/admin/whatsapp/whatsapp-dashboard',
    label: 'لوحة تحكم واتساب الفنية',
    owner: 'operations',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/operations',
    rationale: 'اختبار الصحة والإرسال يحتاجان إلى سياق فني مضبوط الصلاحيات.',
  },
  {
    currentPath: '/admin/whatsapp/account-health',
    label: 'صحة الحساب',
    owner: 'operations',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/operations',
    rationale: 'التنبيهات التشغيلية وحالة الحساب تندمج مع الاتصال وجودة الرقم.',
  },
  {
    currentPath: '/admin/whatsapp/phone-quality',
    label: 'جودة الرقم',
    owner: 'operations',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/operations',
    rationale: 'المقياس مرتبط بصحة الحساب وأحداث التشغيل.',
  },
  {
    currentPath: '/admin/whatsapp/webhook-inspector',
    label: 'فاحص أحداث Webhook',
    owner: 'operations',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/operations',
    rationale: 'أداة تشخيص فنية لا ينبغي أن تنافس صفحة تشغيلية مستقلة في التنقل.',
  },
  {
    currentPath: '/admin/whatsapp/compliance',
    label: 'الامتثال والأمان',
    owner: 'governance',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/governance',
    rationale: 'الحظر وطلبات الإلغاء والتدقيق تشكل مركز حوكمة واحداً.',
  },
  {
    currentPath: '/admin/whatsapp/subscriptions',
    label: 'اشتراكات المستخدمين',
    owner: 'governance',
    transition: 'consolidate',
    targetPath: '/admin/whatsapp/governance',
    rationale: 'الموافقات والانسحاب جزء من الامتثال والخصوصية.',
  },
  {
    currentPath: '/admin/whatsapp/orders',
    label: 'طلبات واتساب',
    owner: 'crm',
    transition: 'relocate',
    targetPath: '/admin/bookings/appointments',
    rationale:
      'الطلب حالة متابعة عميل وليست إعداداً للقناة؛ يعرض الرابط القديم انتقالاً واضحاً إلى CRM.',
  },
  {
    currentPath: '/admin/whatsapp/referrals',
    label: 'إحالات واتساب',
    owner: 'reporting',
    transition: 'relocate',
    targetPath: '/admin/reports',
    rationale:
      'المصدر والتحويل يعالجان في تقارير التسويق وCRM؛ يعرض الرابط القديم انتقالاً واضحاً إلى التقارير.',
  },
  {
    currentPath: '/admin/whatsapp/products',
    label: 'منتجات واتساب',
    owner: 'crm',
    transition: 'freeze',
    targetPath: '/admin/bookings/appointments',
    rationale:
      'لا تملك الصفحة حالياً مصدراً حقيقياً للكتالوج؛ يعرض الرابط القديم حالة غير مفعّلة بدلاً من بيانات ثابتة حتى ربط بيانات فعلية.',
  },
];

export function getWhatsAppRouteOwnership(path: string) {
  return (
    WHATSAPP_ROUTE_OWNERSHIP.find((route) => route.currentPath === path) ??
    WHATSAPP_ROUTE_OWNERSHIP.find((route) => route.targetPath === path)
  );
}
