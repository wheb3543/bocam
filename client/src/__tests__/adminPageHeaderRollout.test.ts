import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const dashboardLayoutSource = readSource('client/src/components/layout/DashboardLayout.tsx');
const topNavbarSource = readSource('client/src/components/layout/TopNavbar.tsx');
const messagesPageSource = readSource('client/src/pages/admin/communications/MessagesPage.tsx');
const commentContextsSource = readSource(
  'client/src/pages/admin/communications/MetaCommentContextsPanel.tsx'
);
const whatsAppPageSource = readSource('client/src/pages/admin/whatsapp/WhatsAppPage.tsx');
const chatAreaHeaderSource = readSource(
  'client/src/pages/admin/whatsapp/components/shared/ChatAreaHeader.tsx'
);
const chatInputSource = readSource('client/src/components/chat/ChatInput.tsx');
const chatHeaderSource = readSource('client/src/components/chat/ChatHeader.tsx');
const digitalMarketingTasksSource = readSource(
  'client/src/pages/admin/campaigns/DigitalMarketingTasksPage.tsx'
);
const digitalMarketingStatsSource = readSource(
  'client/src/pages/admin/campaigns/tasks/components/TaskStatsCards.tsx'
);
const digitalMarketingKanbanSource = readSource(
  'client/src/pages/admin/campaigns/tasks/components/KanbanColumn.tsx'
);

describe('مساحات العمل الإدارية دون بطاقة عنوان مكررة', () => {
  it('لا يرسم رأس عنوان مركزياً فوق محتوى الصفحة', () => {
    expect(dashboardLayoutSource).toContain("pageHeader?: 'standard' | 'none';");
    expect(dashboardLayoutSource).not.toContain("import AdminPageHeader from './AdminPageHeader';");
    expect(dashboardLayoutSource).not.toContain("pageHeader === 'standard' && pageTitle");
    expect(dashboardLayoutSource).toContain('{children}');
  });

  it('يعرض اسم الصفحة في الشريط الإداري العلوي عند توفره', () => {
    expect(dashboardLayoutSource).toContain('showPageTitle={Boolean(pageTitle)}');
    expect(topNavbarSource).toContain('showPageTitle?: boolean;');
    expect(topNavbarSource).toContain('{showPageTitle ? (');
  });

  it('يستبدل رأس صندوق البريد المكرر بتبويبات موحدة وإجراءات مضمنة', () => {
    expect(messagesPageSource).not.toContain("import AdminPageHeader from '@/components/layout/AdminPageHeader';");
    expect(messagesPageSource).not.toContain('aria-label="حالة وإجراءات صندوق البريد"');
    expect(messagesPageSource).toContain('function AccountStatusDots');
    expect(messagesPageSource).toContain('bg-emerald-500');
    expect(messagesPageSource).toContain('bg-amber-500');
    expect(messagesPageSource).toContain('تحديث الصندوق');
    expect(messagesPageSource).toContain('id="inbox-tabs"');
    expect(messagesPageSource).toContain('DropdownMenuCheckboxItem');
    expect(messagesPageSource).toContain('sgh-inbox-show-stats');
    expect(messagesPageSource).toContain('h-[calc(100dvh-4.25rem)]');
    expect(messagesPageSource).toContain('grid h-full min-h-0');
    expect(commentContextsSource).toContain('grid h-full min-h-0');
  });

  it('يحصر تمرير WhatsApp في منطقة المحادثات الداخلية', () => {
    expect(whatsAppPageSource).toContain('h-[calc(100dvh-4.25rem)] overflow-hidden');
    expect(whatsAppPageSource).toContain('flex h-full min-h-0 max-w-7xl flex-col');
    expect(whatsAppPageSource).toContain('min-h-0 flex-1 overflow-hidden');
    expect(whatsAppPageSource).not.toContain('min-h-screen bg-gradient-to-br');
    expect(whatsAppPageSource).not.toContain("height: 'calc(100vh - 8.75rem)'");
  });

  it('يضبط رأس ومحرر WhatsApp للهاتف دون تزاحم في الإجراءات', () => {
    expect(chatAreaHeaderSource).toContain('إجراءات المحادثة');
    expect(chatAreaHeaderSource).toContain('hidden items-center gap-1 sm:flex');
    expect(chatAreaHeaderSource).toContain('truncate text-sm font-bold');
    expect(chatInputSource).toContain('hidden h-10 w-10 shrink-0 sm:inline-flex');
    expect(chatInputSource).toContain('إجراءات إضافية');
    expect(chatInputSource).toContain('min-h-[44px]');
    expect(chatHeaderSource).toContain('hidden items-center justify-between');
  });

  it('يصحح مساحة مهام التسويق الرقمي الفعلية دون رأس مكرر', () => {
    expect(digitalMarketingTasksSource).not.toContain('AdminPageHeader');
    expect(digitalMarketingTasksSource).toContain('h-[calc(100dvh-4.25rem)]');
    expect(digitalMarketingTasksSource).toContain('actions={');
    expect(digitalMarketingTasksSource).toContain('min-h-0 flex-1 overflow-hidden');
    expect(digitalMarketingStatsSource).toContain('grid grid-cols-2 gap-2');
    expect(digitalMarketingKanbanSource).toContain('min-h-0 flex-1');
  });

  it.each([
    'client/src/pages/admin/AdminDashboard.tsx',
    'client/src/pages/admin/communications/MessagesPage.tsx',
    'client/src/pages/admin/content/PublishingPage.tsx',
    'client/src/pages/admin/media/MediaLibraryPage.tsx',
    'client/src/pages/admin/communications/MetaIntegrationSettingsPage.tsx',
    'client/src/pages/admin/campaigns/DigitalMarketingTasksPage.tsx',
    'client/src/pages/admin/reports/BIPage.tsx',
    'client/src/pages/admin/reports/CampStatsPage.tsx',
    'client/src/pages/admin/reports/PWAStatsPage.tsx',
    'client/src/pages/admin/teams/MediaTeamPage.tsx',
  ])('يحافظ على الرأس المتخصص في %s', (pagePath) => {
    expect(readSource(pagePath)).toContain('pageHeader="none"');
  });
});
