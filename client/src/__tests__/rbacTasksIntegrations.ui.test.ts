import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('واجهة RBAC للمهام والتكاملات', () => {
  it('تخفي إجراءات مهام المتابعة بناءً على العرض والإنشاء والإسناد والإكمال والحذف', () => {
    const tasksSection = source('client/src/components/TasksSection.tsx');
    const taskCount = source('client/src/components/TaskCount.tsx');

    expect(tasksSection).toContain("const canViewTasks = can('tasks.view')");
    expect(tasksSection).toContain("const canCreateTasks = can('tasks.create')");
    expect(tasksSection).toContain("const canAssignTasks = can('tasks.assign')");
    expect(tasksSection).toContain("const canCompleteTasks = can('tasks.complete')");
    expect(tasksSection).toContain("const canDeleteTasks = can('tasks.delete')");
    expect(tasksSection).toContain('{canCreateTasks && (');
    expect(tasksSection).toMatch(/\{canDeleteTasks && \(?\s*<Button/);
    expect(tasksSection).toMatch(/\{canCompleteTasks && \(?\s*<SelectItem value="completed">/);
    expect(taskCount).toContain("const canViewTasks = can('tasks.view')");
    expect(taskCount).toContain('enabled: canViewTasks');
  });

  it('يحجب تعديل المهام عبر النموذج والقائمة وKanban عند غياب الصلاحيات المناسبة', () => {
    const page = source('client/src/pages/admin/campaigns/DigitalMarketingTasksPage.tsx');
    const form = source('client/src/pages/admin/campaigns/tasks/components/TaskFormDialog.tsx');
    const list = source('client/src/pages/admin/campaigns/tasks/components/TaskListView.tsx');
    const kanban = source('client/src/pages/admin/campaigns/tasks/components/KanbanColumn.tsx');

    expect(page).toContain("const canUpdateTasks = can('tasks.update')");
    expect(page).toContain('canCompleteTasks={canCompleteTasks}');
    expect(form).toContain('canAssignTasks: boolean');
    expect(form).toContain('canCompleteTasks: boolean');
    expect(list).toContain('onEditTask?:');
    expect(list).toContain('onDeleteTask?:');
    expect(kanban).toContain('canUpdateTasks: boolean');
    expect(kanban).toContain("status === 'completed' && !canCompleteTasks");
  });

  it('يفصل في واجهة التكاملات بين العرض والربط والفصل وإدارة بيانات الاعتماد', () => {
    const settings = source('client/src/pages/admin/communications/MetaIntegrationSettingsPage.tsx');
    const connections = source('client/src/pages/admin/communications/IntegrationConnectionsPanel.tsx');

    expect(settings).toContain("const canViewIntegrations = can('integrations.view')");
    expect(settings).toContain("const canManageCredentials = can('integrations.credentials.manage')");
    expect(settings).toMatch(/\{canManageCredentials && \(\s*<Card id="platform-connections"/);
    expect(connections).toContain("const canConnectIntegrations = can('integrations.connect')");
    expect(connections).toContain("const canDisconnectIntegrations = can('integrations.disconnect')");
    expect(connections).toContain('{canConnectIntegrations && (');
    expect(connections).toMatch(/\{canDisconnectIntegrations && \(?\s*<Button/);
  });

  it('يعرض تلميح وصول موحداً عند إخفاء إجراء حساس بسبب الصلاحيات', () => {
    const hint = source('client/src/components/PermissionHint.tsx');
    const tasks = source('client/src/components/TasksSection.tsx');
    const settings = source('client/src/pages/admin/communications/MetaIntegrationSettingsPage.tsx');

    expect(hint).toContain('TooltipContent');
    expect(hint).toContain('LockKeyhole');
    expect(tasks).toContain('label="إنشاء مقيّد"');
    expect(settings).toContain('label="بيانات الاعتماد مقيّدة"');
  });

  it('يحجب إجراءات الحملات والوسائط في الواجهة وفق صلاحياتها الدقيقة', () => {
    const campaigns = source('client/src/pages/admin/campaigns/CampaignsPage.tsx');
    const campaignTable = source('client/src/pages/admin/campaigns/components/CampaignTable.tsx');
    const media = source('client/src/pages/admin/media/MediaLibraryPage.tsx');

    expect(campaigns).toContain("const canViewCampaigns = can('campaigns.view')");
    expect(campaigns).toContain("const canCreateCampaigns = can('campaigns.create')");
    expect(campaigns).toContain("const canUpdateCampaigns = can('campaigns.update')");
    expect(campaigns).toContain("const canDeleteCampaigns = can('campaigns.delete')");
    expect(campaignTable).toContain('onEdit?:');
    expect(campaignTable).toContain('onDelete?:');

    expect(media).toContain("const canViewMedia = can('media.view')");
    expect(media).toContain("const canUploadMedia = can('media.upload')");
    expect(media).toContain("const canOrganizeMedia = can('media.organize')");
    expect(media).toContain("const canDownloadMedia = can('media.download')");
    expect(media).toContain("const canDeleteMedia = can('media.delete')");
    expect(media).toContain('draggable={canOrganizeMedia}');
  });

  it('يحرس واجهات الكتالوج والتسجيلات ويعرض سجل تدقيق الأدوار للمخولين فقط', () => {
    const offers = source('client/src/components/offer/OffersManagement.tsx');
    const camps = source('client/src/components/camp/CampsManagement.tsx');
    const campRegistrations = source('client/src/components/camp/CampRegistrationsManagement.tsx');
    const offerLeads = source('client/src/components/offer/OfferLeadsManagement.tsx');
    const roleAudit = source('client/src/pages/admin/users/components/RoleAuditPanel.tsx');
    const usersPage = source('client/src/pages/admin/users/UsersManagementPage.tsx');
    const rolesPanel = source('client/src/pages/admin/users/components/RolesPermissionsPanel.tsx');

    expect(offers).toContain("const canView = can('catalog.view')");
    expect(offers).toContain('trpc.offers.getAllAdmin.useQuery');
    expect(camps).toContain("const canView = can('catalog.view')");
    expect(campRegistrations).toContain("const canUpdate = can('registrations.update')");
    expect(campRegistrations).toContain('showExport={canExport}');
    expect(offerLeads).toContain("const canDelete = can('registrations.delete')");
    expect(offerLeads).toContain('visibleColumnOrder');
    expect(roleAudit).toContain("const canViewAudit = can('audit.view')");
    expect(roleAudit).toContain('enabled: canViewAudit');
    expect(roleAudit).toContain('permissionCount(log.newValue)');
    expect(roleAudit).toContain('setSelectedLog(log)');
    expect(roleAudit).toContain('تفاصيل سجل تدقيق الدور');
    expect(roleAudit).toContain('ملخص تغيير الصلاحيات');
    expect(roleAudit).toContain('parsePermissions');
    expect(usersPage).toContain("activeSection === 'role-audit'");
    expect(rolesPanel).toContain('sourceRoleId: copiedFromRoleId');
  });

  it('ينظم محرر الأدوار في مجموعات مطوية مع تذييل ثابت وتمرير داخل قائمة الصلاحيات', () => {
    const rolesPanel = source('client/src/pages/admin/users/components/RolesPermissionsPanel.tsx');
    const groups = source('shared/rolePermissions.ts');

    expect(rolesPanel).toContain('useState<Set<string>>(() => new Set())');
    expect(rolesPanel).toContain('toggleGroupExpanded');
    expect(rolesPanel).toContain('aria-expanded={isExpanded}');
    expect(rolesPanel).toContain('h-[min(92vh,760px)]');
    expect(rolesPanel).toContain('min-h-0 flex-1 space-y-3 overflow-y-auto');
    expect(rolesPanel).toContain('DialogFooter className="shrink-0 border-t');
    expect(rolesPanel).toContain('expandAllGroups');
    expect(rolesPanel).toContain('collapseAllGroups');
    expect(rolesPanel).toContain('toggleAllGroups');
    expect(rolesPanel).toContain('size="icon"');
    expect(rolesPanel).toContain('onClick={toggleAllGroups}');
    expect(rolesPanel).toContain('aria-pressed={areAllGroupsExpanded}');
    expect(rolesPanel).not.toContain('onClick={expandAllGroups}');
    expect(rolesPanel).not.toContain('onClick={collapseAllGroups}');
    expect(rolesPanel).toContain('showSelectedOnly');
    expect(rolesPanel).toContain('المحددة فقط ({selectedCount})');
    expect(rolesPanel).toContain('لا توجد صلاحيات محددة في هذا الدور حالياً.');
    expect(groups).toContain("key: 'notifications'");
    expect(groups).toContain("key: 'integrations'");
    expect(groups).toContain("label: 'الإعدادات والحوكمة والعمليات'");
  });

  it('يبسط حقل حالة الدور ويضعه بجوار اختيار الدور التشغيلي', () => {
    const rolesPanel = source('client/src/pages/admin/users/components/RolesPermissionsPanel.tsx');

    expect(rolesPanel).toContain('id="role-active"');
    expect(rolesPanel).toContain('h-11 shrink-0 items-center gap-2');
    expect(rolesPanel).toContain('الدور نشط');
    expect(rolesPanel).not.toContain('يمكن إسناد الأدوار النشطة فقط للمستخدمين.');
  });

  it('يوحد ارتفاع حقول نموذج تفاصيل الدور', () => {
    const rolesPanel = source('client/src/pages/admin/users/components/RolesPermissionsPanel.tsx');
    const uniformFieldHeights = rolesPanel.match(/className="h-11 transition-colors hover:border-primary\/50 hover:bg-primary\/\[0\.025\]"/g) || [];

    expect(uniformFieldHeights).toHaveLength(3);
    expect(rolesPanel).toContain('SelectTrigger className="h-11 flex-1 transition-colors');
    expect(rolesPanel).toContain('flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border px-3 transition-colors');
  });

  it('يوحد المسافات العمودية ويضيف حالات تمرير مرئية لحقول نموذج الدور', () => {
    const rolesPanel = source('client/src/pages/admin/users/components/RolesPermissionsPanel.tsx');

    expect(rolesPanel).toContain('gap-x-4 gap-y-5 sm:grid-cols-2');
    expect(rolesPanel).toContain('space-y-2.5');
    expect(rolesPanel).toContain('hover:border-primary/50 hover:bg-primary/[0.025]');
    expect(rolesPanel).toContain('h-11 transition-colors hover:border-primary/50 hover:bg-primary/[0.025]');
  });

  it('يعكس صلاحيات P0-A في واجهات العملاء ونتائج المرضى وسجل التدقيق والتنقل', () => {
    const customers = source('client/src/components/CustomerProfilesTab.tsx');
    const patientResults = source('client/src/pages/admin/shared/PatientResultsAdminPage.tsx');
    const auditLog = source('client/src/components/AuditLogSection.tsx');
    const sidebar = source('client/src/components/layout/DashboardSidebarV2.tsx');
    const sidebarData = source('client/src/components/layout/sidebarData.ts');

    expect(customers).toContain("const canViewCustomers = can('customers.view')");
    expect(customers).toContain("const canExportCustomers = can('customers.export')");
    expect(customers).toContain('enabled: !arePermissionsLoading && canViewCustomers');
    expect(customers).toContain('ملفات العملاء غير متاحة لهذا الدور');
    expect(patientResults).toContain("const canViewResults = can('patients.results.view')");
    expect(patientResults).toContain("const canCreateResults = can('patients.results.create')");
    expect(patientResults).toContain("const canUpdateResultStatus = can('patients.results.status.update')");
    expect(patientResults).toContain('نتائج المرضى غير متاحة لهذا الدور');
    expect(auditLog).toContain("const canViewAuditLog = can('audit.view')");
    expect(auditLog).toContain('enabled: !arePermissionsLoading && canViewAuditLog');
    expect(sidebarData).toContain("requiredPermission: 'customers.view'");
    expect(sidebar).toContain('item.requiredPermission && (arePermissionsLoading || !can(item.requiredPermission))');
  });

  it('يعكس صلاحيات P0-B في استيراد وتصدير المحتوى وتحليلات WhatsApp', () => {
    const contentImportExport = source('client/src/pages/admin/content/components/ContentImportExport.tsx');
    const contentPage = source('client/src/pages/admin/content/ContentManagementPage.tsx');
    const analytics = source('client/src/pages/admin/whatsapp/WhatsAppAnalytics.tsx');
    const dashboard = source('client/src/pages/admin/whatsapp/WhatsAppDashboard.tsx');
    const sseHook = source('client/src/hooks/integrations/useWhatsAppSSE.ts');

    expect(contentImportExport).toContain('canExport: boolean');
    expect(contentImportExport).toContain('canImport: boolean');
    expect(contentImportExport).toContain('canExportAudit: boolean');
    expect(contentImportExport).toContain('canExport ?');
    expect(contentImportExport).toContain('تصدير المحتوى مقيّد');
    expect(contentImportExport).toContain('استيراد المحتوى مقيّد');
    expect(contentPage).toContain("canExport={can('content.export')}");
    expect(contentPage).toContain("canImport={can('content.import')}");
    expect(analytics).toContain("const canViewAnalytics = can('reports.view')");
    expect(analytics).toContain("const canExportAnalytics = can('reports.export')");
    expect(analytics).toContain('enabled: !arePermissionsLoading && canViewAnalytics');
    expect(analytics).toContain('تحليلات WhatsApp غير متاحة لهذا الدور');
    expect(analytics).toContain('تحتاج إلى صلاحية تصدير التقارير');
    expect(dashboard).toContain("const canViewAnalytics = can('reports.view')");
    expect(sseHook).toContain('enabled?: boolean');
    expect(sseHook).toContain("useSSE(enabled ? '/api/whatsapp/stream/global' : null");
  });

  it('يعكس صلاحيات P1 في مراكز الإشعارات ومكتبة الوسائط ومحدد الملفات المشترك', () => {
    const notificationsPage = source('client/src/pages/admin/NotificationsPage.tsx');
    const notificationCenter = source('client/src/components/NotificationCenter.tsx');
    const notificationHooks = source('client/src/hooks/useNotifications.ts');
    const notificationPreferences = source(
      'client/src/components/notification/NotificationPreferencesCard.tsx'
    );
    const notificationSettings = source(
      'client/src/components/notification/SystemNotificationSettingsCard.tsx'
    );
    const mediaPicker = source('client/src/components/form/MediaPicker.tsx');
    const desktopSidebar = source('client/src/components/layout/sidebar/DesktopSidebar.tsx');
    const sidebarData = source('client/src/components/layout/sidebarData.ts');

    expect(notificationsPage).toContain("const canViewNotifications = can('notifications.view')");
    expect(notificationsPage).toContain("const canMarkNotifications = can('notifications.mark_read')");
    expect(notificationsPage).toContain("const canSendNotifications = can('notifications.send')");
    expect(notificationsPage).toContain('enabled: canViewNotifications');
    expect(notificationsPage).toContain('مركز الإشعارات مقيّد');
    expect(notificationCenter).toContain("const canViewNotifications = can('notifications.view')");
    expect(notificationCenter).toContain('enabled: canManagePreferences');
    expect(notificationHooks).toContain('enabled?: boolean');
    expect(notificationHooks).toContain('enabled: options?.enabled ?? true');
    expect(notificationPreferences).toContain("const canManagePreferences = can('notifications.preferences.manage')");
    expect(notificationSettings).toContain("const canManageNotifications = can('notifications.settings.manage')");
    expect(mediaPicker).toContain("const canViewMedia = can('media.view')");
    expect(mediaPicker).toContain("const canUploadMedia = can('media.upload')");
    expect(mediaPicker).toContain('enabled: open && activeTab === \'library\' && canViewMedia');
    expect(desktopSidebar).toContain("const canViewNotifications = can('notifications.view')");
    expect(desktopSidebar).toContain('useUnreadCount(canViewNotifications)');
    expect(sidebarData).toContain("requiredPermission: 'media.view'");
  });

  it('يعكس صلاحيات P0-C في واجهات اتصال Meta وسجل Webhooks دون عرض الحمولة الخام', () => {
    const webhookInspector = source('client/src/pages/admin/whatsapp/WhatsAppWebhookInspectorPage.tsx');
    const connection = source('client/src/pages/admin/whatsapp/WhatsAppConnectionPage.tsx');
    const accountHealth = source('client/src/pages/admin/whatsapp/WhatsAppAccountHealthPage.tsx');
    const phoneQuality = source('client/src/pages/admin/whatsapp/WhatsAppPhoneQualityPage.tsx');
    const subscriptions = source('client/src/pages/admin/whatsapp/WhatsAppUserSubscriptionsPage.tsx');
    const sidebarData = source('client/src/components/layout/sidebarData.ts');

    expect(webhookInspector).toContain("const canViewWebhookLogs = can('integrations.logs.view')");
    expect(webhookInspector).toContain("const canManageWebhooks = can('integrations.webhooks.manage')");
    expect(webhookInspector).toContain('enabled: canViewWebhookLogs');
    expect(webhookInspector).toContain('enabled: canViewWebhookLogs,');
    expect(webhookInspector).toContain('{!event.processed && canManageWebhooks && (');
    expect(webhookInspector).not.toContain('rawPayload');
    expect(connection).toContain("const canViewIntegrations = can('integrations.view')");
    expect(connection).toContain('enabled: canViewIntegrations');
    expect(connection).toContain('الوصول إلى التكامل مقيّد');
    expect(accountHealth).toContain("const canViewWebhookLogs = can('integrations.logs.view')");
    expect(phoneQuality).toContain("const canViewWebhookLogs = can('integrations.logs.view')");
    expect(subscriptions).toContain("const canViewWebhookLogs = can('integrations.logs.view')");
    expect(sidebarData).toContain("requiredPermission: 'integrations.logs.view'");
    expect(sidebarData).toContain("requiredPermission: 'integrations.view'");
  });
});
