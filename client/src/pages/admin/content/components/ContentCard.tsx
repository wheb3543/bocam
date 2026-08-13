/**
 * Content Card Component
 * مكون بطاقة المحتوى
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, History } from 'lucide-react';

interface ContentCardProps {
  title: string;
  description?: string;
  metadata?: Record<string, string>;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onVersionHistory?: () => void;
  isActive?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

/**
 * ContentCard - مكون بطاقة المحتوى
 */
export function ContentCard({
  title,
  description,
  metadata,
  onEdit,
  onDelete,
  onView,
  onVersionHistory,
  isActive = true,
  status,
}: ContentCardProps) {
  return (
    <Card className={`transition-all hover:shadow-md ${!isActive ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="flex gap-2 items-center">
            {status && (
              <Badge
                variant={
                  status === 'published'
                    ? 'default'
                    : status === 'archived'
                      ? 'secondary'
                      : 'outline'
                }
                className="text-xs"
              >
                {status === 'published' ? 'منشور' : status === 'archived' ? 'مؤرشف' : 'مسودة'}
              </Badge>
            )}
            <div className="flex gap-2">
              {onView && (
                <Button variant="ghost" size="icon" onClick={onView} aria-label="عرض">
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onVersionHistory && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onVersionHistory}
                  aria-label="تاريخ النسخ"
                >
                  <History className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} aria-label="تعديل">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete} aria-label="حذف">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {metadata && Object.keys(metadata).length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="font-medium">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
