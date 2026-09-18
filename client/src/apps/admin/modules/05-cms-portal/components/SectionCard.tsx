/**
 * Section Card Component
 * مكون بطاقة القسم
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Layers, Lock, Unlock, Copy, Eye, History } from 'lucide-react';
import type { Section } from '../hooks/useSections';

interface SectionCardProps {
  section: Section;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onPreview?: () => void;
  onVersionHistory?: () => void;
}

/**
 * SectionCard - مكون بطاقة القسم
 */
export function SectionCard({
  section,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onVersionHistory,
}: SectionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{section.name}</CardTitle>
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
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">النوع:</span>
          <Badge variant="outline" className="text-xs">
            {section.type}
          </Badge>
          <Badge
            variant={
              section.status === 'published'
                ? 'default'
                : section.status === 'archived'
                  ? 'secondary'
                  : 'outline'
            }
            className="text-xs"
          >
            {section.status === 'published'
              ? 'منشور'
              : section.status === 'archived'
                ? 'مؤرشف'
                : 'مسودة'}
          </Badge>
        </div>
        {section.titleAr && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">العنوان (AR):</span>
            <span className="font-medium">{section.titleAr}</span>
          </div>
        )}
        {section.titleEn && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">العنوان (EN):</span>
            <span className="font-medium">{section.titleEn}</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          الصفحة ID: {section.pageId} | الترتيب: {section.sortOrder}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onPreview && (
          <Button onClick={onPreview} size="sm" variant="outline">
            <Eye className="h-4 w-4 ml-1" />
            معاينة
          </Button>
        )}
        {onDuplicate && (
          <Button onClick={onDuplicate} size="sm" variant="outline">
            <Copy className="h-4 w-4 ml-1" />
            نسخ
          </Button>
        )}
        {onVersionHistory && (
          <Button onClick={onVersionHistory} size="sm" variant="outline">
            <History className="h-4 w-4 ml-1" />
            تاريخ النسخ
          </Button>
        )}
        <Button onClick={onEdit} size="sm" variant="outline" className="flex-1">
          <Edit className="h-4 w-4 ml-1" />
          تعديل
        </Button>
        <Button onClick={onDelete} size="sm" variant="destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
