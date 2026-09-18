import { Toaster } from '@core/components/ui/sonner';
import { useEffect, lazy, Suspense, useState } from 'react';
import { initializeTracking } from './lib/tracking/tracking';
import { TooltipProvider } from '@core/components/ui/tooltip';
import AdminContentSkeleton from '@apps/admin/layout/AdminContentSkeleton';
const NotFound = lazy(() => import('@/pages/NotFound'));
import { Redirect, Route, Switch, useLocation } from 'wouter';
import { toast } from 'sonner';
import ErrorBoundary from '@core/components/feedback/ErrorBoundary';
import { ThemeProvider } from '@core/contexts/ThemeContext';
import { LanguageProvider } from '@core/contexts/LanguageContext';
import { consumeToastHash } from '@core/lib/toastHashRouter';
const DashboardShell = lazy(() => import('@apps/admin/layout/DashboardShell'));
import { UpdateProgressModal } from '@core/components/feedback/update/UpdateProgressModal';
import { MandatoryUpdateModal } from '@core/components/feedback/update/MandatoryUpdateModal';
import { OptionalUpdateBanner } from '@core/components/feedback/update/OptionalUpdateBanner';
import { useUpdateChecker } from '@/hooks/integrations/useUpdateChecker';
import { BookingModal } from '@apps/admin/modules/01-booking-scheduling/components/BookingModal';
import { trpc } from '@core/api/trpc';
// Lazy load pages for better performance
const HomePage = lazy(() => import('@apps/public/modules/01-home/pages/HomePage'));
const ThankYou = lazy(() => import('@apps/public/modules/02-booking/pages/ThankYouPage'));
const DynamicPage = lazy(
  () => import('@apps/public/modules/05-content-and-legal/pages/DynamicCmsPage')
);
const DraftPreviewPage = lazy(
  () => import('@apps/public/modules/05-content-and-legal/pages/DraftPreviewPage')
);
const DepartmentsPage = lazy(
  () => import('@apps/public/modules/03-medical-directory/pages/DepartmentsListPage')
);
const DepartmentDetailPage = lazy(
  () => import('@apps/public/modules/03-medical-directory/pages/DepartmentDetailPage')
);
const Doctors = lazy(
  () => import('@apps/public/modules/03-medical-directory/pages/DoctorsListPage')
);
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const AccessRequest = lazy(() => import('@apps/admin/auth/AccessRequestPage'));
const OffersListPage = lazy(
  () => import('@apps/public/modules/04-camps-and-offers/pages/OffersListPage')
);
const CampsListPage = lazy(
  () => import('@apps/public/modules/04-camps-and-offers/pages/CampsListPage')
);
const DoctorDetailPage = lazy(
  () => import('@apps/public/modules/03-medical-directory/pages/DoctorDetailPage')
);
const OfferDetailPage = lazy(
  () => import('@apps/public/modules/04-camps-and-offers/pages/OfferDetailPage')
);
const CampDetailPage = lazy(
  () => import('@apps/public/modules/04-camps-and-offers/pages/CampDetailPage')
);
const VisitingDoctors = lazy(
  () => import('@apps/public/modules/03-medical-directory/pages/VisitingDoctorsPage')
);
const OfflinePage = lazy(() => import('./pages/OfflinePage'));
const SettingsPage = lazy(
  () => import('@apps/admin/modules/01-booking-scheduling/settings/BookingSettingsPage')
);
import PWAManager from './components/PWAManager';
import MetaPixel from '@apps/admin/modules/04-marketing-publishing/tracking/MetaPixel';
import OfflineIndicator from './components/OfflineIndicator';
import CookieConsentBanner from './components/CookieConsentBanner';
import PrivacyPolicyConsentBanner from './components/PrivacyPolicyConsentBanner';
const PatientPortalLogin = lazy(() => import('@apps/patient-portal/auth/PatientLoginPage'));
const PatientDashboard = lazy(
  () => import('@apps/patient-portal/modules/dashboard/PatientDashboardPage')
);
const PatientHomePage = lazy(
  () => import('@apps/patient-portal/modules/dashboard/PatientDashboardPage')
);
const PatientAppointmentsPage = lazy(
  () => import('@apps/patient-portal/modules/appointments/pages/PatientAppointmentsPage')
);
const PatientAppointmentDetailsPage = lazy(
  () => import('@apps/patient-portal/modules/appointments/pages/PatientAppointmentDetailsPage')
);
const PatientOffersPage = lazy(
  () => import('@apps/patient-portal/modules/camps-offers/pages/PatientOffersPage')
);
const PatientCampsPage = lazy(
  () => import('@apps/patient-portal/modules/camps-offers/pages/PatientCampsPage')
);
const PatientResultsPage = lazy(
  () => import('@apps/patient-portal/modules/lab-results/pages/PatientResultsPage')
);
const PatientResultDetailsPage = lazy(
  () => import('@apps/patient-portal/modules/lab-results/pages/PatientResultDetailsPage')
);
const PatientProfilePage = lazy(
  () => import('@apps/patient-portal/modules/family/pages/FamilyProfilePage')
);
const PatientPortalLayout = lazy(() => import('@apps/patient-portal/layout/PatientPortalLayout'));
const PrivacyPolicyPage = lazy(
  () => import('@apps/public/modules/05-content-and-legal/pages/PrivacyPolicyPage')
);
const PrivacyPolicyChangelogPage = lazy(
  () => import('@apps/public/modules/05-content-and-legal/pages/PrivacyPolicyChangelogPage')
);
const AdminLogin = lazy(() => import('@apps/admin/auth/AdminLoginPage'));
const FeatureLockedPage = lazy(() => import('@apps/admin/shared/feedback/FeatureLockedPage'));
const ActivationPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/license/ActivationPage')
);

// Prefetch critical pages for better performance
function PrefetchRoutes() {
  const [location] = useLocation();

  useEffect(() => {
    // Prefetch public pages when on home page
    if (location === '/') {
      import('@apps/public/modules/03-medical-directory/pages/DepartmentsListPage');
      import('@apps/public/modules/03-medical-directory/pages/DoctorsListPage');
      import('@apps/public/modules/04-camps-and-offers/pages/OffersListPage');
      import('@apps/public/modules/04-camps-and-offers/pages/CampsListPage');
    }

    // Prefetch admin dashboard and system showcase when on admin or system routes
    if (location.startsWith('/admin') || location.startsWith('/system')) {
      import('@apps/admin/modules/10-system-settings/pages/SystemLandingPage');
      import('@apps/admin/modules/10-system-settings/pages/AdminDashboardPage');
      import('@apps/admin/modules/01-booking-scheduling/settings/BookingSettingsPage');
      import('@apps/admin/modules/01-booking-scheduling/pages/AppointmentsManagementPage');
      import('@apps/admin/modules/10-system-settings/pages/ReportsPage');
    }

    // Prefetch patient portal pages when on patient portal
    if (location.startsWith('/patient-portal')) {
      import('@apps/patient-portal/modules/dashboard/PatientDashboardPage');
      import('@apps/patient-portal/modules/appointments/pages/PatientAppointmentsPage');
      import('@apps/patient-portal/modules/camps-offers/pages/PatientOffersPage');
    }
  }, [location]);

  return null;
}

function Router() {
  const [location] = useLocation();
  const { data: licenseInfo, isLoading: checkingLicense } = trpc.license.getInfo.useQuery(
    undefined,
    {
      retry: false,
    }
  );

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // License access is based on signature, expiry, and hardware validation rather than merely
  // checking that a license.json file exists.
  if (checkingLicense) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  // Keep the local administrator login accessible so a successful sign-in can show the
  // explicit request dialog; all other application routes remain gated.
  if (!licenseInfo?.isValid && location !== '/activation' && location !== '/admin-login') {
    return <ActivationPage />;
  }

  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <Switch>
        <Route path={'/activation'} component={ActivationPage} />
        <Route path={'/'} component={HomePage} />
        <Route path={'/preview/:token'} component={DraftPreviewPage} />
        <Route path={'/page/:slug'} component={DynamicPage} />
        <Route path={'/departments'} component={DepartmentsPage} />
        <Route path={'/departments/:slug'} component={DepartmentDetailPage} />
        <Route path={'/doctors'} component={Doctors} />
        <Route path={'/visiting-doctors'} component={VisitingDoctors} />

        <Route path={'/doctors/:slug'} component={DoctorDetailPage} />
        <Route path={'/offers'} component={OffersListPage} />
        <Route path={'/offers/:slug'} component={OfferDetailPage} />
        <Route path={'/camps'} component={CampsListPage} />
        <Route path={'/camps/:slug'} component={CampDetailPage} />
        <Route path={'/thank-you'} component={ThankYou} />
        <Route path={'/privacy-policy'} component={PrivacyPolicyPage} />
        <Route path={'/privacy-policy-changelog'} component={PrivacyPolicyChangelogPage} />
        <Route path={'/unauthorized'} component={Unauthorized} />
        <Route path={'/access-request'} component={AccessRequest} />
        <Route path={'/admin-login'} component={AdminLogin} />
        <Route path="/feature-locked/:feature">
          <FeatureLockedPage />
        </Route>

        {/* Keep the administrative chrome mounted while only content routes change. */}
        <Route path="/admin/*?">
          <Suspense fallback={<AdminContentSkeleton variant="workspace" />}>
            <DashboardShell />
          </Suspense>
        </Route>
        <Route path="/system/*?">
          <Suspense fallback={<AdminContentSkeleton variant="workspace" />}>
            <DashboardShell />
          </Suspense>
        </Route>
        <Route path={'/patient-portal/login'} component={PatientPortalLogin} />
        <Route path={'/patient-portal/admin'} component={PatientDashboard} />
        <Route path={'/patient-portal/dashboard'} component={PatientDashboard} />

        {/* Patient Portal PWA Routes with Layout */}
        <Route path="/patient-portal/*?">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }
          >
            <PatientPortalLayout>
              <Switch>
                <Route path="/patient-portal">
                  <Redirect to="/patient-portal/home" />
                </Route>
                <Route path="/patient-portal/">
                  <Redirect to="/patient-portal/home" />
                </Route>
                <Route path="/patient-portal/home" component={PatientHomePage} />
                <Route path="/patient-portal/appointments" component={PatientAppointmentsPage} />
                <Route
                  path="/patient-portal/appointments/:id"
                  component={PatientAppointmentDetailsPage}
                />
                <Route path="/patient-portal/offers" component={PatientOffersPage} />
                <Route path="/patient-portal/camps" component={PatientCampsPage} />
                <Route path="/patient-portal/results" component={PatientResultsPage} />
                <Route path="/patient-portal/results/:id" component={PatientResultDetailsPage} />
                <Route path="/patient-portal/profile" component={PatientProfilePage} />
                <Route component={NotFound} />
              </Switch>
            </PatientPortalLayout>
          </Suspense>
        </Route>
        <Route path={'/offline'} component={OfflinePage} />
        <Route path={'/admin/settings'} component={SettingsPage} />
        <Route path={'/404'} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [, navigate] = useLocation();

  // Initialize UTM tracking on mount
  useEffect(() => {
    initializeTracking();
  }, []);

  useEffect(() => {
    const payload = consumeToastHash();
    if (!payload) {
      return;
    }

    const options = payload.description ? { description: payload.description } : undefined;

    switch (payload.kind) {
      case 'success':
        toast.success(payload.message ?? 'تمت العملية بنجاح', options);
        break;
      case 'error':
        toast.error(payload.message ?? 'حدث خطأ', options);
        break;
      case 'warning':
        toast.warning(payload.message ?? 'تنبيه', options);
        break;
      case 'info':
      default:
        toast.info(payload.message ?? 'معلومة', options);
        break;
    }

    const redirectPath = payload.redirect;
    if (redirectPath) {
      const timer = window.setTimeout(() => {
        navigate(redirectPath);
      }, 400);

      return () => window.clearTimeout(timer);
    }
  }, [navigate]);

  const { isMandatoryUpdate, isUpdateInProgress } = useUpdateChecker();
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);

  // Show mandatory update modal
  useEffect(() => {
    if (isMandatoryUpdate) {
      setShowMandatoryModal(true);
    }
  }, [isMandatoryUpdate]);

  // Show progress modal when update is in progress
  useEffect(() => {
    if (isUpdateInProgress) {
      setShowProgressModal(true);
    }
  }, [isUpdateInProgress]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <PWAManager />
            <OfflineIndicator />
            <CookieConsentBanner />
            <PrivacyPolicyConsentBanner />
            <MetaPixel />
            <OptionalUpdateBanner />
            <UpdateProgressModal open={showProgressModal} onOpenChange={setShowProgressModal} />
            <MandatoryUpdateModal open={showMandatoryModal} onOpenChange={setShowMandatoryModal} />
            <BookingModal />
            <PrefetchRoutes />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
