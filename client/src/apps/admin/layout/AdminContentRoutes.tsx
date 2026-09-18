import { lazy, type ReactNode } from 'react';
import { Redirect, Route, Switch } from 'wouter';
import DashboardLayout from './DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

const SystemLandingPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/pages/SystemLandingPage')
);
const AdminDashboard = lazy(
  () => import('@apps/admin/modules/10-system-settings/pages/AdminDashboardPage')
);
const OfflinePage = lazy(() => import('@/pages/OfflinePage'));
const SettingsPage = lazy(
  () => import('@apps/admin/modules/01-booking-scheduling/settings/BookingSettingsPage')
);
const ProfilePage = lazy(() => import('@apps/admin/modules/10-system-settings/pages/ProfilePage'));
const SupportTicketsPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/license/SupportTicketsPage')
);
const ManagementPage = lazy(
  () => import('@apps/admin/modules/01-booking-scheduling/pages/ManagementPage')
);
const ContentManagementPage = lazy(
  () => import('@apps/admin/modules/05-cms-portal/pages/CmsPagesManagerPage')
);
const MediaLibraryPage = lazy(
  () => import('@apps/admin/modules/05-cms-portal/media/MediaLibraryPage')
);
const UsersManagementPage = lazy(
  () => import('@apps/admin/modules/07-users-rbac/pages/StaffUsersPage')
);
const PublishingPage = lazy(
  () => import('@apps/admin/modules/04-marketing-publishing/publishing/PublishingApprovalPage')
);
const WhatsAppPage = lazy(() => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppPage'));
const WhatsAppOperationsCenter = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppOperationsCenter')
);
const WhatsAppAutomationCenter = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppAutomationCenter')
);
const WhatsAppCampaignCenter = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppCampaignCenter')
);
const WhatsAppGovernanceCenter = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppGovernanceCenter')
);
const WhatsAppAnalyticsCenter = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppAnalyticsCenter')
);
const WhatsAppLegacyTransitionPage = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppLegacyTransitionPage')
);
const WhatsAppIntegration = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppIntegration')
);
const WhatsAppLabResultsPage = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppLabResultsPage')
);
const MessagesPage = lazy(() => import('@apps/admin/modules/03-omni-inbox/pages/UnifiedInboxPage'));
const MessageSettingsPage = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/settings/MessageSettingsPage')
);
const MetaIntegrationSettingsPage = lazy(
  () => import('@apps/admin/modules/03-omni-inbox/settings/MetaIntegrationSettingsPage')
);
const ReportsPage = lazy(() => import('@apps/admin/modules/10-system-settings/pages/ReportsPage'));
const AnalyticsPage = lazy(
  () => import('@apps/admin/modules/01-booking-scheduling/reports/BookingAnalyticsPage')
);
const CampStatsPage = lazy(
  () => import('@apps/admin/modules/01-booking-scheduling/reports/CampStatsPage')
);
const LeadsManagementPage = lazy(
  () => import('@apps/admin/modules/04-marketing-publishing/leads/LeadsManagementPage')
);
const AppointmentsManagementPage = lazy(
  () => import('@apps/admin/modules/01-booking-scheduling/pages/AppointmentsManagementPage')
);
const OfferLeadsPage = lazy(
  () => import('@apps/admin/modules/01-booking-scheduling/offers/OfferLeadsPage')
);
const CampRegistrationsPage = lazy(
  () => import('@apps/admin/modules/01-booking-scheduling/camps/CampRegistrationsPage')
);
const CustomersPage = lazy(
  () => import('@apps/admin/modules/02-crm-patients/pages/PatientsDirectoryPage')
);
const TasksPage = lazy(
  () => import('@apps/admin/modules/06-tasks-projects/pages/TasksOverviewPage')
);
const MediaTeamPage = lazy(
  () => import('@apps/admin/modules/06-tasks-projects/teams/MediaTeamPage')
);
const FieldMarketingTeamPage = lazy(
  () => import('@apps/admin/modules/06-tasks-projects/teams/FieldMarketingTeamPage')
);
const CustomerServiceTeamPage = lazy(
  () => import('@apps/admin/modules/06-tasks-projects/teams/CustomerServiceTeamPage')
);
const ReviewApprovalPage = lazy(
  () => import('@apps/admin/modules/04-marketing-publishing/publishing/ReviewApprovalPage')
);
const CampaignsPage = lazy(
  () => import('@apps/admin/modules/04-marketing-publishing/pages/CampaignsPage')
);
const DigitalMarketingTasksPage = lazy(
  () => import('@apps/admin/modules/06-tasks-projects/pages/DigitalMarketingTasksPage')
);
const PatientResultsAdminPage = lazy(
  () => import('@apps/admin/modules/02-crm-patients/pages/PatientResultsAdminPage')
);
const PWAStatsPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/pages/PWAStatsPage')
);
const BIPage = lazy(() => import('@apps/admin/modules/10-system-settings/pages/BIPage'));
const TrackingSettingsPage = lazy(
  () => import('@apps/admin/modules/04-marketing-publishing/tracking/TrackingSettingsPage')
);
const AdvancedSettingsPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/pages/AdvancedSettingsPage')
);
const NotificationsPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/pages/NotificationsPage')
);
const UpdateManagementPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/updates/UpdateManagementPage')
);
const SystemStatusPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/pages/SystemHealthPage')
);
const BackupManagementPage = lazy(
  () => import('@apps/admin/modules/10-system-settings/backups/BackupPage')
);

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
