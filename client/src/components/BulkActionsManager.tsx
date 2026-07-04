import { useState } from 'react';
import { X, Loader2, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BaseAction {
  label: string;
  variant?: 'default' | 'outline' | 'destructive';
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface SimpleAction extends BaseAction {
  type: 'simple';
  onClick: () => void;
  isLoading?: boolean;
}

interface StatusUpdateAction extends BaseAction {
  type: 'status-update';
  statusOptions: { value: string; label: string }[];
  onStatusConfirm: (newStatus: string) => void;
  isLoading?: boolean;
  dialogTitle?: string;
  dialogDescription?: string;
}

interface DeleteAction extends BaseAction {
  type: 'delete';
  onConfirm: () => void;
  isLoading?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
}

interface ExportAction extends BaseAction {
  type: 'export';
  onExport: () => void;
  isLoading?: boolean;
  exportFormats?: { value: string; label: string }[];
}

type Action = SimpleAction | StatusUpdateAction | DeleteAction | ExportAction;

interface BulkActionsManagerProps {
  selectedCount: number;
  onClear: () => void;
  actions: Action[];
  showBar?: boolean;
  openDialog?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
  barClassName?: string;
  showCount?: boolean;
  countLabel?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  size?: 'compact' | 'normal' | 'large';
}

export default function BulkActionsManager({
  selectedCount,
  onClear,
  actions,
  showBar = true,
  openDialog: externalDialogOpen,
  onDialogOpenChange: externalDialogOpenChange,
  barClassName,
  showCount = true,
  countLabel,
  position = 'bottom',
  size = 'normal',
}: BulkActionsManagerProps) {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [currentStatusAction, setCurrentStatusAction] = useState<StatusUpdateAction | null>(null);
  const [currentDeleteAction, setCurrentDeleteAction] = useState<DeleteAction | null>(null);
  const [currentExportAction, setCurrentExportAction] = useState<ExportAction | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('');

  const statusDialogOpen = externalDialogOpen !== undefined ? externalDialogOpen : internalDialogOpen;
  const setStatusDialogOpen = externalDialogOpenChange || setInternalDialogOpen;

  const handleActionClick = (action: Action) => {
    if (action.type === 'status-update') {
      setCurrentStatusAction(action);
      setStatusDialogOpen(true);
    } else if (action.type === 'delete') {
      setCurrentDeleteAction(action);
      setDeleteDialogOpen(true);
    } else if (action.type === 'export') {
      setCurrentExportAction(action);
      if (action.exportFormats && action.exportFormats.length > 0) {
        setSelectedExportFormat(action.exportFormats[0].value);
        setExportDialogOpen(true);
      } else {
        action.onExport();
      }
    } else {
      action.onClick();
    }
  };

  const handleStatusConfirm = () => {
    if (newStatus && currentStatusAction) {
      currentStatusAction.onStatusConfirm(newStatus);
      setStatusDialogOpen(false);
      setNewStatus('');
      setCurrentStatusAction(null);
    }
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
    setNewStatus('');
    setCurrentStatusAction(null);
  };

  const handleDeleteConfirm = () => {
    if (currentDeleteAction) {
      currentDeleteAction.onConfirm();
      setDeleteDialogOpen(false);
      setCurrentDeleteAction(null);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setCurrentDeleteAction(null);
  };

  const handleExportConfirm = () => {
    if (currentExportAction && selectedExportFormat) {
      currentExportAction.onExport();
      setExportDialogOpen(false);
      setSelectedExportFormat('');
      setCurrentExportAction(null);
    }
  };

  const handleExportDialogClose = () => {
    setExportDialogOpen(false);
    setSelectedExportFormat('');
    setCurrentExportAction(null);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-6';
      case 'left':
        return 'left-6 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-6 top-1/2 -translate-y-1/2';
      default:
        return 'bottom-6';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'compact':
        return 'px-4 py-2 text-sm';
      case 'large':
        return 'px-8 py-6 text-lg';
      default:
        return 'px-6 py-4';
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Bulk Actions Bar */}
      {showBar && (
        <div className={`fixed ${getPositionClasses()} ${position === 'bottom' || position === 'top' ? 'left-1/2 -translate-x-1/2' : ''} z-50 animate-in slide-in-from-bottom-5`}>
          <div className={`bg-primary text-primary-foreground rounded-lg shadow-lg ${getSizeClasses()} flex items-center gap-4 ${barClassName}`}>
            {showCount && (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {selectedCount}
                  </Badge>
                  <span className="text-sm font-medium">
                    {countLabel || (selectedCount === 1 ? 'عنصر محدد' : 'عناصر محددة')}
                  </span>
                </div>

                <div className="h-6 w-px bg-primary-foreground/20" />
              </>
            )}

            <div className="flex gap-2">
              {actions.map((action, index) => {
                const isLoading = 
                  (action.type === 'status-update' && action.isLoading) ||
                  (action.type === 'delete' && action.isLoading) ||
                  (action.type === 'export' && action.isLoading) ||
                  (action.type === 'simple' && action.isLoading);
                
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'secondary'}
                    size="sm"
                    onClick={() => handleActionClick(action)}
                    className={`gap-2 ${action.className || ''}`}
                    disabled={isLoading || action.disabled}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {!action.icon && action.type === 'delete' && <Trash2 className="h-4 w-4" />}
                    {!action.icon && action.type === 'export' && <Download className="h-4 w-4" />}
                    {action.icon}
                    {action.label}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="hover:bg-primary-foreground/10 mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={handleStatusDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentStatusAction?.dialogTitle || 'تحديث الحالة المحددة'}</DialogTitle>
            <DialogDescription>
              {currentStatusAction?.dialogDescription || `سيتم تحديث حالة ${selectedCount} عنصر محدد. اختر الحالة الجديدة:`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة الجديدة" />
              </SelectTrigger>
              <SelectContent>
                {currentStatusAction?.statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleStatusDialogClose} disabled={currentStatusAction?.isLoading}>
              إلغاء
            </Button>
            <Button onClick={handleStatusConfirm} disabled={!newStatus || currentStatusAction?.isLoading}>
              {currentStatusAction?.isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تحديث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{currentDeleteAction?.confirmTitle || 'تأكيد الحذف'}</AlertDialogTitle>
            <AlertDialogDescription>
              {currentDeleteAction?.confirmDescription || `هل أنت متأكد من حذف ${selectedCount} عنصر محدد؟ هذا الإجراء لا يمكن التراجع عنه.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={currentDeleteAction?.isLoading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={currentDeleteAction?.isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {currentDeleteAction?.isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      {exportDialogOpen && (
        <Dialog open={exportDialogOpen} onOpenChange={handleExportDialogClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>تصدير البيانات</DialogTitle>
              <DialogDescription>
                سيتم تصدير {selectedCount} عنصر محدد. اختر صيغة التصدير:
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedExportFormat} onValueChange={setSelectedExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر صيغة التصدير" />
                </SelectTrigger>
                <SelectContent>
                  {currentExportAction?.exportFormats?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleExportDialogClose} disabled={currentExportAction?.isLoading}>
                إلغاء
              </Button>
              <Button onClick={handleExportConfirm} disabled={!selectedExportFormat || currentExportAction?.isLoading}>
                {currentExportAction?.isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تصدير
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
