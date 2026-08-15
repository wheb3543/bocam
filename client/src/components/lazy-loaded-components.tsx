import React, { Suspense } from 'react';
import CardSkeleton from './CardSkeleton';

// Lazy Loading للمكونات الثقيلة
export const DashboardCharts = React.lazy(() => import('./dashboard/DashboardCharts'));
export const ChatWindow = React.lazy(() => import('./ChatWindow'));
export const DoctorsManagement = React.lazy(() => import('./DoctorsManagement'));
export const CampsManagement = React.lazy(() => import('./camp/CampsManagement'));
export const OffersManagement = React.lazy(() => import('./offer/OffersManagement'));
export const TasksSection = React.lazy(() => import('./TasksSection'));

// Component wrapper with loading state
export function withLazyLoading<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ReactNode
) {
  return function LazyComponentWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <CardSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Export lazy-loaded components with loading state
export const LazyDashboardCharts = withLazyLoading(DashboardCharts);
export const LazyChatWindow = withLazyLoading(ChatWindow);
export const LazyDoctorsManagement = withLazyLoading(DoctorsManagement);
export const LazyCampsManagement = withLazyLoading(CampsManagement);
export const LazyOffersManagement = withLazyLoading(OffersManagement);
export const LazyTasksSection = withLazyLoading(TasksSection);