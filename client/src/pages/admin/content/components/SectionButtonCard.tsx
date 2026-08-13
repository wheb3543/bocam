/**
 * Section Button Card Component
 * مكون بطاقة زر القسم
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Link, Lock, Unlock } from 'lucide-react';
import type { SectionButton } from '../hooks/useSectionButtons';

interface SectionButtonCardProps {
  button: SectionButton;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * SectionButtonCard - مكون بطاقة زر القسم
 */
export function SectionButtonCard({ button, onEdit, onDelete }: SectionButtonCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate">{button.textAr}</CardTitle>
          <Badge variant={button.isActive === 'yes' ? 'default' : 'secondary'}>
            {button.isActive === 'yes' ? (
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
          <Link className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground truncate">{button.link}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">النص (EN):</span>
          <span className="font-medium">{button.textEn}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {button.style}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            الترتيب: {button.sortOrder}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">القسم ID: {button.sectionId}</div>
      </CardContent>
      <CardFooter className="flex gap-2">
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
