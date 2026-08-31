/**
 * usePages - Custom Hook لإدارة الصفحات
 * Hook مخصص لإدارة الصفحات
 */

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import { emitToastHash } from '@/lib/toastHashRouter';
import { useAuth } from '@/_core/hooks/useAuth';
import type { Section } from './useSections';
import type { TextContent, Image } from '../types/content.types';
import { getContentListData, getContentListPagination } from '../utils/listResponse';
import { getPublicationQualityIssues } from '../utils/publicationQuality';

export interface Page {
  id: number;
  name: string;
  slug: string;
  type: 'main' | 'sub';
  parentId: number | null;
  titleAr: string;
  titleEn: string;
  metaTitleAr: string | null;
  metaTitleEn: string | null;
  metaDescriptionAr: string | null;
  metaDescriptionEn: string | null;
  keywordsAr: string | null;
  keywordsEn: string | null;
  status: 'draft' | 'published' | 'archived';
  isActive: 'yes' | 'no';
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageFormData {
  name: string;
  slug: string;
  type: 'main' | 'sub';
  parentId: number | null;
  titleAr: string;
  titleEn: string;
  metaTitleAr: string | null;
  metaTitleEn: string | null;
  metaDescriptionAr: string | null;
  metaDescriptionEn: string | null;
  keywordsAr: string | null;
  keywordsEn: string | null;
  status: 'draft' | 'published' | 'archived';
  isActive: 'yes' | 'no';
  sortOrder: number;
  publishedAt: Date | null;
  qualityOverrideReason: string;
}

export interface PageCompletenessCheck {
  isComplete: boolean;
  missingFields: string[];
  warnings: string[];
}

/**
 * التحقق من اكتمال الصفحة
 */
export function checkPageCompleteness(
  page: Page | PageFormData,
  sections: Section[] = [],
  textContents: TextContent[] = [],
  images: Image[] = []
): PageCompletenessCheck {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // التحقق من الحقول الأساسية
  if (!page.name || page.name.trim() === '') {
    missingFields.push('اسم الصفحة');
  }
  if (!page.slug || page.slug.trim() === '') {
    missingFields.push('رابط الصفحة (slug)');
  }
  if (!page.titleAr || page.titleAr.trim() === '') {
    missingFields.push('العنوان بالعربية');
  }
  if (!page.titleEn || page.titleEn.trim() === '') {
    missingFields.push('العنوان بالإنجليزية');
  }

  // التحقق من SEO
  if (!page.metaTitleAr || page.metaTitleAr.trim() === '') {
    warnings.push('عنوان SEO بالعربية مفقود');
  }
  if (!page.metaDescriptionAr || page.metaDescriptionAr.trim() === '') {
    warnings.push('وصف SEO بالعربية مفقود');
  }

  // التحقق من الأقسام والمحتوى النصي والصور (فقط إذا كان لدينا id)
  const pageId = 'id' in page ? page.id : null;
  if (pageId !== null) {
    const activeSections = sections.filter((s) => s.pageId === pageId && s.isActive === 'yes');
    if (activeSections.length === 0) {
      warnings.push('لا توجد أقسام مرتبطة بالصفحة');
    }

    const pageTextContents = textContents.filter(
      (t) => t.pageId === pageId && t.isActive === 'yes'
    );
    if (pageTextContents.length === 0) {
      warnings.push('لا يوجد محتوى نصي للصفحة');
    }

    const pageImages = images.filter((i) => i.pageId === pageId && i.isActive === 'yes');
    if (pageImages.length === 0) {
      warnings.push('لا توجد صور للصفحة');
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

export const initialPageFormData: PageFormData = {
  name: '',
  slug: '',
  type: 'main',
  parentId: null,
  titleAr: '',
  titleEn: '',
  metaTitleAr: '',
  metaTitleEn: '',
  metaDescriptionAr: '',
  metaDescriptionEn: '',
  keywordsAr: '',
  keywordsEn: '',
  status: 'draft',
  isActive: 'yes',
  sortOrder: 0,
  publishedAt: null,
  qualityOverrideReason: '',
};

/**
 * usePages - Hook لإدارة الصفحات
 */
export function usePages() {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<PageFormData>(initialPageFormData);
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState<'all' | 'main' | 'sub'>('all');
  const [isActive, setIsActive] = useState<'all' | 'yes' | 'no'>('all');
  const [page, setPage] = useState(1);

  // Query
  const {
    data: pagesData,
    isLoading: loadingPages,
    refetch,
  } = trpc.content.pages.list.useQuery({
    type: type !== 'all' ? type : undefined,
    isActive: isActive !== 'all' ? (isActive as 'yes' | 'no') : undefined,
    search: searchQuery || undefined,
    page,
  });

  const pages = getContentListData<Page>(pagesData);
  const pagination = getContentListPagination<Page>(pagesData);

  // Query for main pages (for parent selection)
  const { data: mainPages } = trpc.content.pages.getMainPages.useQuery();

  // Mutations
  const createMutation = trpc.content.pages.create.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم إنشاء الصفحة بنجاح',
        description: 'تم حفظ الصفحة بنجاح. يمكنك متابعة التعديل أو العودة إلى الشاشة السابقة.',
        redirect: '/admin/content/content',
      });
      setQualityIssues([]);
      setIsCreateDialogOpen(false);
      setFormData(initialPageFormData);
      refetch();
    },
    onError: (error) => {
      const issues = getPublicationQualityIssues(error);
      if (issues.length > 0) {
        setQualityIssues(issues);
        toast.error('تعذر نشر الصفحة. راجع أخطاء الجودة الظاهرة في النموذج.');
        return;
      }
      toast.error(`فشل إنشاء الصفحة: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.pages.update.useMutation({
    onSuccess: () => {
      emitToastHash({
        kind: 'success',
        message: 'تم تحديث الصفحة بنجاح',
        description: 'تم حفظ التغييرات الأخيرة على الصفحة.',
        redirect: '/admin/content/content',
      });
      setQualityIssues([]);
      setIsEditDialogOpen(false);
      setSelectedPage(null);
      setFormData(initialPageFormData);
      refetch();
    },
    onError: (error) => {
      const issues = getPublicationQualityIssues(error);
      if (issues.length > 0) {
        setQualityIssues(issues);
        toast.error('تعذر نشر الصفحة. راجع أخطاء الجودة الظاهرة في النموذج.');
        return;
      }
      toast.error(`فشل تحديث الصفحة: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.pages.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الصفحة بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل حذف الصفحة: ${error.message}`);
    },
  });

  const duplicateMutation = trpc.content.pages.duplicate.useMutation({
    onSuccess: () => {
      toast.success('تم نسخ الصفحة بنجاح');
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل نسخ الصفحة: ${error.message}`);
    },
  });

  // Handlers
  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من اكتمال الصفحة قبل النشر
    if (formData.status === 'published') {
      const completeness = checkPageCompleteness(formData);
      if (!completeness.isComplete) {
        toast.error(`الصفحة غير مكتملة. الحقول المفقودة: ${completeness.missingFields.join(', ')}`);
        return;
      }
      if (completeness.warnings.length > 0) {
        toast.warning(`تحذيرات: ${completeness.warnings.join(', ')}`);
      }
    }

    createMutation.mutate({
      name: formData.name,
      slug: formData.slug,
      type: formData.type,
      parentId: formData.parentId || undefined,
      titleAr: formData.titleAr,
      titleEn: formData.titleEn,
      metaTitleAr: formData.metaTitleAr || undefined,
      metaTitleEn: formData.metaTitleEn || undefined,
      metaDescriptionAr: formData.metaDescriptionAr || undefined,
      metaDescriptionEn: formData.metaDescriptionEn || undefined,
      keywordsAr: formData.keywordsAr || undefined,
      keywordsEn: formData.keywordsEn || undefined,
      status: formData.status,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
      publishedAt: formData.publishedAt || undefined,
      qualityOverrideReason: formData.qualityOverrideReason.trim() || undefined,
    });
  };

  const handleEditPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) {
      return;
    }

    // التحقق من اكتمال الصفحة قبل النشر
    if (formData.status === 'published') {
      const completeness = checkPageCompleteness(formData);
      if (!completeness.isComplete) {
        toast.error(`الصفحة غير مكتملة. الحقول المفقودة: ${completeness.missingFields.join(', ')}`);
        return;
      }
      if (completeness.warnings.length > 0) {
        toast.warning(`تحذيرات: ${completeness.warnings.join(', ')}`);
      }
    }

    updateMutation.mutate({
      id: selectedPage.id,
      name: formData.name,
      slug: formData.slug,
      type: formData.type,
      parentId: formData.parentId || undefined,
      titleAr: formData.titleAr,
      titleEn: formData.titleEn,
      metaTitleAr: formData.metaTitleAr || undefined,
      metaTitleEn: formData.metaTitleEn || undefined,
      metaDescriptionAr: formData.metaDescriptionAr || undefined,
      metaDescriptionEn: formData.metaDescriptionEn || undefined,
      keywordsAr: formData.keywordsAr || undefined,
      keywordsEn: formData.keywordsEn || undefined,
      status: formData.status,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
      publishedAt: formData.publishedAt || undefined,
      qualityOverrideReason: formData.qualityOverrideReason.trim() || undefined,
    });
  };

  const handleDeletePage = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleDuplicatePage = (id: number) => {
    duplicateMutation.mutate({ id });
  };

  const openEditDialog = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      name: page.name,
      slug: page.slug,
      type: page.type,
      parentId: page.parentId,
      titleAr: page.titleAr,
      titleEn: page.titleEn,
      metaTitleAr: page.metaTitleAr,
      metaTitleEn: page.metaTitleEn,
      metaDescriptionAr: page.metaDescriptionAr,
      metaDescriptionEn: page.metaDescriptionEn,
      keywordsAr: page.keywordsAr,
      keywordsEn: page.keywordsEn,
      status: page.status,
      isActive: page.isActive,
      sortOrder: page.sortOrder,
      publishedAt: page.publishedAt,
      qualityOverrideReason: '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialPageFormData);
    setSelectedPage(null);
  };

  return {
    // State
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedPage,
    formData,
    qualityIssues,
    isAdmin,
    searchQuery,
    type,
    isActive,
    page,
    pages,
    pagination,
    mainPages,
    loadingPages,
    createMutation,
    updateMutation,
    deleteMutation,
    duplicateMutation,

    // Setters
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setSelectedPage,
    setFormData,
    setSearchQuery,
    setType,
    setIsActive,
    setPage,

    // Handlers
    handleCreatePage,
    handleEditPage,
    handleDeletePage,
    handleDuplicatePage,
    openEditDialog,
    resetForm,
    clearQualityIssues: () => setQualityIssues([]),
    refetch,
  };
}
