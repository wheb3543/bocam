import { lazy, Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
const ManualRegistrationForm = lazy(() => import('@/components/form/ManualRegistrationForm'));
const NotificationCenter = lazy(() => import('@/components/notification/NotificationCenter'));
const SourceAnalytics = lazy(() => import('@/components/dashboard/SourceAnalytics'));
const QuickPatientSearch = lazy(() => import('@/components/dashboard/QuickPatientSearch'));
const DetailedStatsCards = lazy(() => import('@/components/dashboard/DetailedStatsCards'));
const DashboardCharts = lazy(() => import('@/components/dashboard/DashboardCharts'));
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { PermissionHint } from '@/components/PermissionHint';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { useLicense } from '@/hooks/integrations/useLicense';
import {
  Bell,
  ChartNoAxesCombined,
  LockKeyhole,
  MessageSquare,
  Search,
  Send,
  UserPlus,
} from 'lucide-react';

function DashboardSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Search;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

const OPERATIONAL_DASHBOARD_PERMISSIONS = [
  'leads.view',
  'appointments.view',
  'registrations.view',
] as const;

function RestrictedDashboardWidget() {
  return (
    <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold text-foreground">بيانات التشغيل مقيّدة</p>
          <p className="mt-1 text-sm text-muted-foreground">
            تحتاج هذه البطاقة إلى صلاحيات عرض العملاء والمواعيد والتسجيلات.
          </p>
        </div>
        <PermissionHint
          label="الصلاحيات المطلوبة"
          message="leads.view و appointments.view و registrations.view"
        />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { hasFeature, isLicenseValid } = useLicense();
  const { can, isLoading: permissionsLoading } = useRolePermissions();
  const analyticsAvailable = hasFeature('analytics') && isLicenseValid;
  const operationalWidgetsAvailable =
    !permissionsLoading && OPERATIONAL_DASHBOARD_PERMISSIONS.every((permission) => can(permission));

  return (
    <DashboardLayout
      pageTitle="لوحة التحكم الإدارية"
      pageDescription="إدارة حملات التسويق والعملاء"
      pageHeader="none"
    >
      <div className="container space-y-6 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8" dir="rtl">
        <AdminPageHeader
          eyebrow="مركز العمليات"
          title="لوحة التحكم"
          description="ابدأ بالبحث أو التسجيل، ثم تابع صندوق البريد والنشر من مساحات العمل المخصصة. تظهر التحليلات المتقدمة عند تفعيلها."
          status={
            <Badge
              variant="outline"
              className={
                analyticsAvailable
                  ? 'h-9 border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'h-9 border-amber-200 bg-amber-50 text-amber-800'
              }
            >
              {analyticsAvailable ? 'المؤشرات متاحة' : 'وضع التشغيل الأساسي'}
            </Badge>
          }
          actions={
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <Button asChild variant="outline" className="min-h-10 flex-1 sm:flex-none">
                <a href="/admin/communications/messages">
                  <MessageSquare className="ml-2 h-4 w-4" />
                  صندوق البريد
                </a>
              </Button>
              <Button asChild className="min-h-10 flex-1 sm:flex-none">
                <a href="/admin/content/publishing">
                  <Send className="ml-2 h-4 w-4" />
                  إنشاء منشور
                </a>
              </Button>
            </div>
          }
        />

        <section
          aria-label="اختصارات العمل اليومي"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            {
              icon: Search,
              label: 'ابحث عن مريض',
              href: '#quick-patient-search',
              detail: 'وصول سريع للسجل',
            },
            {
              icon: UserPlus,
              label: 'تسجيل يدوي',
              href: '#manual-registration',
              detail: 'إضافة مراجع جديد',
            },
            {
              icon: MessageSquare,
              label: 'تابع الرسائل',
              href: '/admin/communications/messages',
              detail: 'رسائل وتعليقات المنصات',
            },
            {
              icon: Bell,
              label: 'راجع التنبيهات',
              href: '#notification-center',
              detail: 'الأحداث التي تحتاج متابعة',
            },
          ].map((shortcut) => {
            const ShortcutIcon = shortcut.icon;
            return (
              <a
                key={shortcut.label}
                href={shortcut.href}
                className="group flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                  <ShortcutIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {shortcut.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {shortcut.detail}
                  </span>
                </span>
              </a>
            );
          })}
        </section>

        {!analyticsAvailable && (
          <Card
            className="border-amber-200 bg-amber-50/70 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20"
            role="status"
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <ChartNoAxesCombined className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">لوحة التشغيل متاحة</p>
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-transparent text-amber-800 dark:text-amber-300"
                    >
                      التحليلات غير مفعلة
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    يمكنك متابعة البحث والتسجيل والتنبيهات. ستظهر الرسوم والمؤشرات التحليلية عند
                    تفعيل هذه الميزة.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="min-h-10 shrink-0 border-amber-300 bg-background/70 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                <a href="/feature-locked/analytics">
                  <LockKeyhole className="ml-2 h-4 w-4" />
                  تفاصيل التفعيل
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Detailed Stats Cards */}
        {analyticsAvailable && operationalWidgetsAvailable ? (
          <ErrorBoundary
            title="تعذر تحميل لوحة الإحصائيات"
            message="لم نتمكن من تحميل قسم الإحصائيات. يرجى المحاولة مرة أخرى."
          >
            <Suspense
              fallback={
                <div
                  className="h-32 animate-pulse rounded-xl bg-muted/60"
                  role="status"
                  aria-label="جاري تحميل الإحصائيات"
                />
              }
            >
              <DetailedStatsCards />
            </Suspense>
          </ErrorBoundary>
        ) : analyticsAvailable ? (
          <RestrictedDashboardWidget />
        ) : null}

        {/* Quick Patient Search & Manual Registration */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
          <DashboardSection
            title="الوصول السريع للمراجعين"
            description="ابحث عن سجل قائم قبل إنشاء سجل جديد لتقليل التكرار وتسريع الخدمة."
            icon={Search}
          >
            <div id="quick-patient-search">
              <ErrorBoundary
                title="تعذر تحميل البحث السريع"
                message="لم نتمكن من تحميل قسم البحث السريع. يرجى المحاولة مرة أخرى."
              >
                <Suspense
                  fallback={
                    <div
                      className="h-32 animate-pulse rounded-xl bg-muted/60"
                      role="status"
                      aria-label="جاري تحميل البحث السريع"
                    />
                  }
                >
                  <QuickPatientSearch />
                </Suspense>
              </ErrorBoundary>
            </div>
          </DashboardSection>
          <DashboardSection
            title="تسجيل مراجع جديد"
            description="استخدم التسجيل اليدوي عندما لا يظهر السجل في البحث السريع."
            icon={UserPlus}
          >
            <div id="manual-registration">
              <ErrorBoundary
                title="تعذر تحميل نموذج التسجيل اليدوي"
                message="لم نتمكن من تحميل نموذج التسجيل اليدوي. يرجى المحاولة مرة أخرى."
              >
                <Suspense
                  fallback={
                    <div
                      className="h-32 animate-pulse rounded-xl bg-muted/60"
                      role="status"
                      aria-label="جاري تحميل نموذج التسجيل"
                    />
                  }
                >
                  <ManualRegistrationForm />
                </Suspense>
              </ErrorBoundary>
            </div>
          </DashboardSection>
        </div>

        {/* Notification Center */}
        <DashboardSection
          title="تنبيهات تحتاج إلى متابعة"
          description="راجع الأحداث والتنبيهات المركزية بعد إكمال عمليات البحث والتسجيل اليومية."
          icon={Bell}
        >
          <div id="notification-center">
            <ErrorBoundary
              title="تعذر تحميل مركز الإشعارات"
              message="لم نتمكن من تحميل مركز الإشعارات. يرجى المحاولة مرة أخرى."
            >
              <Suspense
                fallback={
                  <div
                    className="h-32 animate-pulse rounded-xl bg-muted/60"
                    role="status"
                    aria-label="جاري تحميل التنبيهات"
                  />
                }
              >
                {operationalWidgetsAvailable ? (
                  <NotificationCenter />
                ) : (
                  <RestrictedDashboardWidget />
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </DashboardSection>

        {/* Analytics */}
        {analyticsAvailable && (
          <div className="mb-6 sm:mb-8">
            <ErrorBoundary
              title="تعذر تحميل التحليلات"
              message="لم نتمكن من تحميل قسم التحليلات. يرجى المحاولة مرة أخرى."
            >
              <Suspense
                fallback={
                  <div
                    className="h-32 animate-pulse rounded-xl bg-muted/60"
                    role="status"
                    aria-label="جاري تحميل تحليلات المصادر"
                  />
                }
              >
                {operationalWidgetsAvailable ? <SourceAnalytics /> : <RestrictedDashboardWidget />}
              </Suspense>
            </ErrorBoundary>
          </div>
        )}

        {/* Charts Dashboard - lazy loaded to reduce initial bundle */}
        {analyticsAvailable && (
          <div className="mb-6 sm:mb-8">
            <ErrorBoundary
              title="تعذر تحميل الرسوم البيانية"
              message="لم نتمكن من تحميل الرسوم البيانية. يرجى المحاولة مرة أخرى."
            >
              <Suspense
                fallback={
                  <div
                    className="flex h-64 animate-pulse items-center justify-center rounded-xl bg-muted/60 sm:h-80"
                    role="status"
                    aria-label="جاري تحميل الرسوم البيانية"
                  >
                    <span className="text-sm text-muted-foreground">
                      جاري تحميل الرسوم البيانية...
                    </span>
                  </div>
                }
              >
                <DashboardCharts />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
