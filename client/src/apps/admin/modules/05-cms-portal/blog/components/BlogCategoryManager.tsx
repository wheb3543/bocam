/**
 * BlogCategoryManager - إدارة تصنيفات المدونة الطبية
 *
 * يعرض التصنيفات في قائمة جانبية داخل صفحة الإدارة، مع إنشاء وتعديل
 * وحذف ناعم. يمنع الخادم حذف تصنيف مرتبط بمقالات.
 */

import { useState } from 'react';
import { Loader2, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useConfirmDialog } from '@/hooks/ui/useConfirmDialog';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import {
  initialBlogCategoryFormData,
  type BlogCategoryFormData,
  type BlogCategoryRow,
} from '../types/blog.types';

type BlogCategoryManagerProps = {
  categories: BlogCategoryRow[];
  isLoading: boolean;
  canManage: boolean;
  selectedCategoryId: number | null;
  onSelect: (id: number | null) => void;
  onChanged: () => void | Promise<void>;
};

export function BlogCategoryManager({
  categories,
  isLoading,
  canManage,
  selectedCategoryId,
  onSelect,
  onChanged,
}: BlogCategoryManagerProps) {
  const deleteConfirm = useConfirmDialog<BlogCategoryRow>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogCategoryRow | null>(null);
  const [form, setForm] = useState<BlogCategoryFormData>(initialBlogCategoryFormData);

  const createMutation = trpc.content.blog.categories.create.useMutation({
    onSuccess: async () => {
      toast.success('تم إنشاء التصنيف بنجاح');
      setIsDialogOpen(false);
      await onChanged();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.content.blog.categories.update.useMutation({
    onSuccess: async () => {
      toast.success('تم تحديث التصنيف بنجاح');
      setIsDialogOpen(false);
      await onChanged();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.content.blog.categories.delete.useMutation({
    onSuccess: async () => {
      toast.success('تم حذف التصنيف');
      await onChanged();
    },
    onError: (error) => toast.error(error.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(initialBlogCategoryFormData);
    setIsDialogOpen(true);
  };

  const openEdit = (category: BlogCategoryRow) => {
    setEditing(category);
    setForm({
      name: category.name,
      nameEn: category.nameEn ?? '',
      description: category.description ?? '',
      icon: category.icon ?? '',
      color: category.color ?? '#1ca8e5',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate({ ...form, id: editing.id });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = () => {
    if (deleteConfirm.item) {
      deleteMutation.mutate({ id: deleteConfirm.item.id });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Tags className="h-4 w-4 text-[#1ca8e5]" />
          تصنيفات المدونة
        </h2>
        {canManage && (
          <Button size="sm" variant="outline" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            إضافة
          </Button>
        )}
      </div>

      <div className="max-h-[520px] overflow-y-auto p-2">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">جارٍ التحميل...</span>
          </div>
        )}

        {!isLoading && (
          <ul className="grid gap-1">
            <li>
              <button
                type="button"
                onClick={() => onSelect(null)}
                aria-pressed={selectedCategoryId === null}
                className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                  selectedCategoryId === null ? 'bg-[#1ca8e5] text-white' : 'hover:bg-muted'
                }`}
              >
                كل التصنيفات
              </button>
            </li>

            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(category.id)}
                  aria-pressed={selectedCategoryId === category.id}
                  className={`flex-1 rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                    selectedCategoryId === category.id
                      ? 'bg-[#1ca8e5] text-white'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {category.name}
                    <span className="text-xs opacity-70">({category.postsCount})</span>
                  </span>
                  {category.isActive === 'no' && (
                    <Badge variant="secondary" className="ms-2 text-[0.6rem]">
                      معطّل
                    </Badge>
                  )}
                </button>

                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`تعديل تصنيف ${category.name}`}
                    onClick={() => openEdit(category)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`حذف تصنيف ${category.name}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteConfirm.openConfirm(category)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            ))}

            {categories.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                لا توجد تصنيفات بعد. أضف أول تصنيف لتنظيم المقالات.
              </li>
            )}
          </ul>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</DialogTitle>
            <DialogDescription>
              التصنيف يُستخدم للتصفية في صفحة المدونة وربط المقالات ذات الصلة.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="category-name">اسم التصنيف *</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="مثال: الأمراض المعدية"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-name-en">الاسم بالإنجليزية</Label>
              <Input
                id="category-name-en"
                value={form.nameEn}
                onChange={(event) => setForm({ ...form, nameEn: event.target.value })}
                dir="ltr"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-description">الوصف</Label>
              <Textarea
                id="category-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={2}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category-color">لون التمييز</Label>
                <Input
                  id="category-color"
                  type="color"
                  value={form.color || '#1ca8e5'}
                  onChange={(event) => setForm({ ...form, color: event.target.value })}
                  className="h-10 cursor-pointer"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category-sort">ترتيب العرض</Label>
                <Input
                  id="category-sort"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm({ ...form, sortOrder: Number(event.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="category-active"
                type="checkbox"
                checked={form.isActive === 'yes'}
                onChange={(event) =>
                  setForm({ ...form, isActive: event.target.checked ? 'yes' : 'no' })
                }
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="category-active">نشط (يظهر في التصفية العامة)</Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSaving || !form.name.trim()}>
              {isSaving && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              {editing ? 'حفظ التعديلات' : 'إنشاء التصنيف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onOpenChange={deleteConfirm.closeConfirm}
        itemName={deleteConfirm.item?.name}
        itemType="تصنيف المدونة"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default BlogCategoryManager;
