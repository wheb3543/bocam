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
import { useLicense } from '@/hooks/integrations/useLicense';
import { ChartNoAxesCombined, LockKeyhole } from 'lucide-react';

export default function AdminDashboard() {
  const { hasFeature, isLicenseValid } = useLicense();
  const analyticsAvailable = hasFeature('analytics') && isLicenseValid;

  return (
    <DashboardLayout
      pageTitle="لوحة التحكم الإدارية"
      pageDescription="إدارة حملات التسويق والعملاء"
    >
      <div className="container space-y-6 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        {!analyticsAvailable && (
          <Card className="border-amber-200 bg-amber-50/70 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
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
                className="shrink-0 border-amber-300 bg-background/70 hover:bg-amber-100 dark:hover:bg-amber-900/30"
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
        {analyticsAvailable && (
          <ErrorBoundary
            title="تعذر تحميل لوحة الإحصائيات"
            message="لم نتمكن من تحميل قسم الإحصائيات. يرجى المحاولة مرة أخرى."
          >
            <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
              <DetailedStatsCards />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Quick Patient Search & Manual Registration */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 sm:mb-8">
          <div className="flex-1 w-full">
            <ErrorBoundary
              title="تعذر تحميل البحث السريع"
              message="لم نتمكن من تحميل قسم البحث السريع. يرجى المحاولة مرة أخرى."
            >
              <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
                <QuickPatientSearch />
              </Suspense>
            </ErrorBoundary>
          </div>
          <div className="flex-shrink-0 w-full lg:w-auto">
            <ErrorBoundary
              title="تعذر تحميل نموذج التسجيل اليدوي"
              message="لم نتمكن من تحميل نموذج التسجيل اليدوي. يرجى المحاولة مرة أخرى."
            >
              <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
                <ManualRegistrationForm />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Notification Center */}
        <div className="mb-6 sm:mb-8">
          <ErrorBoundary
            title="تعذر تحميل مركز الإشعارات"
            message="لم نتمكن من تحميل مركز الإشعارات. يرجى المحاولة مرة أخرى."
          >
            <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
              <NotificationCenter />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Analytics */}
        {analyticsAvailable && (
          <div className="mb-6 sm:mb-8">
            <ErrorBoundary
              title="تعذر تحميل التحليلات"
              message="لم نتمكن من تحميل قسم التحليلات. يرجى المحاولة مرة أخرى."
            >
              <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
                <SourceAnalytics />
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
                  <div className="h-64 sm:h-80 rounded-xl bg-muted/30 animate-pulse flex items-center justify-center">
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
