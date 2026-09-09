import type { ReactNode } from 'react';
import type { AdminTab } from '@/hooks/layout/useAdminTabs';
import { renderAdminPage } from './AdminContentRoutes';

interface AdminTabContentProps {
  tab: AdminTab;
  active: boolean;
  renderContent?: (tab: AdminTab) => ReactNode;
}

export default function AdminTabContent({ tab, active, renderContent }: AdminTabContentProps) {
  return (
    <div
      data-testid={`admin-tab-content-${tab.id}`}
      hidden={!active}
      aria-hidden={!active}
      className="min-w-0 flex-1"
    >
      {renderContent ? renderContent(tab) : renderAdminPage(tab.href)}
    </div>
  );
}
