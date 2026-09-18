/**
 * BOCAM Admin Layout Exports
 * مكونات وتخطيط لوحة التحكم الإدارية
 */

export { default as AdminWorkspace } from './AdminWorkspace';
export { default as DashboardLayout } from './DashboardLayout';
export { DashboardShell } from './DashboardShell';
export { DashboardSidebar } from './DashboardSidebar';
export { DashboardSidebarV2 } from './DashboardSidebarV2';
export { default as TopNavbar } from './TopNavbar';
export { AdminTabs } from './AdminTabs';
export { AdminTabContent } from './AdminTabContent';
export { AdminPageHeader } from './AdminPageHeader';
export { AdminPageMenu } from './AdminPageMenu';
export { AdminSubsectionMenu } from './AdminSubsectionMenu';
export { AdminMainNavigation } from './AdminMainNavigation';
export { AdminTopNavigation } from './AdminTopNavigation';
export { AdminContentSkeleton } from './AdminContentSkeleton';
export { AdminContentRoutes } from './AdminContentRoutes';
export { ProtectedRoute } from './ProtectedRoute';
export { SidebarBadge } from './SidebarBadge';
export { PageLayout } from './PageLayout';
export * from './sidebarData';

// Hooks
export { useAdminTabs } from './hooks/useAdminTabs';
export { useSidebarNavigation } from './hooks/useSidebarNavigation';
export { useSidebarNotifications } from './hooks/useSidebarNotifications';
