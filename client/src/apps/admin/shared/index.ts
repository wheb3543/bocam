/**
 * BOCAM Admin Shared Modules & UI Components
 * المكونات المشتركة عبر جميع وحدات لوحة التحكم
 */

// Table
export * from './table/DataTableWrapper';
export * from './table/DataTableToolbar';
export * from './table/ColumnVisibility';
export * from './table/Pagination';
export * from './table/ResizableTable';
export * from './table/TableSkeleton';
export * from './table/DataTable';

// Dialogs
export * from './dialogs/ConfirmDialog';
export * from './dialogs/ConfirmDeleteDialog';
export * from './dialogs/ResponsiveDialog';

// Badges
export * from './badges/StatusBadge';
export * from './badges/SourceBadge';
export * from './badges/InlineStatusEditor';

// Feedback
export * from './feedback/ValidationErrorAlert';
export * from './feedback/FieldError';
export * from './feedback/FormErrorHandler';
export * from './feedback/PermissionHint';
export * from './feedback/FeatureGate';
export { default as FeatureLockedPage } from './feedback/FeatureLockedPage';
export * from './feedback/EmptyState';
export * from './feedback/CardSkeleton';
export * from './feedback/DashboardLayoutSkeleton';

// Filters & Actions
export * from './filters/EntityFilters';
export * from './filters/ActionButtons';
export { default as RowActionButtons } from './filters/RowActionButtons';
export * from './filters/FilterPresets';
export * from './filters/SavedFilters';
export * from './filters/BulkActionsManager';

// Hooks
export * from './hooks/useTableData';
export * from './hooks/useFilterUtils';
export * from './hooks/usePagination';
