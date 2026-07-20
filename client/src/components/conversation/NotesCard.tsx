/**
 * Notes Card Component
 * مكون بطاقة الملاحظات
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NotesCardProps {
  notes?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingNotes: boolean;
  editedNotes: string;
  onEditNotes: () => void;
  onSaveNotes: () => void;
  onCancelEditNotes: () => void;
  onNotesChange: (value: string) => void;
  isSaving: boolean;
}

export default function NotesCard({
  notes,
  isOpen,
  onOpenChange,
  editingNotes,
  editedNotes,
  onEditNotes,
  onSaveNotes,
  onCancelEditNotes,
  onNotesChange,
  isSaving,
}: NotesCardProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer p-2">
          <p className="text-xs font-semibold text-muted-foreground">ملاحظات المحادثة</p>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <Card className="p-3 sm:p-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          {editingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={editedNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="أضف ملاحظات عن هذه المحادثة..."
                className="text-xs min-h-[80px]"
                dir="rtl"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancelEditNotes}
                  className="h-7 text-xs"
                >
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  onClick={onSaveNotes}
                  disabled={isSaving}
                  className="h-7 text-xs"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {notes ? (
                <p className="text-xs text-foreground whitespace-pre-wrap">
                  {notes}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">لا توجد ملاحظات</p>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditNotes}
                className="h-6 text-xs w-full"
              >
                {notes ? 'تعديل الملاحظات' : 'إضافة ملاحظات'}
              </Button>
            </div>
          )}
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
