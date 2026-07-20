/**
 * TemplateList - قائمة القوالب
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, RefreshCw } from 'lucide-react';
import type { Template } from '../types/template.types';
import { TemplateCard } from './TemplateCard';

interface TemplateListProps {
  templates: Template[];
  filteredTemplates: Template[];
  isLoading: boolean;
  searchQuery: string;
  filterStatus: string;
  onEdit: (t: Template) => void;
  onDelete: (id: number) => void;
  onTest: (t: Template) => void;
  onCopy: (t: Template) => void;
  onPreview: (t: Template) => void;
  onSync: () => void;
  isSyncPending: boolean;
}

export function TemplateList({
  templates,
  filteredTemplates,
  isLoading,
  searchQuery,
  filterStatus,
  onEdit,
  onDelete,
  onTest,
  onCopy,
  onPreview,
  onSync,
  isSyncPending,
}: TemplateListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-500" />
        <p className="text-sm text-muted-foreground">جاري تحميل القوالب...</p>
      </div>
    );
  }

  if (filteredTemplates && filteredTemplates.length > 0) {
    return (
      <>
        <p className="text-xs text-muted-foreground">
          عرض {filteredTemplates.length} من {templates?.length} قالب
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template: Template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={onEdit}
              onDelete={onDelete}
              onTest={onTest}
              onCopy={onCopy}
              onPreview={onPreview}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-2">
          {searchQuery || filterStatus !== 'all'
            ? 'لا توجد قوالب تطابق البحث'
            : 'لا توجد قوالب حالياً'}
        </p>
        {!searchQuery && filterStatus === 'all' && (
          <Button
            size="sm"
            onClick={onSync}
            variant="outline"
            className="gap-1.5"
            disabled={isSyncPending}
          >
            {isSyncPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            مزامنة من Meta
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
