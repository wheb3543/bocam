import { Suspense, type ReactNode } from 'react';
import type { AdminTab } from '@/hooks/layout/useAdminTabs';
import { renderAdminPage } from './AdminContentRoutes';
import AdminContentSkeleton from './AdminContentSkeleton';

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
      <Suspense fallback={<AdminContentSkeleton variant="workspace" />}>
        {renderContent ? renderContent(tab) : renderAdminPage(tab.href)}
      </Suspense>
    </div>
  );
}
