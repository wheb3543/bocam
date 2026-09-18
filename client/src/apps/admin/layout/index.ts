/**
 * BOCAM Admin Layout Exports
 * مكونات وتخطيط لوحة التحكم الإدارية
 */

export { default as AdminWorkspace } from './AdminWorkspace';
export { default as DashboardLayout } from './DashboardLayout';
export { default as DashboardShell } from './DashboardShell';
export { default as DashboardSidebar } from './DashboardSidebar';
export { default as DashboardSidebarV2 } from './DashboardSidebarV2';
export { default as TopNavbar } from './TopNavbar';
export { default as AdminTabs } from './AdminTabs';
export { default as AdminTabContent } from './AdminTabContent';
export { default as AdminPageHeader } from './AdminPageHeader';
export { default as AdminPageMenu } from './AdminPageMenu';
export { default as AdminSubsectionMenu } from './AdminSubsectionMenu';
export { default as AdminMainNavigation } from './AdminMainNavigation';
export { default as AdminTopNavigation } from './AdminTopNavigation';
export { default as AdminContentSkeleton } from './AdminContentSkeleton';
export { default as AdminContentRoutes } from './AdminContentRoutes';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as SidebarBadge } from './SidebarBadge';
export { default as PageLayout } from './PageLayout';
export * from './sidebarData';

// Hooks
export { useAdminTabs } from './hooks/useAdminTabs';
export { useSidebarNavigation } from './hooks/useSidebarNavigation';
export { useSidebarNotifications } from './hooks/useSidebarNotifications';
