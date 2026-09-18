/**
 * بطاقة زر القسم مع إجراءات دورة CMS.
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Copy, Edit, History, Link, Lock, RotateCcw, Trash2, Unlock } from 'lucide-react';
import type { SectionButton } from '../hooks/useSectionButtons';

interface SectionButtonCardProps {
  button: SectionButton;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onRestore: () => void;
  onVersionHistory: () => void;
}

const statusLabel: Record<SectionButton['status'], string> = {
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
};

export function SectionButtonCard({
  button,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onRestore,
  onVersionHistory,
}: SectionButtonCardProps) {
  const isDeleted = Boolean(button.deletedAt);

  return (
    <Card className={isDeleted ? 'border-dashed opacity-75' : 'transition-shadow hover:shadow-lg'}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="truncate text-lg">{button.textAr}</CardTitle>
          <div className="flex flex-wrap justify-end gap-1">
            <Badge variant={button.status === 'published' ? 'default' : 'secondary'}>
              {statusLabel[button.status]}
            </Badge>
            <Badge variant={button.isActive === 'yes' ? 'outline' : 'secondary'}>
              {button.isActive === 'yes' ? (
                <Unlock className="ml-1 h-3 w-3" />
              ) : (
                <Lock className="ml-1 h-3 w-3" />
              )}
              {button.isActive === 'yes' ? 'نشط' : 'معطل'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Link className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-muted-foreground" dir="ltr">
            {button.link}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">النص (EN):</span>
          <span className="font-medium">{button.textEn}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {button.style}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            الترتيب: {button.sortOrder}
          </Badge>
          {isDeleted && (
            <Badge variant="destructive" className="text-xs">
              في المحذوفات
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {isDeleted ? (
          <Button onClick={onRestore} size="sm" variant="outline" className="flex-1">
            <RotateCcw className="ml-1 h-4 w-4" />
            استعادة كمسودة
          </Button>
        ) : (
          <>
            <Button onClick={onEdit} size="sm" variant="outline" className="flex-1">
              <Edit className="ml-1 h-4 w-4" />
              تعديل
            </Button>
            <Button onClick={onDuplicate} size="icon" variant="outline" title="إنشاء نسخة مسودة">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={onVersionHistory} size="icon" variant="outline" title="تاريخ النسخ">
              <History className="h-4 w-4" />
            </Button>
            {button.status !== 'archived' && (
              <Button onClick={onArchive} size="icon" variant="outline" title="أرشفة الزر">
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={onDelete} size="icon" variant="destructive" title="نقل إلى المحذوفات">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
