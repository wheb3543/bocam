import { useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { APP_LOGO, APP_TITLE, getLocalLoginUrl } from '@/const';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import AdminContentSkeleton from './AdminContentSkeleton';
import AdminTabs from './AdminTabs';
import DashboardSidebarV2 from './DashboardSidebarV2';
import AdminWorkspace from './AdminWorkspace';
import SystemLandingPage from '@/pages/admin/system/SystemLandingPage';
import { useAdminTabs } from '@/hooks/layout/useAdminTabs';

export default function DashboardShell() {
  const { loading, user } = useAuth();
  const [location, setLocation] = useLocation();
  const { tabs, activeTabId, closeTab, reorderTabs } = useAdminTabs(location);

  useEffect(() => {
    if (location === '/admin' || location === '/admin/') {
      setLocation('/system');
    }
  }, [location, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-20 w-auto object-contain" />
          <div className="text-center space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight">{APP_TITLE}</h1>
            <p className="text-sm text-muted-foreground">
              يرجى تسجيل الدخول للوصول إلى لوحة التحكم
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLocalLoginUrl();
            }}
            size="lg"
            className="w-full"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-hidden bg-muted/50 dark:bg-gray-950 flex"
      dir="rtl"
      data-testid="admin-shell"
    >
      <DashboardSidebarV2 currentPath={location} />
      <div className="flex h-screen flex-1 flex-col overflow-hidden min-w-0">
        <div className="shrink-0 z-20">
          <AdminTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onReorder={reorderTabs}
            onClose={(tab) => {
              const fallbackTab = closeTab(tab.id);
              if (tab.id === activeTabId) {
                if (fallbackTab) {
                  setLocation(fallbackTab.href);
                } else {
                  setLocation('/system');
                }
              }
            }}
          />
        </div>
        <main
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          data-testid="admin-content"
        >
          {location === '/system' || activeTabId === null || tabs.length === 0 ? (
            <SystemLandingPage onOpenTab={(href) => setLocation(href)} />
          ) : (
            <AdminWorkspace tabs={tabs} activeTabId={activeTabId} />
          )}
        </main>
      </div>
    </div>
  );
}
