import type { ReactNode } from 'react';
import type { AdminTab } from '@/hooks/layout/useAdminTabs';
import AdminTabContent from './AdminTabContent';

interface AdminWorkspaceProps {
  tabs: AdminTab[];
  activeTabId: string | null;
  renderContent?: (tab: AdminTab) => ReactNode;
}

export default function AdminWorkspace({ tabs, activeTabId, renderContent }: AdminWorkspaceProps) {
  return (
    <div className="min-w-0 flex-1" data-testid="admin-workspace">
      {tabs.map((tab) => (
        <AdminTabContent
          key={tab.id}
          tab={tab}
          active={tab.id === activeTabId}
          renderContent={renderContent}
        />
      ))}
    </div>
  );
}
