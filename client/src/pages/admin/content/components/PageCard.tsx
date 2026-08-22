/**
 * Page Card Component
 * مكون بطاقة الصفحة
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  FileText,
  Globe,
  Lock,
  Unlock,
  Eye,
  Copy,
  Settings,
  History,
} from 'lucide-react';
import type { Page } from '../hooks/usePages';

interface PageCardProps {
  page: Page;
  onEdit: () => void;
  onDelete: () => void;
  onPreview?: () => void;
  onDuplicate?: () => void;
  onSettings?: () => void;
  onVersionHistory?: () => void;
}

/**
 * PageCard - مكون بطاقة الصفحة
 */
export function PageCard({
  page,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
  onSettings,
  onVersionHistory,
}: PageCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{page.name}</CardTitle>
          <Badge variant={page.isActive === 'yes' ? 'default' : 'secondary'}>
            {page.isActive === 'yes' ? (
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span className="font-mono text-xs">{page.slug}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">العنوان (AR):</span>
          <span className="font-medium">{page.titleAr}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">العنوان (EN):</span>
          <span className="font-medium">{page.titleEn}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {page.type === 'main' ? 'صفحة رئيسية' : 'صفحة فرعية'}
          </Badge>
          <Badge
            variant={
              page.status === 'published'
                ? 'default'
                : page.status === 'archived'
                  ? 'secondary'
                  : 'outline'
            }
            className="text-xs"
          >
            {page.status === 'published' ? 'منشور' : page.status === 'archived' ? 'مؤرشف' : 'مسودة'}
          </Badge>
          {page.parentId && (
            <Badge variant="secondary" className="text-xs">
              فرعية
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onPreview && (
          <Button onClick={onPreview} size="sm" variant="outline">
            <Eye className="h-4 w-4 ml-1" />
            معاينة
          </Button>
        )}
        {onSettings && (
          <Button onClick={onSettings} size="sm" variant="outline">
            <Settings className="h-4 w-4 ml-1" />
            إعدادات
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
