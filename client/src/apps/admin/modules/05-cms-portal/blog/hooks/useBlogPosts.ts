/**
 * useBlogPosts - إدارة مقالات المدونة في لوحة التحكم
 *
 * يغلّف استدعاءات tRPC وحالة النموذج والحوارات، بنمط مطابق لـ usePages
 * في وحدة CMS، مع احترام بوابة جودة النشر واستخراج ملاحظاتها.
 */

import { useCallback, useMemo, useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { useRolePermissions } from '@/hooks/auth/useRolePermissions';
import { getPublicationQualityIssues } from '../../utils/publicationQuality';
import {
  initialBlogPostFormData,
  toBlogPostFormData,
  toBlogPostPayload,
  type BlogPostFormData,
  type BlogPostRow,
  type BlogStatus,
} from '../types/blog.types';

export function useBlogPosts() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { can } = useRolePermissions();

  const canView = can('content.view');
  const canCreate = can('content.create');
  const canUpdate = can('content.update');
  const canDelete = can('content.delete');
  const canRestore = can('content.restore');
  const canPublish = can('content.publish');
  const canReview = can('content.review');

  // الفلاتر والترقيم
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // حالة النموذج والحوارات
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostRow | null>(null);
  const [formData, setFormData] = useState<BlogPostFormData>(initialBlogPostFormData);
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);

  const listInput = useMemo(
    () => ({
      search: searchQuery.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      categoryId: categoryFilter ?? undefined,
      page,
      limit: 20,
    }),
    [searchQuery, statusFilter, categoryFilter, page]
  );

  const postsQuery = trpc.content.blog.list.useQuery(listInput, { enabled: canView });
  const overviewQuery = trpc.content.blog.getOverview.useQuery(undefined, { enabled: canView });
  const categoriesQuery = trpc.content.blog.categories.list.useQuery(
    { includeInactive: true },
    { enabled: canView }
  );

  const posts = postsQuery.data?.data ?? [];
  const pagination = postsQuery.data?.pagination ?? null;
  const categories = categoriesQuery.data ?? [];

  /** إعادة الجلب بعد أي عملية كتابة. */
  const refresh = useCallback(async () => {
    await Promise.all([postsQuery.refetch(), overviewQuery.refetch()]);
  }, [postsQuery, overviewQuery]);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setQualityIssues([]);
    setFormData(initialBlogPostFormData);
  }, []);

  /** يفتح الحوار فارغاً للإنشاء. */
  const openCreateDialog = useCallback(() => {
    setEditingPost(null);
    setFormData(initialBlogPostFormData);
    setQualityIssues([]);
    setIsDialogOpen(true);
  }, []);

  /**
   * يفتح الحوار للتعديل. نستخدم بيانات الصف المعروزة مباشرة لتفادي رحلة شبكة
   * إضافية، لأن قائمة الإدارة تعيد كل الحقول القابلة للتحرير.
   */
  const openEditDialog = useCallback((post: BlogPostRow) => {
    setEditingPost(post);
    setFormData({
      ...initialBlogPostFormData,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      coverImage: post.coverImage ?? '',
      coverImageAlt: post.coverImageAlt ?? '',
      categoryId: post.categoryId,
      reviewerName: post.reviewerName ?? '',
      status: post.status,
      isActive: post.isActive,
      isFeatured: post.isFeatured,
      sortOrder: post.sortOrder,
    });
    setQualityIssues([]);
    setIsDialogOpen(true);
  }, []);

  const updateForm = useCallback((patch: Partial<BlogPostFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  /** يستخرج ملاحظات بوابة الجودة من خطأ tRPC لعرضها داخل النموذج. */
  const handleQualityError = useCallback((error: unknown) => {
    const issues = getPublicationQualityIssues(error);
    if (issues.length > 0) {
      setQualityIssues(issues);
      toast.error('تعذّر نشر المقال. راجع أخطاء الجودة الظاهرة في النموذج.');
      return true;
    }
    toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    return false;
  }, []);

  const createMutation = trpc.content.blog.create.useMutation({
    onSuccess: async (result) => {
      emitToastHash({
        kind: 'success',
        message: 'تم إنشاء مقال المدونة بنجاح',
        description: `الرابط العام: /blog/${result.slug}`,
        redirect: '/admin/content/blog',
      });
      closeDialog();
      await refresh();
    },
    onError: handleQualityError,
  });

  const updateMutation = trpc.content.blog.update.useMutation({
    onSuccess: async (result) => {
      emitToastHash({
        kind: 'success',
        message: 'تم تحديث مقال المدونة بنجاح',
        description: `الرابط العام: /blog/${result.slug}`,
        redirect: '/admin/content/blog',
      });
      closeDialog();
      await refresh();
    },
    onError: handleQualityError,
  });

  const publishMutation = trpc.content.blog.publish.useMutation({
    onSuccess: async (_result, variables) => {
      toast.success(variables.published ? 'تم نشر المقال' : 'تم إلغاء نشر المقال');
      await refresh();
    },
    onError: handleQualityError,
  });

  const deleteMutation = trpc.content.blog.delete.useMutation({
    onSuccess: async () => {
      toast.success('تم نقل المقال إلى سلة محذوفات المحتوى');
      await refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const duplicateMutation = trpc.content.blog.duplicate.useMutation({
    onSuccess: async (result) => {
      toast.success('تم تكرار المقال كمسودة جديدة');
      await refresh();
      const created = postsQuery.data?.data.find((post) => post.id === result.id);
      if (created) {
        openEditDialog(created);
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = useCallback(() => {
    const payload = toBlogPostPayload(formData);
    if (editingPost) {
      updateMutation.mutate({ ...payload, id: editingPost.id });
    } else {
      createMutation.mutate(payload);
    }
  }, [createMutation, editingPost, formData, updateMutation]);

  const handleTogglePublish = useCallback(
    (post: BlogPostRow) => {
      publishMutation.mutate({ id: post.id, published: post.status !== 'published' });
    },
    [publishMutation]
  );

  const handleDelete = useCallback(
    (id: number) => {
      deleteMutation.mutate({ id });
    },
    [deleteMutation]
  );

  const handleDuplicate = useCallback(
    (id: number) => {
      duplicateMutation.mutate({ id });
    },
    [duplicateMutation]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter(null);
    setPage(1);
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const setStatus = useCallback((value: 'all' | BlogStatus) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const setCategory = useCallback((value: number | null) => {
    setCategoryFilter(value);
    setPage(1);
  }, []);

  return {
    // البيانات
    posts,
    pagination,
    categories,
    overview: overviewQuery.data ?? null,
    isLoadingPosts: postsQuery.isLoading,
    isLoadingOverview: overviewQuery.isLoading,
    isError: postsQuery.isError,
    refetch: refresh,

    // الفلاتر والترقيم
    filters: { searchQuery, statusFilter, categoryFilter },
    setSearchQuery: setSearch,
    setStatusFilter: setStatus,
    setCategoryFilter: setCategory,
    resetFilters,
    page,
    setPage,

    // النموذج
    isDialogOpen,
    editingPost,
    formData,
    updateForm,
    qualityIssues,
    clearQualityIssues: () => setQualityIssues([]),
    isSaving,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleSubmit,
    toFormData: toBlogPostFormData,

    // الإجراءات
    handleTogglePublish,
    handleDelete,
    handleDuplicate,

    // الصلاحيات
    permissions: {
      canView,
      canCreate,
      canUpdate,
      canDelete,
      canRestore,
      canPublish,
      canReview,
      isAdmin,
    },
  };
}
