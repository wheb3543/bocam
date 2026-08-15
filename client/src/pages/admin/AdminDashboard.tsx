import { lazy, Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
const ManualRegistrationForm = lazy(() => import('@/components/form/ManualRegistrationForm'));
const NotificationCenter = lazy(() => import('@/components/notification/NotificationCenter'));
const SourceAnalytics = lazy(() => import('@/components/dashboard/SourceAnalytics'));
const QuickPatientSearch = lazy(() => import('@/components/dashboard/QuickPatientSearch'));
const DetailedStatsCards = lazy(() => import('@/components/dashboard/DetailedStatsCards'));
const DashboardCharts = lazy(() => import('@/components/dashboard/DashboardCharts'));
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLicense } from '@/hooks/integrations/useLicense';
import FeatureLockedPage from '@/pages/admin/shared/FeatureLockedPage';

export default function AdminDashboard() {
  const { hasFeature, isLicenseValid } = useLicense();

  // Check if analytics feature is enabled
  if (!hasFeature('analytics') || !isLicenseValid) {
    return <FeatureLockedPage featureName="analytics" />;
  }

  return (
    <DashboardLayout
      pageTitle="لوحة التحكم الإدارية"
      pageDescription="إدارة حملات التسويق والعملاء"
    >
      <div className="container px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Detailed Stats Cards */}
        <ErrorBoundary title="تعذر تحميل لوحة الإحصائيات" message="لم نتمكن من تحميل قسم الإحصائيات. يرجى المحاولة مرة أخرى.">
          <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
            <DetailedStatsCards />
          </Suspense>
        </ErrorBoundary>

        {/* Quick Patient Search & Manual Registration */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 sm:mb-8">
          <div className="flex-1 w-full">
            <ErrorBoundary title="تعذر تحميل البحث السريع" message="لم نتمكن من تحميل قسم البحث السريع. يرجى المحاولة مرة أخرى.">
              <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
                <QuickPatientSearch />
              </Suspense>
            </ErrorBoundary>
          </div>
          <div className="flex-shrink-0 w-full lg:w-auto">
            <ErrorBoundary title="تعذر تحميل نموذج التسجيل اليدوي" message="لم نتمكن من تحميل نموذج التسجيل اليدوي. يرجى المحاولة مرة أخرى.">
              <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
                <ManualRegistrationForm />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Notification Center */}
        <div className="mb-6 sm:mb-8">
          <ErrorBoundary title="تعذر تحميل مركز الإشعارات" message="لم نتمكن من تحميل مركز الإشعارات. يرجى المحاولة مرة أخرى.">
            <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
              <NotificationCenter />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Analytics */}
        <div className="mb-6 sm:mb-8">
          <ErrorBoundary title="تعذر تحميل التحليلات" message="لم نتمكن من تحميل قسم التحليلات. يرجى المحاولة مرة أخرى.">
            <Suspense fallback={<div className="h-32 rounded-xl bg-muted/30 animate-pulse" />}>
              <SourceAnalytics />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Charts Dashboard - lazy loaded to reduce initial bundle */}
        <div className="mb-6 sm:mb-8">
          <ErrorBoundary title="تعذر تحميل الرسوم البيانية" message="لم نتمكن من تحميل الرسوم البيانية. يرجى المحاولة مرة أخرى.">
            <Suspense
              fallback={
                <div className="h-64 sm:h-80 rounded-xl bg-muted/30 animate-pulse flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">جاري تحميل الرسوم البيانية...</span>
                </div>
              }
            >
              <DashboardCharts />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </DashboardLayout>
  );
}
