import { Toaster } from "@/components/ui/sonner";
import { useEffect, lazy, Suspense, useState } from "react";
import { initializeTracking } from "./lib/tracking/tracking";
import { TooltipProvider } from "@/components/ui/tooltip";
const NotFound = lazy(() => import("@/pages/NotFound"));
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardShell from "@/components/layout/DashboardShell";
import { trpc } from "@/lib/api/trpc";
import { UpdateStatusBadge } from "@/components/update/UpdateStatusBadge";
import { UpdateProgressModal } from "@/components/update/UpdateProgressModal";
import { MandatoryUpdateModal } from "@/components/update/MandatoryUpdateModal";
import { OptionalUpdateBanner } from "@/components/update/OptionalUpdateBanner";
import { useUpdateChecker } from "@/hooks/integrations/useUpdateChecker";
// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const HomePage = lazy(() => import("./pages/public/HomePage"));
const ThankYou = lazy(() => import("./pages/public/ThankYou"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const DoctorAppointments = lazy(() => import("./pages/admin/bookings/DoctorAppointments"));
const Doctors = lazy(() => import("./pages/public/Doctors"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const AccessRequest = lazy(() => import("./pages/AccessRequest"));
const OffersListPage = lazy(() => import("./pages/public/OffersListPage"));
const CampsListPage = lazy(() => import("./pages/public/CampsListPage"));
const DoctorDetailPage = lazy(() => import("./pages/public/DoctorDetailPage"));
const OfferDetailPage = lazy(() => import("./pages/public/OfferDetailPage"));
const CampDetailPage = lazy(() => import("./pages/public/CampDetailPage"));
const VisitingDoctors = lazy(() => import("./pages/public/VisitingDoctors"));
const OfflinePage = lazy(() => import("./pages/OfflinePage"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/admin/ProfilePage"));
const ManagementPage = lazy(() => import("./pages/admin/ManagementPage"));
const ContentManagementPage = lazy(() => import("./pages/admin/content/ContentManagementPage"));
const UsersManagementPage = lazy(() => import("./pages/admin/users/UsersManagementPage"));
const PublishingPage = lazy(() => import("./pages/admin/content/PublishingPage"));
const WhatsAppPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppPage"));
const WhatsAppTemplatesPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppTemplatesPage"));
const WhatsAppConnectionPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppConnectionPage"));
const WhatsAppDashboard = lazy(() => import("./pages/admin/whatsapp/WhatsAppDashboard"));
const WhatsAppAnalytics = lazy(() => import("./pages/admin/whatsapp/WhatsAppAnalytics"));
const WhatsAppBroadcast = lazy(() => import("./pages/admin/whatsapp/WhatsAppBroadcast"));
const WhatsAppAutoReply = lazy(() => import("./pages/admin/whatsapp/WhatsAppAutoReply"));
const WhatsAppCompliance = lazy(() => import("./pages/admin/whatsapp/WhatsAppCompliance"));
const WhatsAppAppointments = lazy(() => import("./pages/admin/whatsapp/WhatsAppAppointments"));
const WhatsAppIntegration = lazy(() => import("./pages/admin/whatsapp/WhatsAppIntegration"));
const WhatsAppAccountHealthPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppAccountHealthPage"));
const WhatsAppPhoneQualityPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppPhoneQualityPage"));
const WhatsAppUserSubscriptionsPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppUserSubscriptionsPage"));
const WhatsAppWebhookInspectorPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppWebhookInspectorPage"));
const WhatsAppCostsPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppCostsPage"));
const WhatsAppOrdersPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppOrdersPage"));
const WhatsAppProductsPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppProductsPage"));
const WhatsAppReferralsPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppReferralsPage"));
const WhatsAppLabResultsPage = lazy(() => import("./pages/admin/whatsapp/WhatsAppLabResultsPage"));
const MessagesPage = lazy(() => import("./pages/admin/communications/MessagesPage"));
const ReportsPage = lazy(() => import("./pages/admin/reports/ReportsPage"));
const ReportsPageNew = lazy(() => import("./pages/admin/reports/ReportsPage"));
const AnalyticsPage = lazy(() => import("./pages/admin/reports/AnalyticsPage"));
const CampStatsPage = lazy(() => import("./pages/admin/reports/CampStatsPage"));
const BookingsManagementPage = lazy(() => import("./pages/admin/bookings/BookingsManagementPage"));
const LeadsManagementPage = lazy(() => import("./pages/admin/bookings/LeadsManagementPage"));
const AppointmentsManagementPage = lazy(() => import("./pages/admin/bookings/AppointmentsManagementPage"));
const OfferLeadsPage = lazy(() => import("./pages/admin/bookings/OfferLeadsPage"));
const CampRegistrationsPage = lazy(() => import("./pages/admin/bookings/CampRegistrationsPage"));
const CustomersPage = lazy(() => import("./pages/admin/bookings/CustomersPage"));
const TasksPage = lazy(() => import("./pages/admin/bookings/TasksPage"));
import PWAManager from "./components/PWAManager";
import MetaPixel from "./components/MetaPixel";
import OfflineIndicator from "./components/OfflineIndicator";
import CookieConsentBanner from "./components/CookieConsentBanner";
const DigitalMarketingTeamPage = lazy(() => import("./pages/admin/teams/DigitalMarketingTeamPage"));
const MediaTeamPage = lazy(() => import("./pages/admin/teams/MediaTeamPage"));
const FieldMarketingTeamPage = lazy(() => import("./pages/admin/teams/FieldMarketingTeamPage"));
const CustomerServiceTeamPage = lazy(() => import("./pages/admin/teams/CustomerServiceTeamPage"));
const ProjectsManagementPage = lazy(() => import("./pages/admin/campaigns/ProjectsManagementPage"));
const ReviewApprovalPage = lazy(() => import("./pages/admin/campaigns/ReviewApprovalPage"));
const CampaignsPage = lazy(() => import("./pages/admin/campaigns/CampaignsPage"));
const DigitalMarketingTasksPage = lazy(() => import("./pages/admin/campaigns/DigitalMarketingTasksPage"));
const PatientPortalLogin = lazy(() => import("./pages/patient-portal/PatientPortalLogin"));
const PatientDashboard = lazy(() => import("./pages/patient-portal/PatientDashboard"));
const PatientHomePage = lazy(() => import("./pages/patient-portal/PatientHomePage"));
const PatientAppointmentsPage = lazy(() => import("./pages/patient-portal/PatientAppointmentsPage"));
const PatientAppointmentDetailsPage = lazy(() => import("./pages/patient-portal/PatientAppointmentDetailsPage"));
const PatientOffersPage = lazy(() => import("./pages/patient-portal/PatientOffersPage"));
const PatientCampsPage = lazy(() => import("./pages/patient-portal/PatientCampsPage"));
const PatientResultsPage = lazy(() => import("./pages/patient-portal/PatientResultsPage"));
const PatientResultDetailsPage = lazy(() => import("./pages/patient-portal/PatientResultDetailsPage"));
const PatientResultsAdminPage = lazy(() => import("./pages/admin/shared/PatientResultsAdminPage"));
const PatientProfilePage = lazy(() => import("./pages/patient-portal/PatientProfilePage"));
const PatientPortalLayout = lazy(() => import("./components/patient/PatientPortalLayout"));
const MessageSettingsPage = lazy(() => import("./pages/admin/MessageSettingsPage"));
const PWAStatsPage = lazy(() => import("./pages/admin/reports/PWAStatsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/public/PrivacyPolicyPage"));
const BIPage = lazy(() => import("./pages/admin/reports/BIPage"));
const TrackingSettingsPage = lazy(() => import("./pages/admin/TrackingSettingsPage"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const FeatureLockedPage = lazy(() => import("./pages/admin/shared/FeatureLockedPage"));
const ActivationPage = lazy(() => import("./pages/ActivationPage"));
const UpdateManagementPage = lazy(() => import("./pages/admin/system/UpdateManagementPage"));
const SystemStatusPage = lazy(() => import("./pages/admin/system/SystemStatusPage"));
const BackupManagementPage = lazy(() => import("./pages/admin/system/BackupManagementPage"));
const AdvancedSettingsPage = lazy(() => import("./pages/admin/AdvancedSettingsPage"));
import ProtectedRoute from "@/components/layout/ProtectedRoute";


function Router() {
  const [location] = useLocation();
  const { data: licenseCheck, isLoading: checkingLicense } = trpc.license.checkLicenseExists.useQuery();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // TEMPORARY: Skip activation page for deployment until central server is ready
  // Show activation page if license doesn't exist (unless on activation page)
  // if (!checkingLicense && !licenseCheck?.exists && location !== "/activation") {
  //   return (
  //     <Suspense fallback={
  //       <div className="flex items-center justify-center min-h-screen">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //       </div>
  //     }>
  //       <ActivationPage />
  //     </Suspense>
  //   );
  // }
  
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <Switch>
      <Route path={"/activation"} component={ActivationPage} />
      <Route path={"/"} component={HomePage} />
      <Route path={"/doctors"} component={Doctors} />
      <Route path={"/visiting-doctors"} component={VisitingDoctors} />

      <Route path={"/doctors/:slug"} component={DoctorDetailPage} />
      <Route path={"/offers"} component={OffersListPage} />
      <Route path={"/offers/:slug"} component={OfferDetailPage} />
      <Route path={"/camps"} component={CampsListPage} />
      <Route path={"/camps/:slug"} component={CampDetailPage} />
      <Route path={"/thank-you"} component={ThankYou} />
      <Route path={"/privacy-policy"} component={PrivacyPolicyPage} />
      <Route path={"/unauthorized"} component={Unauthorized} />
      <Route path={"/access-request"} component={AccessRequest} />
      <Route path={"/admin-login"} component={AdminLogin} />
      <Route path="/feature-locked/:feature">
        <FeatureLockedPage />
      </Route>

      {/* Admin routes with persistent sidebar */}
      <Route path="/admin">
        <DashboardShell>
          <AdminDashboard />
        </DashboardShell>
      </Route>
      <Route path="/admin/*">
        <DashboardShell>
          <Switch>
            <Route path={"/admin/offline"} component={OfflinePage} />
            <Route path={"/admin/profile"} component={ProfilePage} />
            <Route path={"/admin/management"} component={ManagementPage} />
            <Route path={"/admin/content/content"} component={ContentManagementPage} />
            <Route path={"/admin/users/users"} component={UsersManagementPage} />
            <Route path={"/admin/content/publishing"} component={PublishingPage} />
            <Route path={"/admin/whatsapp"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/whatsapp-dashboard"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppDashboard />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/templates"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppTemplatesPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/connection"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppConnectionPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/analytics"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppAnalytics />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/broadcast"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppBroadcast />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/auto-reply"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppAutoReply />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/compliance"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppCompliance />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/appointments"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppAppointments />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/integration"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppIntegration />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/account-health"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppAccountHealthPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/phone-quality"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppPhoneQualityPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/subscriptions"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppUserSubscriptionsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/webhook-inspector"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppWebhookInspectorPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/costs"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppCostsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/orders"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppOrdersPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/products"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppProductsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/referrals"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppReferralsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/whatsapp/lab-results"}>
              <ProtectedRoute feature="whatsapp">
                <WhatsAppLabResultsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/communications/messages"} component={MessagesPage} />
            <Route path={"/admin/message-settings"} component={MessageSettingsPage} />
            <Route path={"/admin/reports/reports"}>
              <ProtectedRoute feature="reports">
                <ReportsPageNew />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/campaigns/campaigns"} component={CampaignsPage} />
            <Route path={"/admin/reports/analytics"}>
              <ProtectedRoute feature="reports">
                <AnalyticsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/reports/bi"} component={BIPage} />
            <Route path={"/admin/tracking-settings"} component={TrackingSettingsPage} />
            <Route path={"/admin/reports/camp-stats"}>
              <ProtectedRoute feature="camps">
                <CampStatsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/bookings"} component={BookingsManagementPage} />
            <Route path={"/admin/bookings/leads"} component={LeadsManagementPage} />
            <Route path={"/admin/bookings/appointments"} component={AppointmentsManagementPage} />
            <Route path={"/admin/bookings/offer-leads"}>
              <ProtectedRoute feature="offers">
                <OfferLeadsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/bookings/camp-registrations"}>
              <ProtectedRoute feature="camps">
                <CampRegistrationsPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/bookings/customers"} component={CustomersPage} />
            <Route path={"/admin/bookings/patient-results"}>
              <ProtectedRoute feature="patient_portal">
                <PatientResultsAdminPage />
              </ProtectedRoute>
            </Route>
            <Route path={"/admin/bookings/tasks"} component={TasksPage} />
            <Route path={"/admin/teams/digital-marketing"} component={DigitalMarketingTasksPage} />
            <Route path={"/admin/teams/media"} component={MediaTeamPage} />
            <Route path={"/admin/teams/field-marketing"} component={FieldMarketingTeamPage} />
            <Route path={"/admin/teams/customer-service"} component={CustomerServiceTeamPage} />
            <Route path={"/admin/campaigns/projects"} component={CampaignsPage} />
            <Route path={"/admin/campaigns/review-approval"} component={ReviewApprovalPage} />
            <Route path={"/admin/reports/pwa-stats"} component={PWAStatsPage} />
            <Route path={"/admin/settings"} component={SettingsPage} />
            <Route path={"/admin/system/updates"} component={UpdateManagementPage} />
            <Route path={"/admin/system/status"} component={SystemStatusPage} />
            <Route path={"/admin/system/backups"} component={BackupManagementPage} />
            <Route path={"/admin/advanced-settings"} component={AdvancedSettingsPage} />
          </Switch>
        </DashboardShell>
      </Route>


      <Route path={"/patient-portal/login"} component={PatientPortalLogin} />
      <Route path={"/patient-portal/admin"} component={PatientDashboard} />

      {/* Patient Portal PWA Routes with Layout */}
      <Route path="/patient-portal">
        <PatientPortalLayout>
          <Switch>
            <Route path="/patient-portal/home" component={PatientHomePage} />
            <Route path="/patient-portal/appointments" component={PatientAppointmentsPage} />
            <Route path="/patient-portal/appointments/:id" component={PatientAppointmentDetailsPage} />
            <Route path="/patient-portal/offers" component={PatientOffersPage} />
            <Route path="/patient-portal/camps" component={PatientCampsPage} />
            <Route path="/patient-portal/results" component={PatientResultsPage} />
            <Route path="/patient-portal/results/:id" component={PatientResultDetailsPage} />
            <Route path="/patient-portal/profile" component={PatientProfilePage} />
          </Switch>
        </PatientPortalLayout>
      </Route>
      <Route path={"/offline"} component={OfflinePage} />
      <Route path={"/admin/settings"} component={SettingsPage} />
      <Route path={"/404"} component={NotFound} />
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
  // Initialize UTM tracking on mount
  useEffect(() => {
    initializeTracking();
  }, []);

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
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <PWAManager />
          <OfflineIndicator />
          <CookieConsentBanner />
          <MetaPixel />
          <OptionalUpdateBanner />
          <UpdateProgressModal open={showProgressModal} onOpenChange={setShowProgressModal} />
          <MandatoryUpdateModal open={showMandatoryModal} onOpenChange={setShowMandatoryModal} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
