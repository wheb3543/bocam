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
    expect(tasksSection).toContain('{canDeleteTasks && <Button');
    expect(tasksSection).toContain('{canCompleteTasks && <SelectItem value="completed">');
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
    expect(settings).toContain('{canManageCredentials && <Card id="platform-connections"');
    expect(connections).toContain("const canConnectIntegrations = can('integrations.connect')");
    expect(connections).toContain("const canDisconnectIntegrations = can('integrations.disconnect')");
    expect(connections).toContain('{canConnectIntegrations && (');
    expect(connections).toContain('{canDisconnectIntegrations && <Button');
  });
});
