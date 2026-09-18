import { lazy, type ReactNode } from 'react';
import { Redirect, Route, Switch } from 'wouter';
import DashboardLayout from './DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

const SystemLandingPage = lazy(() => import('@/pages/admin/system/SystemLandingPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const OfflinePage = lazy(() => import('@/pages/OfflinePage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/admin/ProfilePage'));
const SupportTicketsPage = lazy(() => import('@/pages/admin/SupportTicketsPage'));
const ManagementPage = lazy(() => import('@/pages/admin/ManagementPage'));
const ContentManagementPage = lazy(() => import('@/pages/admin/content/ContentManagementPage'));
const MediaLibraryPage = lazy(() => import('@/pages/admin/media/MediaLibraryPage'));
const UsersManagementPage = lazy(() => import('@/pages/admin/users/UsersManagementPage'));
const PublishingPage = lazy(() => import('@/pages/admin/content/PublishingPage'));
const WhatsAppPage = lazy(() => import('@/pages/admin/whatsapp/WhatsAppPage'));
const WhatsAppOperationsCenter = lazy(
  () => import('@/pages/admin/whatsapp/WhatsAppOperationsCenter')
);
const WhatsAppAutomationCenter = lazy(
  () => import('@/pages/admin/whatsapp/WhatsAppAutomationCenter')
);
const WhatsAppCampaignCenter = lazy(() => import('@/pages/admin/whatsapp/WhatsAppCampaignCenter'));
const WhatsAppGovernanceCenter = lazy(
  () => import('@/pages/admin/whatsapp/WhatsAppGovernanceCenter')
);
const WhatsAppAnalyticsCenter = lazy(
  () => import('@/pages/admin/whatsapp/WhatsAppAnalyticsCenter')
);
const WhatsAppLegacyTransitionPage = lazy(
  () => import('@/pages/admin/whatsapp/WhatsAppLegacyTransitionPage')
);
const WhatsAppIntegration = lazy(() => import('@/pages/admin/whatsapp/WhatsAppIntegration'));
const WhatsAppLabResultsPage = lazy(() => import('@/pages/admin/whatsapp/WhatsAppLabResultsPage'));
const MessagesPage = lazy(() => import('@/pages/admin/communications/MessagesPage'));
const MessageSettingsPage = lazy(() => import('@/pages/admin/MessageSettingsPage'));
const MetaIntegrationSettingsPage = lazy(
  () => import('@/pages/admin/communications/MetaIntegrationSettingsPage')
);
const ReportsPage = lazy(() => import('@/pages/admin/reports/ReportsPage'));
const AnalyticsPage = lazy(() => import('@/pages/admin/reports/AnalyticsPage'));
const CampStatsPage = lazy(() => import('@/pages/admin/reports/CampStatsPage'));
const LeadsManagementPage = lazy(() => import('@/pages/admin/bookings/LeadsManagementPage'));
const AppointmentsManagementPage = lazy(
  () => import('@/pages/admin/bookings/AppointmentsManagementPage')
);
const OfferLeadsPage = lazy(() => import('@/pages/admin/bookings/OfferLeadsPage'));
const CampRegistrationsPage = lazy(() => import('@/pages/admin/bookings/CampRegistrationsPage'));
const CustomersPage = lazy(() => import('@/pages/admin/bookings/CustomersPage'));
const TasksPage = lazy(() => import('@/pages/admin/bookings/TasksPage'));
const MediaTeamPage = lazy(() => import('@/pages/admin/teams/MediaTeamPage'));
const FieldMarketingTeamPage = lazy(() => import('@/pages/admin/teams/FieldMarketingTeamPage'));
const CustomerServiceTeamPage = lazy(() => import('@/pages/admin/teams/CustomerServiceTeamPage'));
const ReviewApprovalPage = lazy(() => import('@/pages/admin/campaigns/ReviewApprovalPage'));
const CampaignsPage = lazy(() => import('@/pages/admin/campaigns/CampaignsPage'));
const DigitalMarketingTasksPage = lazy(
  () => import('@/pages/admin/campaigns/DigitalMarketingTasksPage')
);
const PatientResultsAdminPage = lazy(() => import('@/pages/admin/shared/PatientResultsAdminPage'));
const PWAStatsPage = lazy(() => import('@/pages/admin/reports/PWAStatsPage'));
const BIPage = lazy(() => import('@/pages/admin/reports/BIPage'));
const TrackingSettingsPage = lazy(() => import('@/pages/admin/TrackingSettingsPage'));
const AdvancedSettingsPage = lazy(() => import('@/pages/admin/AdvancedSettingsPage'));
const NotificationsPage = lazy(() => import('@/pages/admin/NotificationsPage'));
const UpdateManagementPage = lazy(() => import('@/pages/admin/system/UpdateManagementPage'));
const SystemStatusPage = lazy(() => import('@/pages/admin/system/SystemStatusPage'));
const BackupManagementPage = lazy(() => import('@/pages/admin/system/BackupManagementPage'));

function AdminPageHeader({ title, children }: { title: string; children: React.ReactNode }) {
  return <DashboardLayout pageTitle={title}>{children}</DashboardLayout>;
}

export function renderAdminPage(path: string): ReactNode {
  const normalized = path === '/admin/' ? '/admin' : path;
  switch (normalized) {
    case '/system':
      return <SystemLandingPage />;
    case '/system/dashboard':
    case '/admin':
      return <AdminDashboard />;
    case '/admin/offline':
      return <OfflinePage />;
    case '/admin/profile':
      return <ProfilePage />;
    case '/admin/support':
      return <SupportTicketsPage />;
    case '/admin/management':
      return <ManagementPage />;
    case '/admin/notifications':
      return (
        <AdminPageHeader title="مركز الإشعارات">
          <NotificationsPage />
        </AdminPageHeader>
      );
    case '/admin/content/content':
      return <ContentManagementPage />;
    case '/admin/content/media-library':
      return <MediaLibraryPage />;
    case '/admin/users/users':
      return <UsersManagementPage />;
    case '/admin/content/publishing':
      return <PublishingPage />;
    case '/admin/whatsapp':
      return (
        <ProtectedRoute feature="whatsapp">
          <WhatsAppPage />
        </ProtectedRoute>
      );
    case '/admin/whatsapp/whatsapp-dashboard':
      return <Redirect to="/admin/whatsapp" />;
    case '/admin/whatsapp/templates':
      return <Redirect to="/admin/whatsapp/campaigns?tab=templates" />;
    case '/admin/whatsapp/connection':
      return <Redirect to="/admin/whatsapp/operations?tab=connection" />;
    case '/admin/whatsapp/analytics':
      return (
        <ProtectedRoute feature="whatsapp">
          <WhatsAppAnalyticsCenter />
        </ProtectedRoute>
      );
    case '/admin/whatsapp/operations':
      return (
        <ProtectedRoute feature="whatsapp">
          <WhatsAppOperationsCenter />
        </ProtectedRoute>
      );
    case '/admin/whatsapp/automation':
      return (
        <ProtectedRoute feature="whatsapp">
          <WhatsAppAutomationCenter />
        </ProtectedRoute>
      );
    case '/admin/whatsapp/campaigns':
      return (
        <ProtectedRoute feature="whatsapp">
          <WhatsAppCampaignCenter />
        </ProtectedRoute>
      );
    case '/admin/whatsapp/governance':
      return (
        <ProtectedRoute feature="whatsapp">
          <WhatsAppGovernanceCenter />
        </ProtectedRoute>
      );
    case '/admin/whatsapp/broadcast':
      return <Redirect to="/admin/whatsapp/campaigns?tab=campaigns" />;
    case '/admin/whatsapp/auto-reply':
      return <Redirect to="/admin/whatsapp/automation?tab=rules" />;
    case '/admin/whatsapp/compliance':
      return <Redirect to="/admin/whatsapp/governance?tab=compliance" />;
    case '/admin/whatsapp/appointments':
      return <Redirect to="/admin/whatsapp/automation?tab=notifications" />;
    case '/admin/whatsapp/integration':
      return (
        <ProtectedRoute feature="whatsapp">
          <WhatsAppIntegration />
        </ProtectedRoute>
      );
    case '/admin/whatsapp/account-health':
      return <Redirect to="/admin/whatsapp/operations?tab=health" />;
    case '/admin/whatsapp/phone-quality':
      return <Redirect to="/admin/whatsapp/operations?tab=quality" />;
    case '/admin/whatsapp/subscriptions':
      return <Redirect to="/admin/whatsapp/governance?tab=subscriptions" />;
    case '/admin/whatsapp/webhook-inspector':
      return <Redirect to="/admin/whatsapp/operations?tab=webhooks" />;
    case '/admin/whatsapp/costs':
      return <Redirect to="/admin/whatsapp/analytics?tab=costs" />;
    case '/admin/whatsapp/orders':
    case '/admin/whatsapp/products':
    case '/admin/whatsapp/referrals':
      return <WhatsAppLegacyTransitionPage />;
    case '/admin/whatsapp/lab-results':
      return <WhatsAppLabResultsPage />;
    case '/admin/communications/messages':
      return <MessagesPage />;
    case '/admin/communications/integration-settings':
    case '/admin/communications/meta-settings':
      return <MetaIntegrationSettingsPage />;
    case '/admin/message-settings':
      return <MessageSettingsPage />;
    case '/admin/reports/reports':
      return (
        <ProtectedRoute feature="reports">
          <ReportsPage />
        </ProtectedRoute>
      );
    case '/admin/campaigns/campaigns':
      return <CampaignsPage />;
    case '/admin/reports/analytics':
      return (
        <ProtectedRoute feature="reports">
          <AnalyticsPage />
        </ProtectedRoute>
      );
    case '/admin/reports/bi':
      return <BIPage />;
    case '/admin/tracking-settings':
      return <TrackingSettingsPage />;
    case '/admin/reports/camp-stats':
      return (
        <ProtectedRoute feature="camps">
          <CampStatsPage />
        </ProtectedRoute>
      );
    case '/admin/bookings':
      return <Redirect to="/admin/bookings/appointments" />;
    case '/admin/bookings/leads':
      return <LeadsManagementPage />;
    case '/admin/bookings/appointments':
      return <AppointmentsManagementPage />;
    case '/admin/bookings/offer-leads':
      return (
        <ProtectedRoute feature="offers">
          <OfferLeadsPage />
        </ProtectedRoute>
      );
    case '/admin/bookings/camp-registrations':
      return (
        <ProtectedRoute feature="camps">
          <CampRegistrationsPage />
        </ProtectedRoute>
      );
    case '/admin/bookings/customers':
      return <CustomersPage />;
    case '/admin/bookings/patient-results':
      return (
        <ProtectedRoute feature="patient_portal">
          <PatientResultsAdminPage />
        </ProtectedRoute>
      );
    case '/admin/bookings/tasks':
      return <TasksPage />;
    case '/admin/teams/digital-marketing':
      return <DigitalMarketingTasksPage />;
    case '/admin/teams/media':
      return <MediaTeamPage />;
    case '/admin/teams/field-marketing':
      return <FieldMarketingTeamPage />;
    case '/admin/teams/customer-service':
      return <CustomerServiceTeamPage />;
    case '/admin/campaigns/projects':
      return <CampaignsPage />;
    case '/admin/campaigns/review-approval':
      return <ReviewApprovalPage />;
    case '/admin/reports/pwa-stats':
      return <PWAStatsPage />;
    case '/admin/settings':
      return <SettingsPage />;
    case '/admin/system/updates':
      return <UpdateManagementPage />;
    case '/admin/system/status':
      return <SystemStatusPage />;
    case '/admin/system/backups':
      return <BackupManagementPage />;
    case '/admin/advanced-settings':
      return <AdvancedSettingsPage />;
    default:
      return null;
  }
}

export default function AdminContentRoutes() {
  return (
    <Switch>
      <Route path="/system">
        <SystemLandingPage />
      </Route>
      <Route path="/system/dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/offline" component={OfflinePage} />
      <Route path="/admin/profile" component={ProfilePage} />
      <Route path="/admin/support" component={SupportTicketsPage} />
      <Route path="/admin/management" component={ManagementPage} />
      <Route path="/admin/notifications">
        <AdminPageHeader title="مركز الإشعارات">
          <NotificationsPage />
        </AdminPageHeader>
      </Route>
      <Route path="/admin/content/content" component={ContentManagementPage} />
      <Route path="/admin/content/media-library" component={MediaLibraryPage} />
      <Route path="/admin/users/users" component={UsersManagementPage} />
      <Route path="/admin/content/publishing" component={PublishingPage} />
      <Route path="/admin/whatsapp">
        <ProtectedRoute feature="whatsapp">
          <WhatsAppPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/whatsapp/whatsapp-dashboard">
        <Redirect to="/admin/whatsapp" />
      </Route>
      <Route path="/admin/whatsapp/templates">
        <Redirect to="/admin/whatsapp/campaigns?tab=templates" />
      </Route>
      <Route path="/admin/whatsapp/connection">
        <Redirect to="/admin/whatsapp/operations?tab=connection" />
      </Route>
      <Route path="/admin/whatsapp/analytics">
        <ProtectedRoute feature="whatsapp">
          <WhatsAppAnalyticsCenter />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/whatsapp/operations">
        <ProtectedRoute feature="whatsapp">
          <WhatsAppOperationsCenter />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/whatsapp/automation">
        <ProtectedRoute feature="whatsapp">
          <WhatsAppAutomationCenter />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/whatsapp/campaigns">
        <ProtectedRoute feature="whatsapp">
          <WhatsAppCampaignCenter />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/whatsapp/governance">
        <ProtectedRoute feature="whatsapp">
          <WhatsAppGovernanceCenter />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/whatsapp/broadcast">
        <Redirect to="/admin/whatsapp/campaigns?tab=campaigns" />
      </Route>
      <Route path="/admin/whatsapp/auto-reply">
        <Redirect to="/admin/whatsapp/automation?tab=rules" />
      </Route>
      <Route path="/admin/whatsapp/compliance">
        <Redirect to="/admin/whatsapp/governance?tab=compliance" />
      </Route>
      <Route path="/admin/whatsapp/appointments">
        <Redirect to="/admin/whatsapp/automation?tab=notifications" />
      </Route>
      <Route path="/admin/whatsapp/integration">
        <ProtectedRoute feature="whatsapp">
          <WhatsAppIntegration />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/whatsapp/account-health">
        <Redirect to="/admin/whatsapp/operations?tab=health" />
      </Route>
      <Route path="/admin/whatsapp/phone-quality">
        <Redirect to="/admin/whatsapp/operations?tab=quality" />
      </Route>
      <Route path="/admin/whatsapp/subscriptions">
        <Redirect to="/admin/whatsapp/governance?tab=subscriptions" />
      </Route>
      <Route path="/admin/whatsapp/webhook-inspector">
        <Redirect to="/admin/whatsapp/operations?tab=webhooks" />
      </Route>
      <Route path="/admin/whatsapp/costs">
        <Redirect to="/admin/whatsapp/analytics?tab=costs" />
      </Route>
      <Route path="/admin/whatsapp/orders" component={WhatsAppLegacyTransitionPage} />
      <Route path="/admin/whatsapp/products" component={WhatsAppLegacyTransitionPage} />
      <Route path="/admin/whatsapp/referrals" component={WhatsAppLegacyTransitionPage} />
      <Route path="/admin/whatsapp/lab-results" component={WhatsAppLabResultsPage} />
      <Route path="/admin/communications/messages" component={MessagesPage} />
      <Route
        path="/admin/communications/integration-settings"
        component={MetaIntegrationSettingsPage}
      />
      <Route path="/admin/communications/meta-settings" component={MetaIntegrationSettingsPage} />
      <Route path="/admin/message-settings" component={MessageSettingsPage} />
      <Route path="/admin/reports/reports">
        <ProtectedRoute feature="reports">
          <ReportsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/campaigns/campaigns" component={CampaignsPage} />
      <Route path="/admin/reports/analytics">
        <ProtectedRoute feature="reports">
          <AnalyticsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/reports/bi" component={BIPage} />
      <Route path="/admin/tracking-settings" component={TrackingSettingsPage} />
      <Route path="/admin/reports/camp-stats">
        <ProtectedRoute feature="camps">
          <CampStatsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/bookings">
        <Redirect to="/admin/bookings/appointments" />
      </Route>
      <Route path="/admin/bookings/leads" component={LeadsManagementPage} />
      <Route path="/admin/bookings/appointments" component={AppointmentsManagementPage} />
      <Route path="/admin/bookings/offer-leads">
        <ProtectedRoute feature="offers">
          <OfferLeadsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/bookings/camp-registrations">
        <ProtectedRoute feature="camps">
          <CampRegistrationsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/bookings/customers" component={CustomersPage} />
      <Route path="/admin/bookings/patient-results">
        <ProtectedRoute feature="patient_portal">
          <PatientResultsAdminPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/bookings/tasks" component={TasksPage} />
      <Route path="/admin/teams/digital-marketing" component={DigitalMarketingTasksPage} />
      <Route path="/admin/teams/media" component={MediaTeamPage} />
      <Route path="/admin/teams/field-marketing" component={FieldMarketingTeamPage} />
      <Route path="/admin/teams/customer-service" component={CustomerServiceTeamPage} />
      <Route path="/admin/campaigns/projects" component={CampaignsPage} />
      <Route path="/admin/campaigns/review-approval" component={ReviewApprovalPage} />
      <Route path="/admin/reports/pwa-stats" component={PWAStatsPage} />
      <Route path="/admin/settings" component={SettingsPage} />
      <Route path="/admin/system/updates" component={UpdateManagementPage} />
      <Route path="/admin/system/status" component={SystemStatusPage} />
      <Route path="/admin/system/backups" component={BackupManagementPage} />
      <Route path="/admin/advanced-settings" component={AdvancedSettingsPage} />
    </Switch>
  );
}
