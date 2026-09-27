/**
 * BlogManagementPage - صفحة إدارة المدونة الطبية (/admin/content/blog)
 *
 * تجمع: بطاقات الإحصاء، إدارة التصنيفات، شريط الفلاتر، جدول المقالات،
 * وتتم حمايته بصلاحيات content.* ذات الصلة.
 */

import { Link as RouterLink } from 'wouter';
import {
  AlertTriangle,
  Eye,
  Newspaper,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Pagination from '@/components/table/Pagination';
import { PermissionHint } from '@/components/PermissionHint';

import { useBlogPosts } from '../hooks/useBlogPosts';
import { BlogPostTable } from '../components/BlogPostTable';
import { BlogPostDialog } from '../components/BlogPostDialog';
import { BlogCategoryManager } from '../components/BlogCategoryManager';

const ALL_CATEGORIES = '__all__';
const ALL_STATUSES = '__all__';

export default function BlogManagementPage() {
  const blog = useBlogPosts();
  const { permissions } = blog;

  if (!permissions.canView) {
    return (
      <DashboardLayout pageTitle="إدارة المدونة الطبية">
        <Alert variant="destructive">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>لا تملك صلاحية عرض المدونة</AlertTitle>
          <AlertDescription>
            هذه الصفحة تتطلب صلاحية «عرض المحتوى». راجع مدير النظام لمنحك الصلاحية.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="إدارة المدونة الطبية">
      <div className="grid gap-6">
        {!permissions.canCreate && (
          <PermissionHint
            label="إنشاء المقالات مقيّد"
            message="تحتاج صلاحية «إنشاء المحتوى» لإضافة مقالات جديدة للمدونة."
          />
        )}

        {/* ===== بطاقات الإحصاء ===== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'إجمالي المقالات', value: blog.overview?.total ?? 0, icon: Newspaper },
            { label: 'منشورة', value: blog.overview?.published ?? 0, icon: Eye },
            { label: 'مسودات', value: blog.overview?.draft ?? 0, icon: Pencil },
            { label: 'مميّزة', value: blog.overview?.featured ?? 0, icon: Star },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1ca8e5]/10 text-[#1ca8e5]">
                    <Icon className="h-5 w-5" />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ===== التخطيط: التصنيفات + الجدول ===== */}
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <BlogCategoryManager
            categories={blog.categories}
            isLoading={blog.isLoadingOverview}
            canManage={permissions.canUpdate}
            selectedCategoryId={blog.filters.categoryFilter}
            onSelect={blog.setCategoryFilter}
            onChanged={blog.refetch}
          />

          <div className="grid gap-4">
            {/* شريط الأدوات والفلاتر */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={blog.filters.searchQuery}
                  onChange={(event) => blog.setSearchQuery(event.target.value)}
                  placeholder="ابحث في العناوين والروابط..."
                  className="pe-9"
                  aria-label="بحث في المقالات"
                />
              </div>

              <Select
                value={
                  blog.filters.statusFilter === 'all' ? ALL_STATUSES : blog.filters.statusFilter
                }
                onValueChange={(value) =>
                  blog.setStatusFilter(
                    value === ALL_STATUSES ? 'all' : (value as 'draft' | 'published' | 'archived')
                  )
                }
              >
                <SelectTrigger className="w-[190px]" aria-label="تصفية بالحالة">
                  <SelectValue placeholder="كل الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>كل الحالات</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  blog.filters.categoryFilter ? String(blog.filters.categoryFilter) : ALL_CATEGORIES
                }
                onValueChange={(value) =>
                  blog.setCategoryFilter(value === ALL_CATEGORIES ? null : Number(value))
                }
              >
                <SelectTrigger className="w-[190px]" aria-label="تصفية بالتصنيف">
                  <SelectValue placeholder="كل التصنيفات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES}>كل التصنيفات</SelectItem>
                  {blog.categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={blog.resetFilters}>
                <X className="h-4 w-4" />
                مسح
              </Button>

              <div className="ms-auto flex items-center gap-2">
                <RouterLink href="/blog" target="_blank">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                    معاينة صفحة المدونة
                  </Button>
                </RouterLink>

                {permissions.canCreate && (
                  <Button onClick={blog.openCreateDialog}>
                    <Plus className="h-4 w-4" />
                    مقال جديد
                  </Button>
                )}
              </div>
            </div>

            {blog.isError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>تعذّر تحميل المقالات</AlertTitle>
                <AlertDescription>
                  <Button variant="outline" size="sm" onClick={() => blog.refetch()}>
                    إعادة المحاولة
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* الجدول */}
            <div className="rounded-xl border border-border bg-card">
              <BlogPostTable
                posts={blog.posts}
                isLoading={blog.isLoadingPosts}
                onEdit={blog.openEditDialog}
                onTogglePublish={blog.handleTogglePublish}
                onDuplicate={blog.handleDuplicate}
                onDelete={blog.handleDelete}
                canEdit={permissions.canUpdate}
                canPublish={permissions.canPublish}
                canDelete={permissions.canDelete}
              />
            </div>

            {/* الترقيم */}
            {blog.pagination && blog.pagination.totalPages > 1 && (
              <Pagination
                currentPage={blog.pagination.page}
                totalPages={blog.pagination.totalPages}
                totalItems={blog.pagination.total}
                onPageChange={blog.setPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* ===== نموذج المقال ===== */}
      {permissions.canCreate && (
        <BlogPostDialog
          open={blog.isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              blog.closeDialog();
            }
          }}
          mode={blog.editingPost ? 'edit' : 'create'}
          formData={blog.formData}
          onFormDataChange={blog.updateForm}
          onSubmit={blog.handleSubmit}
          isPending={blog.isSaving}
          categories={blog.categories}
          qualityIssues={blog.qualityIssues}
          isAdmin={permissions.isAdmin}
          canPublish={permissions.canPublish}
        />
      )}
    </DashboardLayout>
  );
}
