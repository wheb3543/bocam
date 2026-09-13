import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, ClipboardList, PackageX } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const transitionByPath = {
  '/admin/whatsapp/orders': {
    title: 'طلبات واتساب انتقلت إلى CRM',
    description: 'تُدار حالات متابعة العملاء والحجوزات من مركز CRM الموحد لضمان عدم تكرار السجلات.',
    action: 'فتح إدارة الحجوزات',
    href: '/admin/bookings',
    icon: ClipboardList,
  },
  '/admin/whatsapp/referrals': {
    title: 'إحالات واتساب انتقلت إلى التقارير',
    description:
      'تظهر الإحالات ومصادر التحويل ضمن تقارير التسويق الموحدة بدلاً من صفحة مستقلة للقناة.',
    action: 'فتح التقارير',
    href: '/admin/reports',
    icon: BarChart3,
  },
  '/admin/whatsapp/products': {
    title: 'كتالوج منتجات واتساب غير مفعّل',
    description:
      'أُزيلت المنتجات الثابتة من التشغيل حتى يتم ربط كتالوج حقيقي ومعتمد. لا توجد بيانات منتجات تجريبية معروضة هنا.',
    action: 'فتح الحملات والقوالب',
    href: '/admin/whatsapp/campaigns',
    icon: PackageX,
  },
} as const;

/** يحافظ على صلاحية الروابط القديمة ويمنع استمرار الواجهات المكررة أو البيانات الثابتة. */
export default function WhatsAppLegacyTransitionPage() {
  const [location] = useLocation();
  const transition =
    transitionByPath[location as keyof typeof transitionByPath] ??
    transitionByPath['/admin/whatsapp/products'];
  const Icon = transition.icon;

  return (
    <DashboardLayout
      pageTitle="انتقال ميزة واتساب"
      pageDescription="تم توحيد هذه الوظيفة ضمن مركز تشغيلي آخر"
    >
      <div className="container py-8 sm:py-12" dir="rtl">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="items-center text-center">
            <div className="mb-2 rounded-full bg-muted p-4">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">{transition.title}</CardTitle>
            <CardDescription className="max-w-lg text-sm leading-6">
              {transition.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild className="gap-2">
              <Link href={transition.href}>
                <ArrowLeft className="h-4 w-4" />
                {transition.action}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
