/**
 * TemplateCard - بطاقة عرض القالب
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Send, Copy, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Template } from '../types/template.types';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { UsageBadge } from './UsageBadge';

interface TemplateCardProps {
  template: Template;
  onEdit: (t: Template) => void;
  onDelete: (id: number) => void;
  onTest: (t: Template) => void;
  onCopy: (t: Template) => void;
  onPreview: (t: Template) => void;
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onTest,
  onCopy,
  onPreview,
}: TemplateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const vars = template.variables ? JSON.parse(template.variables) : [];

  return (
    <Card className="group hover:shadow-md transition-shadow border dark:border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">{template.name}</CardTitle>
            {template.metaName && template.metaName !== template.name && (
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                {template.metaName}
              </p>
            )}
          </div>
          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          <StatusBadge status={template.metaStatus} />
          <CategoryBadge category={template.category} />
          <UsageBadge metaName={template.metaName} />
          {template.languageCode && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <span className="text-[10px]">{template.languageCode}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Content Preview */}
        <div
          className={`text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 cursor-pointer ${
            expanded ? '' : 'line-clamp-3'
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          {template.content}
          {!expanded && template.content.length > 120 && (
            <span className="text-green-600 ml-1">...عرض المزيد</span>
          )}
        </div>

        {/* Variables */}
        {vars.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vars.map((v: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-[10px] font-mono">
                {`{{${i + 1}}}`} = {v}
              </Badge>
            ))}
          </div>
        )}

        {/* Time */}
        <p className="text-[10px] text-muted-foreground">
          أُنشئ {formatDistanceToNow(new Date(template.createdAt), { locale: ar, addSuffix: true })}
        </p>

        {/* Actions */}
        <div className="flex gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-[10px] gap-1"
            onClick={() => onPreview(template)}
          >
            <Eye className="h-3 w-3" />
            معاينة
          </Button>
          {template.metaStatus === 'APPROVED' && (
            <Button
              size="sm"
              className="flex-1 h-7 text-[10px] gap-1 bg-green-600 hover:bg-green-700"
              onClick={() => onTest(template)}
            >
              <Send className="h-3 w-3" />
              اختبار
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => onCopy(template)}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(template)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(template.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
