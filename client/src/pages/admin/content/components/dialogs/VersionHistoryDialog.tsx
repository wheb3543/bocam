/**
 * Version History Dialog Component
 * مكون حوار تاريخ النسخ للتراجع والإعادة
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Trash2, Clock, User, GitCompareArrows } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useContentVersions } from '../../hooks/useContentVersions';

interface Version {
  id: number;
  entityType: 'text' | 'image' | 'color' | 'seo';
  entityId: number;
  data: Record<string, unknown>;
  createdAt: Date;
  createdBy: string | null;
  userId: number;
  versionNumber: number;
  reason?: string;
}

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'text' | 'image' | 'color' | 'seo';
  entityId: number;
  onRestore: (data: Record<string, unknown>) => void;
}

/**
 * VersionHistoryDialog - مكون حوار تاريخ النسخ
 */
export function VersionHistoryDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  onRestore,
}: VersionHistoryDialogProps) {
  const { getVersions, deleteVersion } = useContentVersions();
  const { data: versions, isLoading } = getVersions({ entityType, entityId });
  const [compareVersions, setCompareVersions] = useState<{ v1: Version; v2: Version } | null>(null);

  const handleRestore = (version: Version) => {
    onRestore(version.data);
    toast.success('تم استعادة النسخة بنجاح');
    onOpenChange(false);
  };

  const handleDelete = async (versionId: number) => {
    try {
      await deleteVersion.mutateAsync({ versionId });
      toast.success('تم حذف النسخة بنجاح');
    } catch {
      toast.error('فشل في حذف النسخة');
    }
  };

  const handleCompare = (v1: Version, v2: Version) => {
    setCompareVersions({ v1, v2 });
  };

  const renderDiff = (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    allKeys.forEach((key) => {
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      if (val1 !== val2) {
        diff[key] = {
          old: val1,
          new: val2,
        };
      }
    });

    return diff;
  };

  const getEntityTypeLabel = (type: string) => {
    const labels = {
      text: 'نص',
      image: 'صورة',
      color: 'لون',
      seo: 'إعدادات SEO',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            تاريخ النسخ - {getEntityTypeLabel(entityType)}
          </DialogTitle>
          <DialogDescription>عرض جميع النسخ المحفوظة والتراجع إلى نسخة سابقة</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {compareVersions ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">مقارنة النسخ</h3>
                <Button size="sm" variant="outline" onClick={() => setCompareVersions(null)}>
                  إغلاق المقارنة
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">نسخة {compareVersions.v1.versionNumber}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(compareVersions.v1.createdAt).toLocaleString('ar-SA')}
                  </p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(compareVersions.v1.data, null, 2)}
                  </pre>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">نسخة {compareVersions.v2?.versionNumber}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {compareVersions.v2
                      ? new Date(compareVersions.v2.createdAt).toLocaleString('ar-SA')
                      : 'القيمة الحالية'}
                  </p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                    {compareVersions.v2
                      ? JSON.stringify(compareVersions.v2.data, null, 2)
                      : 'غير متوفر'}
                  </pre>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">الاختلافات</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                  {JSON.stringify(
                    renderDiff(compareVersions.v1.data, compareVersions.v2?.data),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : !versions || versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <History className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">لا توجد نسخ محفوظة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version: Version) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">نسخة {version.versionNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString('ar-SA')}
                        </span>
                      </div>
                      {version.reason && (
                        <p className="text-sm text-muted-foreground mb-2">
                          السبب: {version.reason}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(version.createdAt).toLocaleString('ar-SA')}
                        </div>
                        {version.userId && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            المستخدم: {version.userId}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(version)}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        استعادة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleCompare(version, versions[versions.indexOf(version) - 1])
                        }
                        disabled={!versions[versions.indexOf(version) - 1]}
                        className="flex items-center gap-1"
                      >
                        <GitCompareArrows className="h-4 w-4" />
                        مقارنة
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(version.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
