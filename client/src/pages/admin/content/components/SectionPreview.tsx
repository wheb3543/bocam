/**
 * Section Preview Component
 * مكون معاينة القسم
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Layers, FileText, Globe, Lock, Unlock } from 'lucide-react';

interface SectionPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: {
    id: number;
    pageId: number;
    name: string;
    titleAr: string | null;
    titleEn: string | null;
    subtitleAr: string | null;
    subtitleEn: string | null;
    type: string;
    sortOrder: number;
    isActive: 'yes' | 'no';
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

/**
 * SectionPreview - مكون معاينة القسم
 */
export function SectionPreview({ open, onOpenChange, section }: SectionPreviewProps) {
  if (!section) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            معاينة القسم
          </DialogTitle>
          <DialogDescription>معاينة تفاصيل القسم ومعلوماته</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات أساسية */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{section.name}</h3>
              <Badge variant={section.isActive === 'yes' ? 'default' : 'secondary'}>
                {section.isActive === 'yes' ? (
                  <>
                    <Unlock className="h-3 w-3 ml-1" />
                    نشط
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 ml-1" />
                    معطل
                  </>
                )}
              </Badge>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">النوع:</span>
                <Badge variant="outline">{section.type}</Badge>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">الصفحة ID:</span>
                <span className="font-medium">{section.pageId}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">الترتيب:</span>
                <span className="font-medium">{section.sortOrder}</span>
              </div>
            </div>
          </div>

          {/* العناوين */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">العناوين</h4>

            <div className="space-y-3">
              {section.titleAr && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">العنوان (AR)</div>
                  <div className="font-medium">{section.titleAr}</div>
                </div>
              )}

              {section.titleEn && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">العنوان (EN)</div>
                  <div className="font-medium">{section.titleEn}</div>
                </div>
              )}

              {section.subtitleAr && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">العنوان الفرعي (AR)</div>
                  <div className="font-medium">{section.subtitleAr}</div>
                </div>
              )}

              {section.subtitleEn && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">العنوان الفرعي (EN)</div>
                  <div className="font-medium">{section.subtitleEn}</div>
                </div>
              )}
            </div>
          </div>

          {/* معلومات النظام */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>معرف القسم:</span>
              <span className="font-mono">{section.id}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>تاريخ الإنشاء:</span>
              <span>{new Date(section.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>آخر تحديث:</span>
              <span>{new Date(section.updatedAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
