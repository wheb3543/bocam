/**
 * BlogPostTable - جدول مقالات المدونة في لوحة التحكم
 *
 * يعرض المقالات مع صورة مصغّرة وحالة النشر والتصنيف والتاريخ، مع إجراءات
 * سريعة: تعديل، نشر/إلغاء نشر، تكرار، حذف ناعم. يلتزم صلاحيات content.*.
 */

import { Link } from 'wouter';
import { Copy, ExternalLink, FileText, Loader2, Pencil, Send, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useConfirmDialog } from '@/hooks/ui/useConfirmDialog';
import {
  formatBlogDate,
  formatReadingTime,
} from '@apps/public/modules/05-content-and-legal/utils/blogPresentation';
import type { BlogPostRow } from '../types/blog.types';

const STATUS_LABELS: Record<BlogPostRow['status'], string> = {
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
};

const STATUS_VARIANTS: Record<BlogPostRow['status'], 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  published: 'default',
  archived: 'secondary',
};

type BlogPostTableProps = {
  posts: BlogPostRow[];
  isLoading: boolean;
  isPendingIds?: number[];
  onEdit: (post: BlogPostRow) => void;
  onTogglePublish: (post: BlogPostRow) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

export function BlogPostTable({
  posts,
  isLoading,
  isPendingIds = [],
  onEdit,
  onTogglePublish,
  onDuplicate,
  onDelete,
  canEdit,
  canPublish,
  canDelete,
}: BlogPostTableProps) {
  const deleteConfirm = useConfirmDialog<{ id: number; title: string }>();

  const handleDelete = () => {
    if (deleteConfirm.item) {
      onDelete(deleteConfirm.item.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">جارٍ تحميل المقالات...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-semibold">لا توجد مقالات مطابقة</p>
        <p className="text-xs text-muted-foreground">
          جرّب تعديل عوامل التصفية، أو أضف مقالاً جديداً للمدونة.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[16rem]">المقال</TableHead>
              <TableHead className="w-40">التصنيف</TableHead>
              <TableHead className="w-28">الحالة</TableHead>
              <TableHead className="w-32">التاريخ</TableHead>
              <TableHead className="w-24">وقت القراءة</TableHead>
              <TableHead className="w-40 text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => {
              const isPending = isPendingIds.includes(post.id);
              return (
                <TableRow key={post.id} className={isPending ? 'opacity-60' : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={post.coverImage || '/sgh/blog/blog-1.jpg'}
                        alt={post.coverImageAlt || post.title}
                        loading="lazy"
                        className="h-11 w-16 flex-shrink-0 rounded-md border border-border object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{post.title}</p>
                        <p className="truncate text-xs text-muted-foreground" dir="ltr">
                          /blog/{post.slug}
                        </p>
                      </div>
                      {post.isFeatured === 'yes' && (
                        <Star
                          className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400"
                          aria-label="مقال مميّز"
                        />
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {post.categoryName || '—'}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant={STATUS_VARIANTS[post.status]}>
                        {STATUS_LABELS[post.status]}
                      </Badge>
                      {post.isActive === 'no' && (
                        <Badge variant="secondary" className="text-[0.65rem]">
                          معطّل
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatBlogDate(post.publishedAt) || '—'}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatReadingTime(post.readingTime)}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {post.status === 'published' && (
                        <Link href={`/blog/${encodeURIComponent(post.slug)}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="عرض المقال"
                            aria-label="عرض المقال"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}

                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="تعديل المقال"
                          aria-label="تعديل المقال"
                          onClick={() => onEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                      {canPublish && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title={post.status === 'published' ? 'إلغاء النشر' : 'نشر المقال'}
                          aria-label={post.status === 'published' ? 'إلغاء النشر' : 'نشر المقال'}
                          onClick={() => onTogglePublish(post)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}

                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="تكرار كمسودة"
                          aria-label="تكرار كمسودة"
                          onClick={() => onDuplicate(post.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="حذف المقال"
                          aria-label="حذف المقال"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            deleteConfirm.openConfirm({ id: post.id, title: post.title })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onOpenChange={deleteConfirm.closeConfirm}
        itemName={deleteConfirm.item?.title}
        itemType="مقال المدونة"
        onConfirm={handleDelete}
        confirmText="نقل إلى المحذوفات"
      />
    </>
  );
}

export default BlogPostTable;
