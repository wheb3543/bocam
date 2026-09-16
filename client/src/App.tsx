import { Toaster } from '@/components/ui/sonner';
import { useEffect, lazy, Suspense, useState } from 'react';
import { initializeTracking } from './lib/tracking/tracking';
import { TooltipProvider } from '@/components/ui/tooltip';
import AdminContentSkeleton from '@/components/layout/AdminContentSkeleton';
const NotFound = lazy(() => import('@/pages/NotFound'));
import { Route, Switch, useLocation } from 'wouter';
import { toast } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { consumeToastHash } from './lib/toastHashRouter';
const DashboardShell = lazy(() => import('@/components/layout/DashboardShell'));
import { UpdateProgressModal } from '@/components/update/UpdateProgressModal';
import { MandatoryUpdateModal } from '@/components/update/MandatoryUpdateModal';
import { OptionalUpdateBanner } from '@/components/update/OptionalUpdateBanner';
import { useUpdateChecker } from '@/hooks/integrations/useUpdateChecker';
import { BookingModal } from '@/components/booking/BookingModal';
import { trpc } from '@/lib/api/trpc';
// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ThankYou = lazy(() => import('./pages/public/ThankYou'));
const DynamicPage = lazy(() => import('./pages/public/DynamicPage'));
const DraftPreviewPage = lazy(() => import('./pages/public/DraftPreviewPage'));
const Doctors = lazy(() => import('./pages/public/Doctors'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const AccessRequest = lazy(() => import('./pages/AccessRequest'));
const OffersListPage = lazy(() => import('./pages/public/OffersListPage'));
const CampsListPage = lazy(() => import('./pages/public/CampsListPage'));
const DoctorDetailPage = lazy(() => import('./pages/public/DoctorDetailPage'));
const OfferDetailPage = lazy(() => import('./pages/public/OfferDetailPage'));
const CampDetailPage = lazy(() => import('./pages/public/CampDetailPage'));
const VisitingDoctors = lazy(() => import('./pages/public/VisitingDoctors'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
import PWAManager from './components/PWAManager';
import MetaPixel from './components/MetaPixel';
import OfflineIndicator from './components/OfflineIndicator';
import CookieConsentBanner from './components/CookieConsentBanner';
import PrivacyPolicyConsentBanner from './components/PrivacyPolicyConsentBanner';
const PatientPortalLogin = lazy(() => import('./pages/patient-portal/PatientPortalLogin'));
const PatientDashboard = lazy(() => import('./pages/patient-portal/PatientDashboard'));
const PatientHomePage = lazy(() => import('./pages/patient-portal/PatientHomePage'));
const PatientAppointmentsPage = lazy(
  () => import('./pages/patient-portal/PatientAppointmentsPage')
);
const PatientAppointmentDetailsPage = lazy(
  () => import('./pages/patient-portal/PatientAppointmentDetailsPage')
);
const PatientOffersPage = lazy(() => import('./pages/patient-portal/PatientOffersPage'));
const PatientCampsPage = lazy(() => import('./pages/patient-portal/PatientCampsPage'));
const PatientResultsPage = lazy(() => import('./pages/patient-portal/PatientResultsPage'));
const PatientResultDetailsPage = lazy(
  () => import('./pages/patient-portal/PatientResultDetailsPage')
);
const PatientProfilePage = lazy(() => import('./pages/patient-portal/PatientProfilePage'));
const PatientPortalLayout = lazy(() => import('./components/patient/PatientPortalLayout'));
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'));
const PrivacyPolicyChangelogPage = lazy(() => import('./pages/public/PrivacyPolicyChangelogPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const FeatureLockedPage = lazy(() => import('./pages/admin/shared/FeatureLockedPage'));
const ActivationPage = lazy(() => import('./pages/ActivationPage'));

// Prefetch critical pages for better performance
function PrefetchRoutes() {
  const [location] = useLocation();

  useEffect(() => {
    // Prefetch public pages when on home page
    if (location === '/') {
      import('./pages/public/Doctors');
      import('./pages/public/OffersListPage');
      import('./pages/public/CampsListPage');
    }

    // Prefetch admin dashboard and system showcase when on admin or system routes
    if (location.startsWith('/admin') || location.startsWith('/system')) {
      import('./pages/admin/system/SystemLandingPage');
      import('./pages/admin/AdminDashboard');
      import('./pages/admin/SettingsPage');
      import('./pages/admin/bookings/BookingsManagementPage');
      import('./pages/admin/reports/ReportsPage');
    }

    // Prefetch patient portal pages when on patient portal
    if (location.startsWith('/patient-portal')) {
      import('./pages/patient-portal/PatientHomePage');
      import('./pages/patient-portal/PatientAppointmentsPage');
      import('./pages/patient-portal/PatientOffersPage');
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

        {/* Patient Portal PWA Routes with Layout */}
        <Route path="/patient-portal">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }
          >
            <PatientPortalLayout>
              <Switch>
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
